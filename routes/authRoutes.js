const express = require('express');
const router = express.Router();

// Import controller and model factory functions
const userControllerFactory = require('../controllers/userController');
const userModelFactory = require('../models/UserModel');

/**
 * Define authentication-related routes and inject dependencies.
 * @param {object} parentRouter - The main application router.
 * @param {object} db - MySQL database connection instance.
 */
module.exports = (parentRouter, db) => {
  const userModel = userModelFactory(db);
  const userController = userControllerFactory(userModel);

  // Public endpoint for user login
  router.post('/auth/login', userController.connectUser);

  // Attach routes to the parent application router
  parentRouter.use('/', router);

  console.log("Authentication routes loaded");
};
