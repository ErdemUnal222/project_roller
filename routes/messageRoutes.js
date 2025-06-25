const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');
const noCache = require('../middleware/noCache');

const messageControllerFactory = require('../controllers/messageController');
const messageModelFactory = require('../models/MessageModel');

/**
 * Injects dependencies and defines all routes related to messaging.
 * @param {Router} parentRouter - The main application router.
 * @param {Object} db - The database connection.
 */
module.exports = (parentRouter, db) => {
  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // ✅ ADMIN ROUTE - get full list of all messages
  parentRouter.get('/messages', withAuthAdmin, messageController.getAllMessages);

  // ✅ ADMIN ROUTE - delete a specific message
  parentRouter.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage);

  // ✅ SUBROUTER FOR ALL AUTHENTICATED /messages/* ROUTES
  const subRouter = express.Router();

  subRouter.get('/inbox', withAuth, messageController.getUserInbox);
  subRouter.get('/:userId1/:userId2', withAuth, messageController.getMessagesBetweenUsers);
  subRouter.post('/mark-read', withAuth, messageController.markMessagesAsRead);
  subRouter.patch('/:messageId/read', withAuth, messageController.markMessageAsRead);
  subRouter.post('/', withAuth, messageController.sendMessage);

  // Mount all authenticated subroutes under /api/v1/messages/*
  parentRouter.use('/messages', subRouter);
};
