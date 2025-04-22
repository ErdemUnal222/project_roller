module.exports = (MessageModel) => {
    const sendMessage = async (req, res) => {
        try {
            const { receiverId, content } = req.body;
            const senderId = req.user.id;

            if (!receiverId || !content) {
                return res.status(400).json({ status: 400, msg: "Receiver ID and content are required!" });
            }

            const message = await MessageModel.saveOneMessage(senderId, receiverId, content);
            if (message.code) {
                return res.status(message.code).json({ status: message.code, msg: message.message });
            }

            res.status(201).json({ status: 201, msg: "Message sent successfully!" });
        } catch (err) {
            console.error("Error in sendMessage:", err);
            res.status(500).json({ status: 500, msg: "An error occurred." });
        }
    };

    const getMessagesBetweenUsers = async (req, res) => {
        try {
            const { user1Id, user2Id } = req.params;

            if (!user1Id || !user2Id) {
                return res.status(400).json({ status: 400, msg: "Both user IDs are required!" });
            }

            const messages = await MessageModel.getMessagesBetweenUsers(user1Id, user2Id);
            if (messages.code) {
                return res.status(messages.code).json({ status: messages.code, msg: messages.message });
            }

            res.status(200).json({ status: 200, result: messages });
        } catch (err) {
            console.error("Error in getMessagesBetweenUsers:", err);
            res.status(500).json({ status: 500, msg: "An error occurred." });
        }
    };

    // Mark a message as read
    const markMessageAsRead = async (req, res) => {
        try {
            const { messageId } = req.params;

            if (!messageId) {
                return res.status(400).json({ status: 400, msg: "Message ID is required." });
            }

            const result = await MessageModel.markAsRead(messageId);
            if (result.code) {
                return res.status(result.code).json({ status: result.code, msg: result.message });
            }

            res.status(200).json({ status: 200, msg: "Message marked as read." });
        } catch (err) {
            console.error("Error in markMessageAsRead:", err);
            res.status(500).json({ status: 500, msg: "An error occurred." });
        }
    };

    return {
        sendMessage,
        getMessagesBetweenUsers,
        markMessageAsRead
    };
};
