const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth');             // Middleware: only logged-in users
const withAuthAdmin = require('../middleware/withAuthAdmin');   // Middleware: admin-only access
const noCache = require('../middleware/noCache');               // Optional: disables browser caching

const messageControllerFactory = require('../controllers/messageController');
const messageModelFactory = require('../models/MessageModel');

/**
 * This file defines all routes related to user messaging.
 * It separates access based on user roles (admin vs authenticated users).
 */
module.exports = (parentRouter, db) => {
  // Create the model and controller by injecting the database
  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // Admin routes
  parentRouter.get('/messages', withAuthAdmin, messageController.getAllMessages);      // View all messages (for moderation)
  parentRouter.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage); // Admin deletes a message

  // Routes for authenticated users
  const subRouter = express.Router();

  subRouter.get('/inbox', withAuth, messageController.getUserInbox);                      // List user's conversations (1 message per thread)
  subRouter.get('/:userId1/:userId2', withAuth, messageController.getMessagesBetweenUsers); // Show full conversation between 2 users

  subRouter.post('/mark-read', withAuth, messageController.markMessagesAsRead);           // Mark all messages as read in a conversation
  subRouter.patch('/:messageId/read', withAuth, messageController.markMessageAsRead);     // Mark a specific message as read

  subRouter.post('/', withAuth, messageController.sendMessage);                           // Send a new message

  // Mount all user-level messaging routes under /messages
  parentRouter.use('/messages', subRouter);
};
