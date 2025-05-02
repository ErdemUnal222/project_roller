const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
  const CommentModel = require('../models/CommentModel')(db);
  const commentController = require('../controllers/commentController')(CommentModel);

  // 🔒 Admin routes (unchanged)
  router.get('/comments', withAuthAdmin, commentController.getAllComments);
  router.get('/comments/product/:productId', commentController.getByProduct);

  // ✅ Public / Authenticated Event comment routes
  router.get('/comments/event/:eventId', commentController.getByEvent);           // Get comments for an event
  router.post('/comments/event/:eventId', withAuth, commentController.addComment); // Add a new comment to an event

  // 🔧 Optional update/delete routes (can also be protected)
  router.put('/comments/:id', withAuth, commentController.updateComment);
  router.delete('/comments/:id', withAuth, commentController.deleteComment);

  // Mount to parent router
  parentRouter.use('/', router);
};
