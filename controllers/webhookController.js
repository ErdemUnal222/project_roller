// Import Stripe and initialize it using the secret key from environment variables
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

module.exports = (OrderModel) => {

  // Handle incoming Stripe webhook events
  const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Construct and verify the Stripe event
      event = stripe.webhooks.constructEvent(
        req.rawBody,               // IMPORTANT: make sure Express parses raw body for this route
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Stripe webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific event types
    if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const orderId = session.metadata && session.metadata.orderId;

  if (orderId) {
    try {
      await OrderModel.updateStatus(orderId, 'paid');
      console.log(`✅ Order #${orderId} marked as PAID via Stripe webhook.`);
    } catch (err) {
      console.error(`❌ Failed to update order #${orderId} status:`, err);
    }
  }
}

    // Always respond to acknowledge receipt
    res.status(200).json({ received: true });
  };

  // Export handler
  return {
    handleStripeWebhook
  };
};
