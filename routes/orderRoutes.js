const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth'); // Only logged-in users can access orders

// Load controller and model factories
const orderControllerFactory = require('../controllers/orderController');
const orderModelFactory = require('../models/OrderModel');
const orderDetailsModelFactory = require('../models/OrderDetailsModel');

/**
 * Defines order-related routes and injects database dependency.
 */
module.exports = (parentRouter, db) => {
  const orderModel = orderModelFactory(db);
  const orderDetailsModel = orderDetailsModelFactory(db);
  const orderController = orderControllerFactory(orderModel, orderDetailsModel);

  // Core CRUD routes for managing orders
  router.get('/orders', withAuth, orderController.getAllOrders);         // Get all orders for the logged-in user
  router.get('/orders/:id', withAuth, orderController.getOneOrder);      // Get a specific order
  router.post('/orders', withAuth, orderController.saveOrder);           // Create a new order manually
  router.delete('/orders/:id', withAuth, orderController.deleteOrder);   // Delete an order

  // Stripe checkout integration
  router.post('/orders/checkout', withAuth, orderController.createOrderAndCheckout); // Create order and generate Stripe session
  router.post('/orders/payment', withAuth, orderController.payment);                 // Confirm payment on success

  // Mount these routes on the main app
  parentRouter.use('/', router);
};
