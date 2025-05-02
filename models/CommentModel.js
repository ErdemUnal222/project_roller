// Define the CommentModel class to handle all comment-related database operations
class CommentModel {
  constructor(db) {
    this.db = db;
  }

  // ➔ Add a new comment associated with a user and an event
 async addComment({ text, event_id, user_id }) {
  try {
    const result = await this.db.query(
      `INSERT INTO comments (content, event_id, user_id, created_at) VALUES (?, ?, ?, NOW())`,
      [text, event_id, user_id]
    );

    return {
      id: result.insertId,
      content: text,  // Keep returning as 'content' for frontend
      event_id,
      user_id,
      created_at: new Date()
    };
  } catch (error) {
    console.error("❌ addComment error:", error);
    throw error;
  }
}


  // ➔ Update an existing comment by ID and user
  async updateComment(commentId, userId, text) {
    try {
      const result = await this.db.query(
        `UPDATE comments SET text = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
        [text, commentId, userId]
      );
      return result;
    } catch (err) {
      console.error("❌ Error updating comment:", err);
      throw err;
    }
  }

  // ➔ Delete a comment by ID and user
  async deleteComment(commentId, userId) {
    try {
      const result = await this.db.query(
        `DELETE FROM comments WHERE id = ? AND user_id = ?`,
        [commentId, userId]
      );
      return result;
    } catch (err) {
      console.error("❌ Error deleting comment:", err);
      throw err;
    }
  }

  // ✅ This is the one your controller expects: getByEvent
  async getByEvent(eventId) {
    try {
      const result = await this.db.query(
        `SELECT comments.*, CONCAT(users.firstName, ' ', users.lastName) AS name
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE comments.event_id = ?
         ORDER BY comments.created_at DESC`,
        [eventId]
      );
      return result;
    } catch (err) {
      console.error("❌ Error in getByEvent:", err);
      throw err;
    }
  }

  // ➔ Get comments by product
  async getCommentsByProduct(productId) {
    try {
      const result = await this.db.query(
        `SELECT comments.*, CONCAT(users.firstName, ' ', users.lastName) AS name
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE comments.product_id = ?
         ORDER BY comments.created_at DESC`,
        [productId]
      );
      return result;
    } catch (err) {
      console.error("❌ Error retrieving product comments:", err);
      throw err;
    }
  }

  // ➔ Admin: get all comments
  async getAllComments() {
    try {
      const result = await this.db.query(
        `SELECT comments.*, CONCAT(users.firstName, ' ', users.lastName) AS name
         FROM comments
         JOIN users ON comments.user_id = users.id
         ORDER BY comments.created_at DESC`
      );
      return result;
    } catch (err) {
      console.error("❌ Error retrieving all comments:", err);
      throw err;
    }
  }
}

// Export the factory
module.exports = (db) => new CommentModel(db);
