const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

// Import model and controller factories
const orderControllerFactory = require('../controllers/orderController');
const orderModelFactory = require('../models/OrderModel');
const orderDetailsModelFactory = require('../models/OrderDetailsModel');

/**
 * Set up all order-related routes and inject database dependency.
 * @param {Express.Router} parentRouter - The main application router.
 * @param {Object} db - The MySQL database connection.
 */
module.exports = (parentRouter, db) => {
  const orderModel = orderModelFactory(db);
  const orderDetailsModel = orderDetailsModelFactory(db);
  const orderController = orderControllerFactory(orderModel, orderDetailsModel);

  // Standard CRUD operations
  router.get('/orders', withAuth, orderController.getAllOrders);
  router.get('/orders/:id', withAuth, orderController.getOneOrder);
  router.post('/orders', withAuth, orderController.saveOrder);
  router.delete('/orders/:id', withAuth, orderController.deleteOrder);

  // Stripe checkout-related endpoints
  router.post('/orders/checkout', withAuth, orderController.createOrderAndCheckout);
  router.post('/orders/payment', withAuth, orderController.payment);

  // Mount to parent router
  parentRouter.use('/', router);
};
