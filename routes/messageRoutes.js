const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth');         // Authenticated users
const withAuthAdmin = require('../middleware/withAuthAdmin'); // Admin-level access
const noCache = require('../middleware/noCache');           // Optional: disable caching

const messageControllerFactory = require('../controllers/messageController');
const messageModelFactory = require('../models/MessageModel');

/**
 * Defines all message-related routes with role-specific access.
 */
module.exports = (parentRouter, db) => {
  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // Admin-only: retrieve or delete messages
  parentRouter.get('/messages', withAuthAdmin, messageController.getAllMessages);
  parentRouter.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage);

  // Sub-router for authenticated user message actions
  const subRouter = express.Router();

  // User inbox view
  subRouter.get('/inbox', withAuth, messageController.getUserInbox);

  // Get conversation between two users
  subRouter.get('/:userId1/:userId2', withAuth, messageController.getMessagesBetweenUsers);

  // Mark messages as read
  subRouter.post('/mark-read', withAuth, messageController.markMessagesAsRead);
  subRouter.patch('/:messageId/read', withAuth, messageController.markMessageAsRead);

  // Send a message
  subRouter.post('/', withAuth, messageController.sendMessage);

  // Mount subroutes under /messages path
  parentRouter.use('/messages', subRouter);
};
