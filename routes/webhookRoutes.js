const express = require('express');
const router = express.Router();

module.exports = (parentRouter, db) => {
    const WebhookController = require("../controllers/webhookController")(db);

    router.post('/webhook/stripe', WebhookController.handleStripeWebhook);

    parentRouter.use('/', router);
};
