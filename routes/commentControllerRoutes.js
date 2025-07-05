const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');           // Middleware for authenticated users
const withAuthAdmin = require('../middleware/withAuthAdmin'); // Middleware for admin users

module.exports = (parentRouter, db) => {
  // Load the model and controller with dependency injection
  const CommentModel = require('../models/CommentModel')(db);
  const commentController = require('../controllers/commentController')(CommentModel);

  // Admin-only: retrieve all comments
  router.get('/comments', withAuthAdmin, commentController.getAllComments);

  // Public: get comments related to a product
  router.get('/comments/product/:productId', commentController.getByProduct);

  // Public: get all comments related to an event
  router.get('/comments/event/:eventId', commentController.getByEvent);

  // Authenticated user: post a comment under an event
  router.post('/comments/event/:eventId', withAuth, commentController.addComment);

  // Authenticated user: update or delete their own comment
  router.put('/comments/:id', withAuth, commentController.updateComment);
  router.delete('/comments/:id', withAuth, commentController.deleteComment);

  // Mount this router on the main application router
  parentRouter.use('/', router);
};
