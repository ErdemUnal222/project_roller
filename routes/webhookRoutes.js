const express = require('express');
const router = express.Router();

// Controller and model factories
const webhookControllerFactory = require('../controllers/webhookController');
const orderModelFactory = require('../models/OrderModel');

/**
 * Mount the Stripe webhook handler route.
 * @param {Express.Router} parentRouter - Main app router (e.g., /api/v1)
 * @param {Object} db - MySQL database connection instance
 */
module.exports = (parentRouter, db) => {
  const orderModel = orderModelFactory(db);                         // Inject db into OrderModel
  const webhookController = webhookControllerFactory(orderModel);  // Inject model into controller

  // Stripe webhook route (expects raw body for signature verification)
  router.post('/webhook/stripe', webhookController.handleStripeWebhook);

  // Mount this router under the parent
  parentRouter.use('/', router);
};
