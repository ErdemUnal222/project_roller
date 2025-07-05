const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET); // Initialize Stripe with secret key

module.exports = (OrderModel) => {

  // HANDLE Stripe webhook for completed payment
  const handleStripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature']; // Signature sent by Stripe
    let event;

    try {
      // Verify and reconstruct the Stripe event using the raw request body
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      // Signature mismatch or tampered request
      return next({ status: 400, message: `Webhook Error: ${err.message}` });
    }

    // Handle successful payment completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Retrieve our internal order ID from metadata
      const orderId = session.metadata && session.metadata.orderId;

      if (orderId) {
        try {
          // Mark the order as paid in our own database
          await OrderModel.updateStatus(orderId, 'paid');
        } catch (err) {
          return next({ status: 500, message: `Failed to update order #${orderId} status` });
        }
      }
    }

    // Always return 200 to acknowledge the webhook
    res.status(200).json({ received: true });
  };

  // Export the webhook handler function
  return {
    handleStripeWebhook
  };
};
