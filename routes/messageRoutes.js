const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

module.exports = (parentRouter, db) => {
    const MessageModel = require("../models/MessageModel")(db);
    const messageController = require("../controllers/messageController")(MessageModel);

    router.post('/message/send', withAuth, messageController.sendMessage);
    router.get('/message/between/:user1Id/:user2Id', withAuth, messageController.getMessagesBetweenUsers);
    router.put('/message/:id/read', withAuth, messageController.markMessageAsRead);

    parentRouter.use('/', router);
};
