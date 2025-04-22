module.exports = (_db) => {
    const db = _db;
    return CommentModel;
};

class CommentModel {
    static async addComment(userId, content, eventId = null, productId = null) {
        try {
            const result = await db.query(
                `INSERT INTO comments (user_id, content, event_id, product_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                [userId, content, eventId, productId]
            );
            return result;
        } catch (err) {
            console.error("Error adding comment:", err);
            return { code: 500, message: 'Error saving comment' };
        }
    }

    static async updateComment(commentId, userId, content) {
        try {
            const result = await db.query(
                `UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
                [content, commentId, userId]
            );
            return result;
        } catch (err) {
            console.error("Error updating comment:", err);
            return { code: 500, message: 'Error updating comment' };
        }
    }

    static async deleteComment(commentId, userId) {
        try {
            const result = await db.query(
                `DELETE FROM comments WHERE id = ? AND user_id = ?`,
                [commentId, userId]
            );
            return result;
        } catch (err) {
            console.error("Error deleting comment:", err);
            return { code: 500, message: 'Error deleting comment' };
        }
    }

    static async getCommentsByEvent(eventId) {
        try {
            const result = await db.query(
                `SELECT comments.*, users.name FROM comments
                 JOIN users ON comments.user_id = users.id
                 WHERE event_id = ? ORDER BY created_at DESC`,
                [eventId]
            );
            return result;
        } catch (err) {
            console.error("Error retrieving comments by event:", err);
            return { code: 500, message: 'Error retrieving event comments' };
        }
    }

    static async getCommentsByProduct(productId) {
        try {
            const result = await db.query(
                `SELECT comments.*, users.name FROM comments
                 JOIN users ON comments.user_id = users.id
                 WHERE product_id = ? ORDER BY created_at DESC`,
                [productId]
            );
            return result;
        } catch (err) {
            console.error("Error retrieving comments by product:", err);
            return { code: 500, message: 'Error retrieving product comments' };
        }
    }
}
