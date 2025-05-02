const express = require('express');
const router = express.Router();
const webhookControllerFactory = require('../controllers/webhookController');
const orderModelFactory = require('../models/OrderModel');

module.exports = (parentRouter, db) => {
  const orderModel = orderModelFactory(db);
  const webhookController = webhookControllerFactory(orderModel);

  router.post('/webhook/stripe', webhookController.handleStripeWebhook);

  parentRouter.use('/', router);
};
