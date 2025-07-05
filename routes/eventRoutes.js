const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth'); // Protect routes requiring authentication

const eventControllerFactory = require('../controllers/eventController');
const EventModelFactory = require('../models/EventModel');

/**
 * Defines all event-related routes and injects the database dependency.
 */
module.exports = (parentRouter, db) => {
  const eventModel = EventModelFactory(db);
  const eventController = eventControllerFactory(eventModel);

  // User actions (authentication required)
  router.get('/events/:id/is-registered', withAuth, eventController.checkIfRegistered); // Check if current user is registered to event
  router.post('/events/:id/register', withAuth, eventController.registerForEvent);       // Register user to an event
  router.delete('/events/:id/unregister', withAuth, eventController.unregisterFromEvent); // Cancel event registration

  // Public access
  router.get('/events', eventController.getAllEvents);      // List all events
  router.get('/events/:id', eventController.getOneEvent);   // Get specific event by ID

  // Admin or organizer actions (authentication required)
  router.post('/events', withAuth, eventController.saveEvent);      // Create a new event
  router.post('/events/upload', eventController.savePicture);       // Upload image for event
  router.put('/events/:id', withAuth, eventController.updateEvent); // Update an event
  router.delete('/events/:id', withAuth, eventController.deleteEvent); // Delete an event

  // Mount this route under the parent router
  parentRouter.use('/', router);
};
