const express = require('express');
const router = express.Router();
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
  const AvailabilityModel = require('../models/AvailabilityModel')(db);
  const availabilityController = require('../controllers/availabilityController')(AvailabilityModel);

  // RESTful Availability Routes
  router.get('/availabilities', withAuthAdmin, availabilityController.getAllAvailabilities);       // Admin: get all
  router.get('/availabilities/user/:userId', withAuthAdmin, availabilityController.getAvailabilitiesByUser); // Admin: get by user
  router.post('/availabilities', availabilityController.createAvailability);  // User: create availability
  router.put('/availabilities/:id', availabilityController.updateAvailability); // User: update availability
  router.delete('/availabilities/:id', availabilityController.deleteAvailability); // User: delete availability

  parentRouter.use('/', router);
};
