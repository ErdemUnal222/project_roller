// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

const eventControllerFactory = require('../controllers/eventController');
const EventModelFactory = require('../models/EventModel');

module.exports = (parentRouter, db) => {
  const eventModel = EventModelFactory(db);
  const eventController = eventControllerFactory(eventModel);

  // Events routes
  router.get('/events/:id/is-registered', withAuth, eventController.checkIfRegistered);
router.delete('/events/:id/unregister', withAuth, eventController.unregisterFromEvent);

  router.post('/events/:id/register', withAuth, eventController.registerForEvent);
  router.get('/events', eventController.getAllEvents);           // GET /api/v1/events
  router.get('/events/:id', eventController.getOneEvent);         // GET /api/v1/events/:id
  router.post('/events', withAuth, eventController.saveEvent);    // POST /api/v1/events
  router.put('/events/:id', withAuth, eventController.updateEvent); // PUT /api/v1/events/:id
  router.delete('/events/:id', withAuth, eventController.deleteEvent); // DELETE /api/v1/events/:id

  parentRouter.use('/', router);
};
