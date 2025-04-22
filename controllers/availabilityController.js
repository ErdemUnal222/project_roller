module.exports = (AvailabilityModel) => {
    // Create availability for the authenticated user
    const createAvailability = async (req, res) => {
        try {
            const { start_date, end_date, comment } = req.body;
            const result = await AvailabilityModel.addAvailability(req.user.id, start_date, end_date, comment);
            res.status(201).json({ status: 201, msg: "Availability created", result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error creating availability" });
        }
    };

    // Update availability for the authenticated user
    const updateAvailability = async (req, res) => {
        try {
            const { start_date, end_date, comment } = req.body;
            const result = await AvailabilityModel.updateAvailability(req.params.id, req.user.id, start_date, end_date, comment);
            res.status(200).json({ status: 200, msg: "Availability updated", result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error updating availability" });
        }
    };

    // Delete availability for the authenticated user
    const deleteAvailability = async (req, res) => {
        try {
            const result = await AvailabilityModel.deleteAvailability(req.params.id, req.user.id);
            res.status(200).json({ status: 200, msg: "Availability deleted", result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error deleting availability" });
        }
    };

    // Get all availabilities for a specific user (admin only)
    const getAvailabilitiesByUser = async (req, res) => {
        try {
            const result = await AvailabilityModel.getAvailabilitiesByUser(req.params.userId);
            res.status(200).json({ status: 200, result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching user's availabilities" });
        }
    };

    // Get all availabilities (admin only)
    const getAllAvailabilities = async (req, res) => {
        try {
            const result = await AvailabilityModel.getAllAvailabilities();
            res.status(200).json({ status: 200, result });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Error fetching all availabilities" });
        }
    };

    return {
        createAvailability,
        updateAvailability,
        deleteAvailability,
        getAvailabilitiesByUser,
        getAllAvailabilities
    };
};
