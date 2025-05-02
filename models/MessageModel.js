// Define the MessageModel class to manage all operations related to user messages
class MessageModel {
  constructor(db) {
    // Save the database connection instance
    this.db = db;
  }

  // Save a new message from one user to another
  async saveOneMessage(senderId, receiverId, content) {
    try {
      const result = await this.db.query(
        'INSERT INTO messages (sender_id, receiver_id, content, sent_at, seen) VALUES (?, ?, ?, NOW(), 0)',
        [senderId, receiverId, content]
      );
      return result;
    } catch (err) {
      console.error("Error in saveOneMessage:", err);
      return { code: 500, message: 'Error saving message' };
    }
  }

  // Retrieve all messages exchanged between two users, ordered by time sent
  async getMessagesBetweenUsers(user1Id, user2Id) {
    try {
      const result = await this.db.query(
        `SELECT * FROM messages
         WHERE (sender_id = ? AND receiver_id = ?)
            OR (sender_id = ? AND receiver_id = ?)
         ORDER BY sent_at`,
        [user1Id, user2Id, user2Id, user1Id]
      );
      return result;
    } catch (err) {
      console.error("Error in getMessagesBetweenUsers:", err);
      return { code: 500, message: 'Error retrieving messages' };
    }
  }

  // Mark a message as read by updating the 'seen' flag
  async markAsRead(messageId) {
    try {
      const result = await this.db.query(
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

// Export the model using a factory function that injects the database connection
module.exports = (db) => new MessageModel(db);
