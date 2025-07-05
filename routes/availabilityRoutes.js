const express = require('express');
const router = express.Router();
const withAuthAdmin = require('../middleware/withAuthAdmin'); // Middleware to restrict access to admin users

module.exports = (parentRouter, db) => {
  // Load the model and controller with the provided database connection
  const AvailabilityModel = require('../models/AvailabilityModel')(db);
  const availabilityController = require('../controllers/availabilityController')(AvailabilityModel);

  // Admin-only routes
  router.get('/availabilities', withAuthAdmin, availabilityController.getAllAvailabilities);         // List all availabilities
  router.get('/availabilities/user/:userId', withAuthAdmin, availabilityController.getAvailabilitiesByUser); // View availability per user

  // Authenticated user routes
  router.post('/availabilities', availabilityController.createAvailability); // Create availability
  router.put('/availabilities/:id', availabilityController.updateAvailability); // Update own availability
  router.delete('/availabilities/:id', availabilityController.deleteAvailability); // Delete availability

  // Register routes under the main app router
  parentRouter.use('/', router);
};
