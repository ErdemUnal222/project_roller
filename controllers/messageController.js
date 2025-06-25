module.exports = (MessageModel) => {
  
const getAllMessages = async (req, res, next) => {
  try {
    const messages = await MessageModel.getAllMessages();
    
    const result = Array.isArray(messages) ? messages : [messages]; // ✅ Ensure array

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

      // Validate required input
      if (!receiverId || !content) {
        return next({ status: 400, message: "Receiver ID and content are required!" });
      }

      // Save the message in the database
      const message = await MessageModel.saveOneMessage(senderId, receiverId, content);
      
      if (message.code) {
        return next({ status: message.code, message: message.message });
      }

      res.status(201).json({ result: message });
    } catch (err) {
      next(err);
    }
  };

  // GET all messages exchanged between two users
  const getMessagesBetweenUsers = async (req, res, next) => {
    try {
      const { userId1, userId2 } = req.params;

      // Validate both user IDs
      if (!userId1 || !userId2) {
        return next({ status: 400, message: "Both user IDs are required!" });
      }

      const messages = await MessageModel.getMessagesBetweenUsers(userId1, userId2);
      console.log("📦 getMessagesBetweenUsers returns:", messages);

      // Ensure the result is always an array
      const result = Array.isArray(messages) ? messages : messages ? [messages] : [];

      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // MARK a single message as read
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

  // GET all conversations and message previews for the current user (Inbox)
  const getUserInbox = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const results = await MessageModel.getInboxForUser(userId);

      res.status(200).json({ status: 200, result: results });
    } catch (err) {
      next(err);
    }
  };

  // MARK all messages in a conversation as read (bulk)
  const markMessagesAsRead = async (req, res, next) => {
    try {
      const { userId, otherUserId } = req.body;

      // Ensure both user IDs are provided
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


  // Expose all controller methods
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
