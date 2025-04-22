const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

module.exports = (parentRouter, db) => {
    const StatsController = require("../controllers/statsController");
    const UserModel = require("../models/UserModel")(db);
    const EventModel = require("../models/EventModel")(db);
    const OrderModel = require("../models/OrderModel")(db);

    const statsController = StatsController(UserModel, EventModel, OrderModel);

    router.get('/stats/overview', withAuth, statsController.getOverviewStats);

    parentRouter.use('/', router);
};
