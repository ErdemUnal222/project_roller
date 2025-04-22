module.exports = (_db) => {
    const db = _db;
    return MessageModel;
};

class MessageModel {
    // Save a new message
    static async saveOneMessage(senderId, receiverId, content) {
        try {
            const result = await db.query(
                'INSERT INTO messages (sender_id, receiver_id, content, sent_at, seen) VALUES (?, ?, ?, NOW(), 0)',
                [senderId, receiverId, content]
            );
            return result;
        } catch (err) {
            console.error("Error in saveOneMessage:", err);
            return { code: 500, message: 'Error saving message' };
        }
    }

    // Get messages between two users
    static async getMessagesBetweenUsers(user1Id, user2Id) {
        try {
            const result = await db.query(
                'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY sent_at',
                [user1Id, user2Id, user2Id, user1Id]
            );
            return result;
        } catch (err) {
            console.error("Error in getMessagesBetweenUsers:", err);
            return { code: 500, message: 'Error retrieving messages' };
        }
    }

    // Mark a message as read (seen = 1)
    static async markAsRead(messageId) {
        try {
            const result = await db.query(
                'UPDATE messages SET seen = 1 WHERE id = ?',
                [messageId]
            );
            return result;
        } catch (err) {
            console.error("Error in markAsRead:", err);
            return { code: 500, message: 'Error marking message as read' };
        }
    }
}
