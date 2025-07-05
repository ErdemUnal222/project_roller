const stripe = require("../config/stripe"); // Import Stripe configuration

module.exports = (UserModel, EventModel, OrderModel, OrderDetailsModel) => {

  // SAVE a basic order without payment (optional fallback route)
  const saveOrder = async (req, res, next) => {
    try {
      const { userId, totalAmount, totalProducts } = req.body;

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

  // DELETE an order by its ID
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

  // CREATE an order, add all product details, and start Stripe Checkout
  const createOrderAndCheckout = async (req, res, next) => {
    try {
      const { userId, totalAmount, items } = req.body;

      if (!userId || !totalAmount || !Array.isArray(items) || items.length === 0) {
        return next({ status: 400, message: "Missing order data or items" });
      }

      const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
      const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
      if (order.code) {
        return next({ status: 500, message: "Error saving order" });
      }

      const orderId = order.insertId;

      const detailResult = await OrderDetailsModel.addOrderDetails(orderId, items);
      if (detailResult.code) {
        return next({ status: 500, message: "Error saving order details" });
      }

      // Create Stripe line items from cart
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), // Stripe expects prices in cents
        },
        quantity: item.quantity,
      }));

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

  // UPDATE an order's status (e.g., from 'pending' to 'paid')
  const updateStatus = async (req, res, next) => {
    try {
      await OrderModel.updateStatus(req.params.id, req.body.status);
      res.status(200).json({ status: 200, msg: "Order status updated successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // GET all orders (admin panel or order history)
  const getAllOrders = async (req, res, next) => {
    try {
      const orders = await OrderModel.getAllOrders();
      res.status(200).json({ status: 200, result: orders });
    } catch (err) {
      next(err);
    }
  };

  // GET one specific order with its items
  const getOneOrder = async (req, res, next) => {
    try {
      const order = await OrderModel.getOneOrder(req.params.id);
      if (order.code) return next({ status: order.code, message: order.message });

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

  // Placeholder route for payment (expandable for webhook use)
  const payment = async (req, res, next) => {
    try {
      res.status(200).json({ status: 200, msg: "Payment handled successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // Expose all controller methods
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
