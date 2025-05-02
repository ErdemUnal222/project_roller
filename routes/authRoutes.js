const express = require('express');
const router = express.Router();

module.exports = (parentRouter, db) => {
  const UserModel = require('../models/UserModel')(db);
  const authController = require('../controllers/authController')(UserModel);

  // Authentication routes
  router.post('/auth/signup', authController.saveUser);    // use saveUser
  router.post('/auth/login', authController.connectUser);  // use connectUser

  parentRouter.use('/', router);
};
