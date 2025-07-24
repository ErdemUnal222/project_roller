const stripe = require("../config/stripe"); // Stripe instance with API key

module.exports = (OrderModel, OrderDetailsModel, ProductModel) => {  // Added ProductModel here

  // Save order without Stripe payment (manual save)
  const saveOrder = async (req, res, next) => {
    try {
      const { userId, totalAmount, totalProducts } = req.body;
      if (!userId || !totalAmount || !totalProducts) {
        return next({ status: 400, message: "Missing required order data" });
      }
      const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
      if (order.code) return next({ status: 500, message: "Error saving order" });

      res.status(201).json({ status: 201, msg: "Order saved successfully", orderId: order.insertId });
    } catch (err) {
      next(err);
    }
  };

  // Delete order by ID
  const deleteOrder = async (req, res, next) => {
    try {
      const deletion = await OrderModel.deleteOneOrder(req.params.id);
      if (deletion.code) return next({ status: 500, message: "Error deleting order" });

      res.status(200).json({ status: 200, msg: "Order deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
  const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.getAllOrders(); // assuming orderModel has this method
    res.status(200).json({ result: orders });
  } catch (err) {
    next(err);
  }
};


  // Full checkout: create order, save details, update stock, launch Stripe checkout session
  const createOrderAndCheckout = async (req, res, next) => {
    try {
      const { userId, totalAmount, items } = req.body;

      if (!userId || !totalAmount || !Array.isArray(items) || items.length === 0) {
        return next({ status: 400, message: "Missing order data or items" });
      }

      console.log("Received items for order:", items); // Debug log

      const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);

      // Save order metadata
      const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
      if (order.code) return next({ status: 500, message: "Error saving order" });

      const orderId = order.insertId;

      // Save product details linked to the order
      console.log("Saving order details for orderId:", orderId, "items:", items);
      const detailResult = await OrderDetailsModel.addOrderDetails(orderId, items);
      console.log("Result of addOrderDetails:", detailResult);
      if (detailResult.code) return next({ status: 500, message: "Error saving order details" });

      // Decrement stock for each product
      for (const item of items) {
        try {
          await ProductModel.decrementStock(item.productId, item.quantity);
        } catch (stockErr) {
          console.error(`Failed to update stock for product ${item.productId}:`, stockErr);
          // Optionally you could rollback transaction here or return an error
          // For now, just log and continue
        }
      }

      // Format data for Stripe Checkout session
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        metadata: { orderId: orderId.toString() },
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
      next(err);
    }
  };

  // Update order status
/**
 * Admin: Update the status of an existing order
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status field is required." });
    }

    const updated = await orderModel.updateOrderStatus(orderId, status);

    if (!updated) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order status updated successfully." });
  } catch (err) {
    next(err);
  }
};

  // Get one order with details
const getOneOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.getOneOrder(req.params.id);
    if (order.code) return next({ status: order.code, message: order.message });

    // Make sure order exists
    if (!order[0]) {
      return next({ status: 404, message: "Order not found" });
    }

    // Check that the user owns the order
    if (order[0].user_id !== req.user.id && !req.user.is_admin) {
      return next({ status: 403, message: "Unauthorized to access this order" });
    }

    const items = await OrderDetailsModel.getOrderDetailsByOrderId(req.params.id);
    if (items.code) return next({ status: items.code, message: items.message });

    res.status(200).json({
      status: 200,
      result: {
        ...order[0],
        items
      }
    });
  } catch (err) {
    next(err);
  }
};


  // Payment success handler (placeholder)
  const payment = async (req, res, next) => {
    try {
      res.status(200).json({ status: 200, msg: "Payment handled successfully!" });
    } catch (err) {
      next(err);
    }
  };

  return {
    createOrderAndCheckout,
    updateOrderStatus,
    getAllOrders,
    getOneOrder,
    payment,
    saveOrder,
    deleteOrder
  };
};
