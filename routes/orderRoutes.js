const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const orderControllerFactory = require('../controllers/orderController');
const orderModelFactory = require('../models/OrderModel');
const orderDetailsModelFactory = require('../models/OrderDetailsModel');

module.exports = (parentRouter, db) => {
  const orderModel = orderModelFactory(db);
  const orderDetailsModel = orderDetailsModelFactory(db);
  const orderController = orderControllerFactory(orderModel, orderDetailsModel);

  router.get('/orders', withAuth, orderController.getAllOrders);
  router.get('/orders/:id', withAuth, orderController.getOneOrder);
  router.post('/orders', withAuth, orderController.saveOrder); // ← make sure this exists in your controller
  router.delete('/orders/:id', withAuth, orderController.deleteOrder); // ← same here

  router.post('/orders/checkout', withAuth, orderController.createOrderAndCheckout);
  router.post('/orders/payment', withAuth, orderController.payment);

  parentRouter.use('/', router);
};
