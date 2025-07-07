// Export a controller factory function that takes the MessageModel as input
module.exports = (MessageModel) => {

  // Fetches all messages in the system (used by admin or for debugging)
  const getAllMessages = async (req, res, next) => {
    try {
      const messages = await MessageModel.getAllMessages();

      // Ensure the result is always an array
      const result = Array.isArray(messages) ? messages : [messages];

      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error("❌ Error in getAllMessages:", err);
      next(err);
    }
  };

  // Sends a new message from the logged-in user to another user
  const sendMessage = async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

      // Check that required fields are provided
      if (!receiverId || !content) {
        return next({ status: 400, message: "Receiver ID and content are required!" });
      }

      const message = await MessageModel.saveOneMessage(senderId, receiverId, content);

      if (message.code) {
        return next({ status: message.code, message: message.message });
      }

      res.status(201).json({ result: message });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves all messages exchanged between two specific users
  const getMessagesBetweenUsers = async (req, res, next) => {
    try {
      const { userId1, userId2 } = req.params;

      // Validate user IDs
      if (!userId1 || !userId2) {
        return next({ status: 400, message: "Both user IDs are required!" });
      }

      const messages = await MessageModel.getMessagesBetweenUsers(userId1, userId2);

      // Always return an array, even if only one or no message
      const result = Array.isArray(messages) ? messages : messages ? [messages] : [];

      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // Marks a single message as read using its message ID
  const markMessageAsRead = async (req, res, next) => {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return next({ status: 400, message: "Message ID is required." });
      }

      const result = await MessageModel.markAsRead(messageId);

      if (result.code) {
        return next({ status: result.code, message: result.message });
      }

      res.status(200).json({ status: 200, msg: "Message marked as read." });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves the current user's inbox (list of conversations or recent contacts)
  const getUserInbox = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const results = await MessageModel.getInboxForUser(userId);

      res.status(200).json({ status: 200, result: results });
    } catch (err) {
      next(err);
    }
  };

  // Marks all messages in a conversation between two users as read
  const markMessagesAsRead = async (req, res, next) => {
    try {
      const { userId, otherUserId } = req.body;

      // Both user IDs are required for conversation tracking
      if (!userId || !otherUserId) {
        return next({ status: 400, message: "Both userId and otherUserId are required." });
      }

      const result = await MessageModel.markConversationAsRead(userId, otherUserId);

      if (result.code) {
        return next({ status: result.code, message: result.message });
      }

      res.status(200).json({ status: 200, message: "Messages marked as read." });
    } catch (err) {
      next(err);
    }
  };

  // Deletes a message by its ID
  const deleteMessage = async (req, res, next) => {
    try {
      const messageId = req.params.id;

      if (!messageId) {
        return next({ status: 400, message: "Message ID is required." });
      }

      const result = await MessageModel.deleteOneMessage(messageId);

      if (result.affectedRows === 0) {
        return next({ status: 404, message: "Message not found or already deleted." });
      }

      res.status(200).json({ status: 200, msg: "Message deleted successfully." });
    } catch (err) {
      next(err);
    }
  };

  // Expose all controller methods for use in routes
  return {
    sendMessage,
    getMessagesBetweenUsers,
    markMessageAsRead,
    getUserInbox,
    deleteMessage,
    markMessagesAsRead,
    getAllMessages
  };
};
