const express = require('express');
const router = express.Router();
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
    const EventModel = require('../models/EventModel')(db);
    const eventController = require('../controllers/eventController')(EventModel);

    router.get('/event/all', eventController.getAllEvents);
    router.get('/event/one/:id', eventController.getOneEvent);
    router.post('/event/save', withAuthAdmin, eventController.saveEvent);
    router.post('/event/pict', withAuthAdmin, eventController.savePicture);
    router.put('/event/update/:id', withAuthAdmin, eventController.updateEvent);
    router.delete('/event/delete/:id', withAuthAdmin, eventController.deleteEvent);

    parentRouter.use('/', router);
};
