// Define the CommentModel class to handle all comment-related database operations
class CommentModel {
  constructor(db) {
    this.db = db; // Store the DB connection
  }

  // CREATE: Add a new comment linked to a user and event
  async addComment({ text, event_id, user_id }) {
    try {
      const result = await this.db.query(
        `INSERT INTO comments (content, event_id, user_id, created_at) VALUES (?, ?, ?, NOW())`,
        [text, event_id, user_id]
      );

      // Return a comment object to use directly in the frontend
      return {
        id: result.insertId,
        content: text,
        event_id,
        user_id,
        created_at: new Date()
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // UPDATE: Modify a comment's text by ID and user ID (ownership enforcement)
  async updateComment(commentId, userId, text) {
    try {
      const result = await this.db.query(
        `UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
        [text, commentId, userId]
      );
      return result;
    } catch (err) {
      console.error("Error updating comment:", err);
      throw err;
    }
  }

  // DELETE: Remove a comment by ID and user ID (user must be the owner)
  async deleteComment(commentId, userId) {
    try {
      const result = await this.db.query(
        `DELETE FROM comments WHERE id = ? AND user_id = ?`,
        [commentId, userId]
      );
      return result;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  }

  // READ: Get comments for a specific event, including the user's full name
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
      console.error("Error getting comments by event:", err);
      throw err;
    }
  }

  // READ: Get comments linked to a specific product
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
      console.error("Error getting product comments:", err);
      throw err;
    }
  }

  // READ: Get all comments (admin view)
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
      console.error("Error getting all comments:", err);
      throw err;
    }
  }
}

// Export the model factory
module.exports = (db) => new CommentModel(db);
