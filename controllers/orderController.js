const stripe = require("../config/stripe");

module.exports = (UserModel, EventModel, OrderModel, OrderDetailsModel) => {

  // SAVE a basic order (without payment)
  const saveOrder = async (req, res, next) => {
    try {
      const { userId, totalAmount, totalProducts } = req.body;

      // Validate input
      if (!userId || !totalAmount || !totalProducts) {
        return next({ status: 400, message: "Missing required order data" });
      }

      const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
      if (order.code) {
        return next({ status: 500, message: "Error saving order" });
      }

      res.status(201).json({ status: 201, msg: "Order saved successfully", orderId: order.insertId });
    } catch (err) {
      next(err);
    }
  };

  // DELETE an order by ID
  const deleteOrder = async (req, res, next) => {
    try {
      const deletion = await OrderModel.deleteOneOrder(req.params.id);
      if (deletion.code) {
        return next({ status: 500, message: "Error deleting order" });
      }

      res.status(200).json({ status: 200, msg: "Order deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  // CREATE an order, save details, and initiate Stripe checkout session
  const createOrderAndCheckout = async (req, res, next) => {
    try {
      const { userId, totalAmount, items } = req.body;

      // Validate input
      if (!userId || !totalAmount || !Array.isArray(items) || items.length === 0) {
        return next({ status: 400, message: "Missing order data or items" });
      }

      // Calculate total product quantity
      const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);

      // Save the order
      const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
      if (order.code) {
        return next({ status: 500, message: "Error saving order" });
      }

      const orderId = order.insertId;

      // Save all order item details
      const detailResult = await OrderDetailsModel.addOrderDetails(orderId, items);
      if (detailResult.code) {
        return next({ status: 500, message: "Error saving order details" });
      }

      // Prepare Stripe line items
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      }));

      // Create a Stripe checkout session
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

  // UPDATE the status of an order (e.g., from "pending" to "paid")
  const updateStatus = async (req, res, next) => {
    try {
      const order = await OrderModel.updateStatus(req.params.id, req.body.status);
      res.status(200).json({ status: 200, msg: "Order status updated successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // GET all orders (admin view or user history)
  const getAllOrders = async (req, res, next) => {
    try {
      const orders = await OrderModel.getAllOrders();
      res.status(200).json({ status: 200, result: orders });
    } catch (err) {
      next(err);
    }
  };

  // GET one order by ID, with its item details
  const getOneOrder = async (req, res, next) => {
    try {
      const order = await OrderModel.getOneOrder(req.params.id);
      if (order.code) {
        return next({ status: order.code, message: order.message });
      }

      const items = await OrderDetailsModel.getOrderDetailsByOrderId(req.params.id);
      if (items.code) {
        return next({ status: items.code, message: items.message });
      }

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

  // Placeholder for payment hook or response
  const payment = async (req, res, next) => {
    try {
      res.status(200).json({ status: 200, msg: "Payment handled successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // Expose controller methods
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
