module.exports = (CommentModel) => {
  // ➔ Create a new comment
  const addComment = async (req, res) => {
    try {
      const { eventId } = req.params;   // get eventId from URL
      const { text } = req.body;        // get comment text from body
      const userId = req.user.id;       // get userId from JWT

      if (!text) {
        return res.status(400).json({ status: 400, msg: "Text is required" });
      }

      const newComment = await CommentModel.addComment({
        text,
        event_id: eventId,
        user_id: userId,
      });

      res.status(201).json({ status: 201, comment: newComment });
    } catch (error) {
      console.error("❌ Error in addComment:", error);
      res.status(500).json({ status: 500, msg: "Failed to add comment" });
    }
  };

  // ➔ Update an existing comment
  const updateComment = async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ status: 400, msg: "Updated content is required" });
      }

      const result = await CommentModel.updateComment(
        req.params.id,
        req.user.id,
        content
      );

      res.status(200).json({ status: 200, msg: "Comment updated successfully", result });
    } catch (err) {
      console.error("Error in updateComment:", err);
      res.status(500).json({ status: 500, msg: "Server error while updating comment" });
    }
  };

  // ➔ Delete a comment
  const deleteComment = async (req, res) => {
    try {
      const result = await CommentModel.deleteComment(
        req.params.id,
        req.user.id
      );

      res.status(200).json({ status: 200, msg: "Comment deleted successfully", result });
    } catch (err) {
      console.error("Error in deleteComment:", err);
      res.status(500).json({ status: 500, msg: "Server error while deleting comment" });
    }
  };

  // ➔ Get comments for a specific event
  const getByEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const comments = await CommentModel.getByEvent(eventId);
    res.status(200).json({ status: 200, result: comments });
  } catch (err) {
    console.error("❌ Error in getByEvent:", err); // Add this line
    res.status(500).json({ status: 500, msg: "Failed to fetch comments" });
  }
};


  // ➔ Get comments for a specific product
  const getByProduct = async (req, res) => {
    try {
      const result = await CommentModel.getCommentsByProduct(req.params.productId);
      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error("Error in getByProduct:", err);
      res.status(500).json({ status: 500, msg: "Server error while fetching product comments" });
    }
  };

  // ➔ Get all comments (admin only)
  const getAllComments = async (req, res) => {
    try {
      const result = await CommentModel.getAllComments();
      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error("Error in getAllComments:", err);
      res.status(500).json({ status: 500, msg: "Server error while fetching all comments" });
    }
  };

  // ✅ Export all controller functions
  return {
    addComment,
    updateComment,
    deleteComment,
    getByEvent,
    getByProduct,
    getAllComments
  };
};
