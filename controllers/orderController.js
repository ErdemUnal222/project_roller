module.exports = (UserModel, EventModel, OrderModel, OrderDetailsModel) => {
    
    const saveOrder = async (req, res) => {
    try {
        const { userId, totalAmount, totalProducts } = req.body;

        if (!userId || !totalAmount || !totalProducts) {
            return res.status(400).json({ status: 400, msg: "Missing required order data" });
        }

        const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
        if (order.code) {
            return res.status(500).json({ status: 500, msg: "Error saving order" });
        }

        res.status(201).json({ status: 201, msg: "Order saved successfully", orderId: order.insertId });
    } catch (err) {
        console.error("Error in saveOrder:", err);
        res.status(500).json({ status: 500, msg: "Unexpected error during order save" });
    }
};

// Delete an existing order
const deleteOrder = async (req, res) => {
    try {
        const deletion = await OrderModel.deleteOneOrder(req.params.id);
        if (deletion.code) {
            return res.status(500).json({ status: 500, msg: "Error deleting order" });
        }

        res.status(200).json({ status: 200, msg: "Order deleted successfully" });
    } catch (err) {
        console.error("Error in deleteOrder:", err);
        res.status(500).json({ status: 500, msg: "Unexpected error during order deletion" });
    }
};

    // Create a new order and initiate a Stripe Checkout session
    const createOrderAndCheckout = async (req, res) => {
        try {
            const { userId, totalAmount, items } = req.body;

            if (!userId || !totalAmount || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ status: 400, msg: "Missing order data or items" });
            }

            const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);

            const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
            if (order.code) {
                return res.status(500).json({ status: 500, msg: "Error saving order" });
            }

            const orderId = order.insertId;

            const detailResult = await OrderDetailsModel.addOrderDetails(orderId, items);
            if (detailResult.code) {
                return res.status(500).json({ status: 500, msg: "Error saving order details" });
            }

            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            }));

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: lineItems,
                metadata: {
                    orderId: orderId.toString()
                },
                success_url: 'http://ihsanerdemunal.ide.3wa.io:9500/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://ihsanerdemunal.ide.3wa.io:9500/cancel',
            });

            res.status(201).json({
                status: 201,
                msg: "Order created and Stripe session initiated",
                orderId,
                url: session.url
            });

        } catch (err) {
            console.error("Error in createOrderAndCheckout:", err);
            res.status(500).json({ status: 500, msg: "Unexpected error during order creation and checkout" });
        }
    };

    // Update the status of an existing order (e.g., 'paid', 'cancelled', etc.)
    const updateStatus = async (req, res) => {
        try {
            const order = await OrderModel.updateStatus(req.params.id, req.body.status);
            res.status(200).json({ status: 200, msg: "Order status updated successfully!" });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error updating order status" });
        }
    };

    // Retrieve all orders (typically for admin use)
    const getAllOrders = async (req, res) => {
        try {
            const orders = await OrderModel.getAllOrders();
            res.status(200).json({ status: 200, result: orders });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching orders" });
        }
    };

    // Retrieve a specific order and its items by order ID
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
            console.error("Error in getOneOrder:", err);
            res.status(500).json({ status: 500, msg: "Error retrieving order details" });
        }
    };

    // Placeholder for handling payment response
    const payment = async (req, res) => {
        try {
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
    payment,
    saveOrder,
    deleteOrder
};
};
