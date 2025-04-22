const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
    const AvailabilityModel = require("../models/AvailabilityModel")(db);
    const availabilityController = require("../controllers/availabilityController")(AvailabilityModel);

    router.post('/availability', withAuth, availabilityController.createAvailability);
    router.put('/availability/:id', withAuth, availabilityController.updateAvailability);
    router.delete('/availability/:id', withAuth, availabilityController.deleteAvailability);
    router.get('/availabilities', withAuthAdmin, availabilityController.getAllAvailabilities);
    router.get('/availability/user/:userId', withAuthAdmin, availabilityController.getAvailabilitiesByUser);

    parentRouter.use('/', router);
};