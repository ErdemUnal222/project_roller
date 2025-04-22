module.exports = (CommentModel) => {
    const addComment = async (req, res) => {
        try {
            const { content, event_id, product_id } = req.body;
            if (!content) {
                return res.status(400).json({ status: 400, msg: "Content required" });
            }

            const result = await CommentModel.addComment(req.id, content, event_id, product_id);
            res.status(201).json({ status: 201, msg: "Comment added", result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error adding comment" });
        }
    };

    const updateComment = async (req, res) => {
        try {
            const result = await CommentModel.updateComment(req.params.id, req.id, req.body.content);
            res.status(200).json({ status: 200, msg: "Comment updated", result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error updating comment" });
        }
    };

    const deleteComment = async (req, res) => {
        try {
            const result = await CommentModel.deleteComment(req.params.id, req.id);
            res.status(200).json({ status: 200, msg: "Comment deleted", result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error deleting comment" });
        }
    };

    const getByEvent = async (req, res) => {
        try {
            const result = await CommentModel.getCommentsByEvent(req.params.eventId);
            res.status(200).json({ status: 200, result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching event comments" });
        }
    };

    const getByProduct = async (req, res) => {
        try {
            const result = await CommentModel.getCommentsByProduct(req.params.productId);
            res.status(200).json({ status: 200, result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching product comments" });
        }
    };

    const getAllComments = async (req, res) => {
        try {
            const result = await CommentModel.getAllComments();
            res.status(200).json({ status: 200, result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching all comments" });
        }
    };

    return {
        addComment,
        updateComment,
        deleteComment,
        getByEvent,
        getByProduct,
        getAllComments
    };
};
