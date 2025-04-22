const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

module.exports = (parentRouter, db) => {
    const OrderModel = require("../models/OrderModel")(db);
    const OrderDetailsModel = require("../models/OrderDetailsModel")(db);
    const UserModel = require("../models/UserModel")(db);
    const EventModel = require("../models/EventModel")(db);
    const orderController = require("../controllers/orderController")(UserModel, EventModel, OrderModel, OrderDetailsModel);

    // Routes for orders
    router.post('/order/save', withAuth, orderController.createOrderAndCheckout);
    router.post('/order/payment', withAuth, orderController.payment);
    router.put('/order/:id/status', withAuth, orderController.updateStatus);
    router.get('/order/all', withAuth, orderController.getAllOrders);
    router.get('/order/:id', withAuth, orderController.getOneOrder);

    parentRouter.use('/', router);
};
