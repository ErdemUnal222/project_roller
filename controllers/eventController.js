// eventController.js

module.exports = (EventModel) => {

    // ➔ Fetch all events
    const getAllEvents = async (req, res) => {
        try {
            const events = await EventModel.getAllEvents();
            if (events.code) {
                return res.status(events.code).json({ status: events.code, msg: events.message });
            }
            res.status(200).json({ status: 200, result: events });
        } catch (err) {
            console.error("Error in getAllEvents:", err);
            res.status(500).json({ status: 500, msg: "Server error while fetching events." });
        }
    };

    // ➔ Fetch a single event by ID
    const getOneEvent = async (req, res) => {
        try {
            const event = await EventModel.getOneEvent(req.params.id);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(200).json({ status: 200, result: event });
        } catch (err) {
            console.error("Error in getOneEvent:", err);
            res.status(500).json({ status: 500, msg: "Server error while fetching the event." });
        }
    };

    // ➔ Create a new event
    const saveEvent = async (req, res) => {
        try {
            const event = await EventModel.saveOneEvent(req.body);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(201).json({ status: 201, msg: "Event created successfully.", eventId: event.id });
        } catch (err) {
            console.error("Error in saveEvent:", err);
            res.status(500).json({ status: 500, msg: "Server error while creating the event." });
        }
    };
    
    const checkIfRegistered = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const isRegistered = await EventModel.checkUserRegistration(userId, eventId);
    res.status(200).json({ registered: isRegistered });
  } catch (err) {
    console.error("Error in checkIfRegistered:", err);
    res.status(500).json({ status: 500, msg: "Failed to check registration status" });
  }
};

const unregisterFromEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    await EventModel.unregisterUserFromEvent(userId, eventId);
    res.status(200).json({ status: 200, msg: "Successfully unregistered from the event" });
  } catch (err) {
    console.error("Error in unregisterFromEvent:", err);
    res.status(500).json({ status: 500, msg: "Failed to unregister from event" });
  }
};



    // ➔ Upload and save a picture for an event
    const savePicture = async (req, res) => {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).json({ status: 400, msg: "No image file uploaded." });
            }

            const file = req.files.image;
            const safeFileName = file.name.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
            const uploadPath = `public/images/${safeFileName}`;

            file.mv(uploadPath, (err) => {
                if (err) {
                    console.error("Error saving picture:", err);
                    return res.status(500).json({ status: 500, msg: "Failed to upload the picture." });
                }

                res.status(200).json({
                    status: 200,
                    msg: "Picture uploaded successfully.",
                    filename: safeFileName
                });
            });
        } catch (err) {
            console.error("Error in savePicture:", err);
            res.status(500).json({ status: 500, msg: "Server error during picture upload." });
        }
    };

    // ➔ Update an event by ID
    const updateEvent = async (req, res) => {
        try {
            const event = await EventModel.updateOneEvent(req.body, req.params.id);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(200).json({ status: 200, msg: "Event updated successfully." });
        } catch (err) {
            console.error("Error in updateEvent:", err);
            res.status(500).json({ status: 500, msg: "Server error while updating the event." });
        }
    };

    // ➔ Delete an event by ID
    const deleteEvent = async (req, res) => {
        try {
            const event = await EventModel.deleteOneEvent(req.params.id);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(200).json({ status: 200, msg: "Event deleted successfully." });
        } catch (err) {
            console.error("Error in deleteEvent:", err);
            res.status(500).json({ status: 500, msg: "Server error while deleting the event." });
        }
    };
    // ➔ Register user to an event
const registerForEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  console.log("➡️ Registering user", userId, "for event", eventId);

  try {
    const result = await EventModel.registerUserToEvent(userId, eventId);
    res.status(200).json({ status: 200, msg: "Successfully registered for the event" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // Handle duplicate registration gracefully
      return res.status(409).json({ status: 409, msg: "User is already registered for this event" });
    }

    console.error("registerUserToEvent error:", err);
    res.status(500).json({ status: 500, msg: "Server error while registering for the event" });
  }
};




    return {
        getAllEvents,
        getOneEvent,
        saveEvent,
        savePicture,
        updateEvent,
        deleteEvent,
        checkIfRegistered,
unregisterFromEvent,
        registerForEvent,
        checkIfRegistered, // 👈
  unregisterFromEvent // 👈
    };
};
