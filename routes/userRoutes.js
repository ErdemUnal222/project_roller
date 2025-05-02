const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const userControllerFactory = require('../controllers/userController');
const userModelFactory = require('../models/UserModel');

module.exports = (parentRouter, db) => {
  const userModel = userModelFactory(db);
  const userController = userControllerFactory(userModel);

  // Public
  router.post('/register', userController.saveUser);
  router.post('/login', userController.connectUser);

  // Protected - /user/me MUST COME BEFORE /user/:id
  router.get('/user/me', withAuth, userController.getCurrentUser);

  router.get('/users', withAuth, userController.getAllUsers);
  router.get('/user/:id', withAuth, userController.getOneUser);
  router.put('/user/:id', withAuth, userController.updateUser);
  router.delete('/user/:id', withAuth, userController.deleteUser);

  router.post('/user/:id/upload', withAuth, (req, res) => {
    const uploadController = require('../controllers/uploadController');
    uploadController.uploadProfilePicture(req, res);
  });

  parentRouter.use('/', router);
};
