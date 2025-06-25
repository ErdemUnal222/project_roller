const express = require('express');
const router = express.Router();
const withAuthAdmin = require('../middleware/withAuthAdmin'); // Middleware to restrict access to admin users

module.exports = (parentRouter, db) => {
  // Load the model and controller with the provided database connection
  const AvailabilityModel = require('../models/AvailabilityModel')(db);
  const availabilityController = require('../controllers/availabilityController')(AvailabilityModel);

  // Administrative routes
  router.get('/availabilities', withAuthAdmin, availabilityController.getAllAvailabilities);
  router.get('/availabilities/user/:userId', withAuthAdmin, availabilityController.getAvailabilitiesByUser);

  // User-accessible routes
  router.post('/availabilities', availabilityController.createAvailability);
  router.put('/availabilities/:id', availabilityController.updateAvailability);
  router.delete('/availabilities/:id', availabilityController.deleteAvailability);

  parentRouter.use('/', router);
};
