// Export a controller factory function that takes the MessageModel as input
module.exports = (MessageModel) => {

  // GET all messages (for admin or debugging)
  const getAllMessages = async (req, res, next) => {
    try {
      const messages = await MessageModel.getAllMessages();
      const result = Array.isArray(messages) ? messages : [messages]; // Normalize result
      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error("❌ Error in getAllMessages:", err);
      next(err);
    }
  };

  // SEND a message from the logged-in user to another user
  const sendMessage = async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

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

  // GET all messages exchanged between two specific users
  const getMessagesBetweenUsers = async (req, res, next) => {
    try {
      const { userId1, userId2 } = req.params;

      if (!userId1 || !userId2) {
        return next({ status: 400, message: "Both user IDs are required!" });
      }

      const messages = await MessageModel.getMessagesBetweenUsers(userId1, userId2);
      const result = Array.isArray(messages) ? messages : messages ? [messages] : [];

      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // MARK a single message as read by its ID
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

  // GET the inbox for the current user (list of conversations)
  const getUserInbox = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const results = await MessageModel.getInboxForUser(userId);
      res.status(200).json({ status: 200, result: results });
    } catch (err) {
      next(err);
    }
  };

  // MARK all messages in a conversation between two users as read
  const markMessagesAsRead = async (req, res, next) => {
    try {
      const { userId, otherUserId } = req.body;

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

  // DELETE a single message by its ID
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

  // Export all controller methods
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
