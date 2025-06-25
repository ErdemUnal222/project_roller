// Exporting a function that takes CommentModel (data access layer) as input
module.exports = (CommentModel) => {

  // ADD a comment to a specific event
  const addComment = async (req, res, next) => {
    try {
      const { eventId } = req.params;        // Event ID from route
      const { text } = req.body;             // Comment content
      const userId = req.user.id;            // Authenticated user ID

      // Validate input
      if (!text) {
        return next({ status: 400, message: "Text is required" });
      }

      // Add the comment to the database
      const newComment = await CommentModel.addComment({
        text,
        event_id: eventId,
        user_id: userId,
      });

      res.status(201).json({ status: 201, comment: newComment });
    } catch (error) {
      next(error); // Forward error to centralized error handler
    }
  };

  // UPDATE a comment by ID
  const updateComment = async (req, res, next) => {
    try {
      const { content } = req.body;

      // Validate content
      if (!content) {
        return next({ status: 400, message: "Updated content is required" });
      }

      // Update the comment, only if the authenticated user owns it
      const result = await CommentModel.updateComment(
        req.params.id,       // Comment ID
        req.user.id,         // User ID
        content
      );

      res.status(200).json({ status: 200, msg: "Comment updated successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // DELETE a comment by ID
  const deleteComment = async (req, res, next) => {
    try {
      // Delete comment, ensuring user owns it
      const result = await CommentModel.deleteComment(
        req.params.id,
        req.user.id
      );

      res.status(200).json({ status: 200, msg: "Comment deleted successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // GET all comments related to a specific event
  const getByEvent = async (req, res, next) => {
    try {
      const eventId = req.params.eventId;
      const comments = await CommentModel.getByEvent(eventId);
      res.status(200).json({ status: 200, result: comments });
    } catch (err) {
      next(err);
    }
  };

  // GET all comments related to a specific product
  const getByProduct = async (req, res, next) => {
    try {
      const result = await CommentModel.getCommentsByProduct(req.params.productId);
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // GET all comments in the system (admin or general purpose)
  const getAllComments = async (req, res, next) => {
    try {
      const result = await CommentModel.getAllComments();
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // Export all controller functions
  return {
    addComment,
    updateComment,
    deleteComment,
    getByEvent,
    getByProduct,
    getAllComments
  };
};
