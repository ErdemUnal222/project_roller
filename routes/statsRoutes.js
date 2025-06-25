const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth'); // Middleware to protect the route
const statsControllerFactory = require('../controllers/statsController'); // Import the controller factory

/**
 * Register statistics-related routes
 * @param {Express.Router} parentRouter - The main router (usually /api/v1).
 * @param {Object} db - MySQL database connection instance.
 */
module.exports = (parentRouter, db) => {
  // Create a controller instance by injecting the DB into the factory
  const statsController = statsControllerFactory(db);

  /**
   * @route GET /stats/overview
   * @desc Get platform-wide statistics: total users, events, products, orders, and revenue
   * @access Protected (requires authentication)
   */
  router.get('/stats/overview', withAuth, statsController.getOverviewStats);

  // Register the routes into the parent router
  parentRouter.use('/', router);
};
