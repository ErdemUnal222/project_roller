const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

const eventControllerFactory = require('../controllers/eventController');
const EventModelFactory = require('../models/EventModel');

/**
 * This module defines all routes related to events and injects the database dependency.
 * @param {Router} parentRouter - The main application router (e.g., /api/v1).
 * @param {Object} db - The database connection instance.
 */
module.exports = (parentRouter, db) => {
  const eventModel = EventModelFactory(db);                      // Create model instance
  const eventController = eventControllerFactory(eventModel);    // Inject into controller

  // Event participation routes (user must be authenticated)
  router.get('/events/:id/is-registered', withAuth, eventController.checkIfRegistered);  // Check if user is registered
  router.post('/events/:id/register', withAuth, eventController.registerForEvent);       // Register user for event
  router.delete('/events/:id/unregister', withAuth, eventController.unregisterFromEvent); // Unregister user from event

  // Public event routes
  router.get('/events', eventController.getAllEvents);           // List all events
  router.get('/events/:id', eventController.getOneEvent);        // Get one event by ID

  // Admin or authorized routes
  router.post('/events', withAuth, eventController.saveEvent);   // Create new event
  router.post('/events/upload', eventController.savePicture);    // Upload event image
  router.put('/events/:id', withAuth, eventController.updateEvent); // Update event by ID
  router.delete('/events/:id', withAuth, eventController.deleteEvent); // Delete event by ID

  // Register this sub-router with the main router
  parentRouter.use('/', router);
};
