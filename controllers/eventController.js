const path = require('path');

module.exports = (EventModel) => {
  
  // GET all events
  const getAllEvents = async (req, res, next) => {
    try {
      const events = await EventModel.getAllEvents();
      res.status(200).json({ status: 200, result: events });
    } catch (err) {
      next(err);
    }
  };

  // GET a single event by ID
  const getOneEvent = async (req, res, next) => {
    try {
      const event = await EventModel.getOneEvent(req.params.id);
      res.status(200).json({ status: 200, result: event });
    } catch (err) {
      next(err);
    }
  };

  // CREATE a new event
  const saveEvent = async (req, res, next) => {
    try {
      const result = await EventModel.saveOneEvent(req.body);
      res.status(201).json({ status: 201, msg: "Event created successfully.", eventId: result.insertId });
    } catch (err) {
      next(err);
    }
  };

  // UPDATE an existing event
  const updateEvent = async (req, res, next) => {
    try {
      const data = req.body;
      const eventId = req.params.id;

      // Ensure proper date format for SQL
      if (data.event_date) {
        const parsedDate = new Date(data.event_date);
        if (isNaN(parsedDate)) {
          return next({ status: 400, message: "Invalid event_date format" });
        }
        data.event_date = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
      }

      const updated = await EventModel.updateEvent(eventId, data);
      res.status(200).json({ status: 200, result: updated });
    } catch (err) {
      next(err);
    }
  };

  // DELETE an event by ID
  const deleteEvent = async (req, res, next) => {
    try {
      await EventModel.deleteOneEvent(req.params.id);
      res.status(200).json({ status: 200, msg: "Event deleted successfully." });
    } catch (err) {
      next(err);
    }
  };

  // REGISTER a user for an event
  const registerForEvent = async (req, res) => {
    const userId = req.user && req.user.id;
    const eventId = req.params && req.params.id;

    if (!userId || !eventId) {
      return res.status(400).json({ message: "Missing user ID or event ID." });
    }

    try {
      const alreadyRegistered = await EventModel.checkUserRegistration(userId, eventId);
      if (alreadyRegistered) {
        return res.status(400).json({ message: "User is already registered to this event." });
      }

      await EventModel.registerUserToEvent(userId, eventId);
      res.status(201).json({ message: "User successfully registered to event." });
    } catch (error) {
      res.status(500).json({ message: "Server error." });
    }
  };

  // CHECK if a user is already registered to an event
  const checkIfRegistered = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const eventId = req.params.id;

      const isRegistered = await EventModel.checkUserRegistration(userId, eventId);
      res.status(200).json({ registered: isRegistered });
    } catch (err) {
      next(err);
    }
  };

  // UNREGISTER a user from an event
  const unregisterFromEvent = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const eventId = req.params.id;

      await EventModel.unregisterUserFromEvent(userId, eventId);
      res.status(200).json({ status: 200, msg: "Successfully unregistered from the event" });
    } catch (err) {
      next(err);
    }
  };

  // UPLOAD an image for an event
  const savePicture = async (req, res, next) => {
    try {
      if (!req.files || !req.files.image) {
        return next({ status: 400, message: "No image file uploaded." });
      }

      const file = req.files.image;
      const safeFileName = file.name.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', safeFileName);

      file.mv(uploadPath, (err) => {
        if (err) {
          return next({ status: 500, message: "Failed to upload the picture." });
        }

        res.status(200).json({
          status: 200,
          msg: "Picture uploaded successfully.",
          filename: safeFileName
        });
      });
    } catch (err) {
      next(err);
    }
  };

  // Expose all methods from the controller
  return {
    getAllEvents,
    getOneEvent,
    saveEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    checkIfRegistered,
    unregisterFromEvent,
    savePicture
  };
};
