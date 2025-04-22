const express = require("express");
const router = express.Router();
const withAuth = require('../middleware/withAuth');

module.exports = (db) => {
    const CommentModel = require("../models/CommentModel")(db);
    const commentController = require("../controllers/commentController")(CommentModel);

    router.post('/add', withAuth, commentController.addComment);
    router.put('/update/:id', withAuth, commentController.updateComment);
    router.delete('/delete/:id', withAuth, commentController.deleteComment);
    router.get('/event/:eventId', commentController.getByEvent);
    router.get('/product/:productId', commentController.getByProduct);
    router.get('/all', commentController.getAllComments); // ✅ now defined

    return router;
};