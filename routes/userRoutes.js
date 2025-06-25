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

/**
 * Mounts all user- and message-related routes.
 * @param {Express.Router} parentRouter - Main app router (e.g., /api/v1)
 * @param {Object} db - MySQL connection
 */
module.exports = (parentRouter, db) => {
  // Instantiate models & controllers with DB
  const userModel = userModelFactory(db);
  const userController = userControllerFactory(userModel);

  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // ---------- PUBLIC ROUTES ----------
  router.post('/register', userController.saveUser);
  router.post('/login', userController.connectUser);

  // ---------- AUTHENTICATED USER ROUTES ----------
  router.get('/me', withAuth, userController.getCurrentUser);
  router.get('/user/:id', withAuth, userController.getOneUser);
  router.put('/user/:id', withAuth, userController.updateUser);
  router.delete('/user/:id', withAuth, userController.deleteUser);
  router.post('/user/:id/upload', withAuth, userController.uploadProfilePicture);

  // ---------- SHARED ROUTE ----------
  // Needed for message recipient lists
  router.get('/users', withAuth, userController.getAllUsers);

  // ---------- ADMIN ROUTES ----------
  router.put('/admin/user/:id', withAuthAdmin, userController.updateUser);          // Edit any user
  router.delete('/admin/user/:id', withAuthAdmin, userController.deleteUser);       // Delete any user
  router.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage); // Delete any message

  // Mount everything under parent
  parentRouter.use('/', router);

  console.log("✅ userRoutes loaded");
};
