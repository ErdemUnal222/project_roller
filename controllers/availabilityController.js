// availabilityController.js

module.exports = (AvailabilityModel) => {

    // ➔ Create a new availability
    const createAvailability = async (req, res) => {
        try {
            const { start_date, end_date, comment } = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({ status: 400, msg: "Start date and end date are required" });
            }

            const result = await AvailabilityModel.addAvailability(
                req.user.id,
                start_date,
                end_date,
                comment
            );

            res.status(201).json({ status: 201, msg: "Availability created successfully", result });
        } catch (err) {
            console.error("Error in createAvailability:", err);
            res.status(500).json({ status: 500, msg: "Server error while creating availability" });
        }
    };

    // ➔ Update an existing availability
    const updateAvailability = async (req, res) => {
        try {
            const { start_date, end_date, comment } = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({ status: 400, msg: "Start date and end date are required" });
            }

            const result = await AvailabilityModel.updateAvailability(
                req.params.id,
                req.user.id,
                start_date,
                end_date,
                comment
            );

            res.status(200).json({ status: 200, msg: "Availability updated successfully", result });
        } catch (err) {
            console.error("Error in updateAvailability:", err);
            res.status(500).json({ status: 500, msg: "Server error while updating availability" });
        }
    };

    // ➔ Delete an availability
    const deleteAvailability = async (req, res) => {
        try {
            const result = await AvailabilityModel.deleteAvailability(
                req.params.id,
                req.user.id
            );

            res.status(200).json({ status: 200, msg: "Availability deleted successfully", result });
        } catch (err) {
            console.error("Error in deleteAvailability:", err);
            res.status(500).json({ status: 500, msg: "Server error while deleting availability" });
        }
    };

    // ➔ Get all availabilities by a specific user (Admin only)
    const getAvailabilitiesByUser = async (req, res) => {
        try {
            const result = await AvailabilityModel.getAvailabilitiesByUser(req.params.userId);

            res.status(200).json({ status: 200, result });
        } catch (err) {
            console.error("Error in getAvailabilitiesByUser:", err);
            res.status(500).json({ status: 500, msg: "Server error while fetching user's availabilities" });
        }
    };

    // ➔ Get all availabilities (Admin only)
    const getAllAvailabilities = async (req, res) => {
        try {
            const result = await AvailabilityModel.getAllAvailabilities();

            res.status(200).json({ status: 200, result });
        } catch (err) {
            console.error("Error in getAllAvailabilities:", err);
            res.status(500).json({ status: 500, msg: "Server error while fetching all availabilities" });
        }
    };

    // Export all methods
    return {
        createAvailability,
        updateAvailability,
        deleteAvailability,
        getAvailabilitiesByUser,
        getAllAvailabilities
    };
};
