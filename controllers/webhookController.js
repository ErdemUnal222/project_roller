const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

module.exports = (OrderModel) => {
    const handleStripeWebhook = async (req, res) => {
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("❌ Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Gérer les événements pertinents
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                const result = await OrderModel.updateStatus(orderId, 'paid');
                console.log(`✅ Order #${orderId} marked as PAID via Stripe webhook.`);
            }
        }

        res.status(200).json({ received: true });
    };

    return {
        handleStripeWebhook
    };
};
