const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth'); // Ensuring the user is authenticated
const statsControllerFactory = require('../controllers/statsController'); // Importing stats controller

// Export a function that receives parentRouter and db
module.exports = (parentRouter, db) => {
  const statsController = statsControllerFactory(db); // Creating an instance of the controller

  // Route to retrieve the overview stats (total users, events, products, orders, revenue)
  router.get('/stats/overview', withAuth, statsController.getOverviewStats); // GET /api/v1/stats/overview

  // Mount the stats route on the parent router
  parentRouter.use('/', router);
};
