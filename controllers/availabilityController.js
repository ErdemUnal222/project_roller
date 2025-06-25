// Exporting a function that takes AvailabilityModel (data access layer) as a parameter
module.exports = (AvailabilityModel) => {

    // CREATE a new availability entry
    const createAvailability = async (req, res, next) => {
        try {
            const { start_date, end_date, comment } = req.body;

            // Check required fields
            if (!start_date || !end_date) {
                return next({ status: 400, message: "Start date and end date are required" });
            }

            // Add availability linked to the logged-in user (req.user.id)
            const result = await AvailabilityModel.addAvailability(
                req.user.id,
                start_date,
                end_date,
                comment
            );

            res.status(201).json({ status: 201, msg: "Availability created successfully", result });
        } catch (err) {
            next(err); // Pass errors to centralized error handler
        }
    };

    // UPDATE an existing availability entry
    const updateAvailability = async (req, res, next) => {
        try {
            const { start_date, end_date, comment } = req.body;

            if (!start_date || !end_date) {
                return next({ status: 400, message: "Start date and end date are required" });
            }

            // Update the availability entry, making sure the logged-in user owns it
            const result = await AvailabilityModel.updateAvailability(
                req.params.id,       // ID of the availability to update
                req.user.id,         // Authenticated user ID
                start_date,
                end_date,
                comment
            );

            res.status(200).json({ status: 200, msg: "Availability updated successfully", result });
        } catch (err) {
            next(err);
        }
    };

    // DELETE an availability entry by ID
    const deleteAvailability = async (req, res, next) => {
        try {
            const result = await AvailabilityModel.deleteAvailability(
                req.params.id,
                req.user.id          // Ensure the user deleting the entry owns it
            );

            res.status(200).json({ status: 200, msg: "Availability deleted successfully", result });
        } catch (err) {
            next(err);
        }
    };

    // GET all availabilities for a specific user
    const getAvailabilitiesByUser = async (req, res, next) => {
        try {
            const result = await AvailabilityModel.getAvailabilitiesByUser(req.params.userId);

            res.status(200).json({ status: 200, result });
        } catch (err) {
            next(err);
        }
    };

    // GET all availabilities in the system (admin use case)
    const getAllAvailabilities = async (req, res, next) => {
        try {
            const result = await AvailabilityModel.getAllAvailabilities();

            res.status(200).json({ status: 200, result });
        } catch (err) {
            next(err);
        }
    };

    // Expose all the controller methods
    return {
        createAvailability,
        updateAvailability,
        deleteAvailability,
        getAvailabilitiesByUser,
        getAllAvailabilities
    };
};
