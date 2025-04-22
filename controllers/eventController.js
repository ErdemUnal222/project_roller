module.exports = (EventModel) => {
    const getAllEvents = async (req, res) => {
        try {
            const events = await EventModel.getAllEvents();
            if (events.code) {
                return res.status(events.code).json({ status: events.code, msg: events.message });
            }
            res.status(200).json({ status: 200, result: events });
        } catch (err) {
            console.error("Error in getAllEvents:", err);
            res.status(500).json({ status: 500, msg: "An error occurred while retrieving events." });
        }
    };

    const getOneEvent = async (req, res) => {
        try {
            const event = await EventModel.getOneEvent(req.params.id);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(200).json({ status: 200, result: event });
        } catch (err) {
            console.error("Error in getOneEvent:", err);
            res.status(500).json({ status: 500, msg: "An error occurred while retrieving the event." });
        }
    };

    const saveEvent = async (req, res) => {
        try {
            const event = await EventModel.saveOneEvent(req.body);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(201).json({ status: 201, msg: "Event saved successfully.", eventId: event.id });
        } catch (err) {
            console.error("Error in saveEvent:", err);
            res.status(500).json({ status: 500, msg: "An error occurred while saving the event." });
        }
    };

    const savePicture = async (req, res) => {
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ status: 400, msg: "No file uploaded." });
            }

            const file = req.files.image;
            const safeFileName = file.name.replace(/[^a-z0-9.\-_]/gi, '_');
            const filePath = `public/images/${safeFileName}`;

            file.mv(filePath, (err) => {
                if (err) {
                    console.error("Error saving picture:", err);
                    return res.status(500).json({ status: 500, msg: "Failed to save the picture." });
                }
                res.status(200).json({
                    status: 200,
                    msg: "Picture saved successfully.",
                    url: safeFileName
                });
            });
        } catch (err) {
            console.error("Error in savePicture:", err);
            res.status(500).json({ status: 500, msg: "An error occurred while uploading the picture." });
        }
    };

    const updateEvent = async (req, res) => {
        try {
            const event = await EventModel.updateOneEvent(req.body, req.params.id);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(200).json({ status: 200, msg: "Event updated successfully." });
        } catch (err) {
            console.error("Error in updateEvent:", err);
            res.status(500).json({ status: 500, msg: "An error occurred while updating the event." });
        }
    };

    const deleteEvent = async (req, res) => {
        try {
            const event = await EventModel.deleteOneEvent(req.params.id);
            if (event.code) {
                return res.status(event.code).json({ status: event.code, msg: event.message });
            }
            res.status(200).json({ status: 200, msg: "Event deleted successfully." });
        } catch (err) {
            console.error("Error in deleteEvent:", err);
            res.status(500).json({ status: 500, msg: "An error occurred while deleting the event." });
        }
    };

    return {
        getAllEvents,
        getOneEvent,
        saveEvent,
        savePicture,
        updateEvent,
        deleteEvent
    };
};
