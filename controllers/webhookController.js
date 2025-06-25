const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

module.exports = (OrderModel) => {

  // HANDLE Stripe webhook for completed payment
  const handleStripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Verify and reconstruct the event from the raw request body
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return next({ status: 400, message: `Webhook Error: ${err.message}` });
    }

    // Respond to a successful Stripe Checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Retrieve the internal order ID from the Stripe session metadata
      const orderId = session.metadata && session.metadata.orderId;

      if (orderId) {
        try {
          // Update the order status to 'paid' in your system
          await OrderModel.updateStatus(orderId, 'paid');
        } catch (err) {
          return next({ status: 500, message: `Failed to update order #${orderId} status` });
        }
      }
    }

    // Acknowledge receipt of the webhook
    res.status(200).json({ received: true });
  };

  // Expose webhook handler
  return {
    handleStripeWebhook
  };
};
