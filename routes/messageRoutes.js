// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const messageControllerFactory = require('../controllers/messageController');
const messageModelFactory = require('../models/MessageModel');

// Export a function that receives parentRouter and db
module.exports = (parentRouter, db) => {
  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // All routes below are protected
  router.post('/messages', withAuth, messageController.sendMessage);
router.get('/messages/:user1Id/:user2Id', withAuth, messageController.getMessagesBetweenUsers);
router.patch('/messages/:messageId/read', withAuth, messageController.markMessageAsRead);


  parentRouter.use('/', router);
};
