const express = require('express');
const router = express.Router();

// Import middleware to restrict certain routes to admin users only
const withAuthAdmin = require('../middleware/withAuthAdmin'); 

/**
 * Define availability-related routes and inject the database dependency.
 * @param {object} parentRouter - The main router from the app, where these routes will be attached.
 * @param {object} db - MySQL database connection instance used to access availability data.
 */
module.exports = (parentRouter, db) => {
  // Load the Availability model by injecting the database connection
  const AvailabilityModel = require('../models/AvailabilityModel')(db);

  // Load the Availability controller, passing the model as dependency
  const availabilityController = require('../controllers/availabilityController')(AvailabilityModel);

  // --- ADMIN-ONLY ROUTES (Require authentication and admin role) ---

  /**
   * GET /availabilities
   * - Admin route to fetch all availability entries in the system
   */
  router.get('/availabilities', withAuthAdmin, availabilityController.getAllAvailabilities);

  /**
   * GET /availabilities/user/:userId
   * - Admin route to view all availabilities linked to a specific user
   */
  router.get('/availabilities/user/:userId', withAuthAdmin, availabilityController.getAvailabilitiesByUser);

  // --- AUTHENTICATED USER ROUTES (accessible to normal logged-in users via frontend) ---

  /**
   * POST /availabilities
   * - Allows a logged-in user to declare a new availability period
   */
  router.post('/availabilities', availabilityController.createAvailability);

  /**
   * PUT /availabilities/:id
   * - Allows a user to modify their own availability entry by ID
   */
  router.put('/availabilities/:id', availabilityController.updateAvailability);

  /**
   * DELETE /availabilities/:id
   * - Allows a user to delete one of their availability entries
   */
  router.delete('/availabilities/:id', availabilityController.deleteAvailability);

  // Attach this sub-router to the main application router
  parentRouter.use('/', router);
};
