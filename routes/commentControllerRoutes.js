const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
  const CommentModel = require('../models/CommentModel')(db);
  const commentController = require('../controllers/commentController')(CommentModel);

  console.log("Comment routes initialized");

  // Admin-only routes
  router.get('/comments', withAuthAdmin, commentController.getAllComments);                // Get all comments
  router.get('/comments/product/:productId', commentController.getByProduct);              // Get comments by product

  // Public and authenticated routes for event comments
  router.get('/comments/event/:eventId', commentController.getByEvent);                    // Get comments by event
  router.post('/comments/event/:eventId', withAuth, commentController.addComment);         // Add comment to event

  // Authenticated user actions on their own comments
  router.put('/comments/:id', withAuth, commentController.updateComment);                  // Update comment
  router.delete('/comments/:id', withAuth, commentController.deleteComment);               // Delete comment

  // Register this sub-router to the main app
  parentRouter.use('/', router);
};
