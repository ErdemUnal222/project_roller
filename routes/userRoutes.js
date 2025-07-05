const express = require('express');
const router = express.Router();

// Middleware
const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

// Factories (Models + Controllers)
const userModelFactory = require('../models/UserModel');
const userControllerFactory = require('../controllers/userController');
const messageModelFactory = require('../models/MessageModel');
const messageControllerFactory = require('../controllers/messageController');

module.exports = (parentRouter, db) => {
  const userModel = userModelFactory(db);
  const userController = userControllerFactory(userModel);

  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // Public routes
  router.post('/register', userController.saveUser);       // User registration
  router.post('/login', userController.connectUser);       // User login

  // Authenticated user routes
  router.get('/me', withAuth, userController.getCurrentUser);           // Get own profile
  router.get('/user/:id', withAuth, userController.getOneUser);         // Get another user by ID
  router.put('/user/:id', withAuth, userController.updateUser);         // Update own info
  router.delete('/user/:id', withAuth, userController.deleteUser);      // Delete own account
  router.post('/user/:id/upload', withAuth, userController.uploadProfilePicture); // Upload avatar

  // Shared (authenticated) route
  router.get('/users', withAuth, userController.getAllUsers); // Needed for user list (e.g., messaging)

  // Admin-only routes
  router.put('/admin/user/:id', withAuthAdmin, userController.updateUser);           // Admin edits user
  router.delete('/admin/user/:id', withAuthAdmin, userController.deleteUser);        // Admin deletes user
  router.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage); // Admin deletes message

  // Mount onto parent
  parentRouter.use('/', router);

};
