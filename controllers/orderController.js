// orderController.js

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

module.exports = (UserModel, EventModel, OrderModel, OrderDetailsModel) => {

    // Combined: create order + Stripe checkout session
    const createOrderAndCheckout = async (req, res) => {
        try {
            const { userId, totalAmount, items } = req.body;

            if (!userId || !totalAmount || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ status: 400, msg: "Missing order data or items" });
            }

            // Save order
            const order = await OrderModel.saveOneOrder(userId, totalAmount);
            if (order.code) {
                return res.status(500).json({ status: 500, msg: "Error saving order" });
            }

            const orderId = order.insertId;

            // Save order details
            const detailResult = await OrderDetailsModel.addOrderDetails(orderId, items);
            if (detailResult.code) {
                return res.status(500).json({ status: 500, msg: "Error saving order details" });
            }

            // Stripe line items
            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            }));

            // Create Stripe session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: lineItems,
                metadata: {
                    orderId: orderId.toString()
                },
                success_url: 'http://localhost:9500/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://localhost:9500/cancel',
            });

            res.status(201).json({
                status: 201,
                msg: "Order created and Stripe session initiated",
                orderId,
                url: session.url
            });
        } catch (err) {
            console.error("❌ Error in createOrderAndCheckout:", err);
            res.status(500).json({ status: 500, msg: "Unexpected error during order creation and checkout" });
        }
    };

    // Update order status manually or via webhook
    const updateStatus = async (req, res) => {
        try {
            const order = await OrderModel.updateStatus(req.params.id, req.body.status);
            res.status(200).json({ status: 200, msg: "Order status updated successfully!" });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error updating order status" });
        }
    };

    // Get all orders
    const getAllOrders = async (req, res) => {
        try {
            const orders = await OrderModel.getAllOrders();
            res.status(200).json({ status: 200, result: orders });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching orders" });
        }
    };

    // Get one order with details
    const getOneOrder = async (req, res) => {
        try {
            const order = await OrderModel.getOneOrder(req.params.id);
            if (order.code) {
                return res.status(order.code).json({ status: order.code, msg: order.message });
            }

            const items = await OrderDetailsModel.getOrderDetailsByOrderId(req.params.id);
            if (items.code) {
                return res.status(items.code).json({ status: items.code, msg: items.message });
            }

            res.status(200).json({
                status: 200,
                result: {
                    ...order[0],
                    items
                }
            });
        } catch (err) {
            console.error("❌ Error in getOneOrder:", err);
            res.status(500).json({ status: 500, msg: "Error retrieving order details" });
        }
    };

    // Handle payment (if needed)
    const payment = async (req, res) => {
        try {
            // Implement payment logic here
            res.status(200).json({ status: 200, msg: "Payment handled successfully!" });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error handling payment" });
        }
    };

    return {
        createOrderAndCheckout,
        updateStatus,
        getAllOrders,
        getOneOrder,
        payment // Add the payment method here
    };
};
