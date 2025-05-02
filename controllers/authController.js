// Import required modules
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens
const dotenv = require("dotenv"); // For loading environment variables from a .env file
dotenv.config(); // Initialize dotenv configuration

// Export a function that receives the UserModel (used for database operations)
module.exports = (UserModel) => {

    // Controller to register a new user
    const saveUser = async (req, res) => {
        try {
            const { firstName, lastName, email, password, address, zip, city } = req.body;

            // Validate that all required fields are present
            if (!firstName || !lastName || !email || !password || !address || !zip || !city) {
                return res.status(400).json({ status: 400, msg: "All required fields must be filled out." });
            }

            // Check if the email is already in use
            const existing = await UserModel.getUserByEmail(email);
            if (existing.code) {
                return res.status(500).json({ status: 500, msg: "Error while checking email." });
            }
            if (existing.length > 0) {
                return res.status(409).json({ status: 409, msg: "Email already in use." });
            }

            // Hash the password before saving to the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Merge the hashed password with other user data
            const userData = {
                ...req.body,
                password: hashedPassword
            };

            // Save the new user in the database
            const user = await UserModel.saveOneUser(userData);
            if (user.code) {
                return res.status(500).json({ status: 500, msg: "Error while saving user." });
            }

            res.status(201).json({ status: 201, msg: "User registered successfully!" });
        } catch (err) {
            console.error("Error in saveUser:", err);
            res.status(500).json({ status: 500, msg: "Unexpected server error." });
        }
    };

    // Controller to authenticate a user and return a JWT
    const connectUser = async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ status: 400, msg: "Email and password are required." });
            }

            // Check if the user exists by email
            const check = await UserModel.getUserByEmail(email);
            if (check.code) {
                return res.status(500).json({ status: 500, msg: "Error while checking email." });
            }
            if (check.length === 0) {
                return res.status(404).json({ status: 404, msg: "User not found." });
            }

            // Compare the given password with the stored hashed password
            const isValid = await bcrypt.compare(password, check[0].password);
            if (!isValid) {
                return res.status(401).json({ status: 401, msg: "Invalid email or password." });
            }

            // Create a JWT token
            const payload = { id: check[0].id, role: check[0].role };
            const token = jwt.sign(payload, process.env.SECRET);

            // Update the user's last connection timestamp
            const update = await UserModel.updateConnexion(check[0].id);
            if (update.code) {
                return res.status(500).json({ status: 500, msg: "Error while updating connection timestamp." });
            }

            // Send back user data (excluding sensitive info like password)
            const user = {
                id: check[0].id,
                firstName: check[0].firstName,
                lastName: check[0].lastName,
                email: check[0].email,
                address: check[0].address,
                complement: check[0].complement,
                zip: check[0].zip,
                city: check[0].city,
                phone: check[0].phone,
                role: check[0].role
            };

            res.status(200).json({ status: 200, token, user });
        } catch (err) {
            console.error("Error in connectUser:", err);
            res.status(500).json({ status: 500, msg: "Unexpected server error." });
        }
    };

    // Controller to update a user's information
    const updateUser = async (req, res) => {
        try {
            // Validate that the request body is present
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({ status: 400, msg: "Invalid or missing body" });
            }

            // Update the user in the database
            const user = await UserModel.updateUser(req.body, req.params.id);
            if (user.code) {
                return res.status(500).json({ status: 500, msg: "Error updating user!" });
            }

            // Retrieve the updated user data
            const newUser = await UserModel.getOneUser(req.params.id);
            if (newUser.code || newUser.length === 0) {
                return res.status(404).json({ status: 404, msg: "Updated user not found!" });
            }

            const myUser = {
                id: newUser[0].id,
                firstName: newUser[0].firstName,
                lastName: newUser[0].lastName,
                email: newUser[0].email,
                address: newUser[0].address,
                zip: newUser[0].zip,
                city: newUser[0].city,
                phone: newUser[0].phone,
                role: newUser[0].role
            };

            res.status(200).json({ status: 200, newUser: myUser });
        } catch (err) {
            console.error("Error in updateUser:", err);
            res.status(500).json({ status: 500, msg: "Server error during update" });
        }
    };

    // Controller to delete a user by ID
    const deleteUser = async (req, res) => {
        try {
            const deletion = await UserModel.deleteOneUser(req.params.id);
            if (deletion.code) {
                return res.status(500).json({ status: 500, msg: "Error while deleting user." });
            }
            res.status(200).json({ status: 200, msg: "User deleted successfully." });
        } catch (err) {
            console.error("Error in deleteUser:", err);
            res.status(500).json({ status: 500, msg: "Unexpected server error." });
        }
    };

    // Controller to validate a JWT token and return associated user info
    const checkToken = async (req, res) => {
        try {
            const user = await UserModel.getOneUser(req.user.id);
            if (user.code) {
                return res.status(500).json({ status: 500, msg: "Error retrieving user." });
            }

            const myUser = {
                id: user[0].id,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                email: user[0].email,
                address: user[0].address,
                complement: user[0].complement,
                zip: user[0].zip,
                city: user[0].city,
                phone: user[0].phone,
                role: user[0].role
            };

            res.status(200).json({ status: 200, user: myUser });
        } catch (err) {
            console.error("Error in checkToken:", err);
            res.status(500).json({ status: 500, msg: "Unexpected server error." });
        }
    };

    // Export all controller methods
    return {
        saveUser,
        connectUser,
        updateUser,
        deleteUser,
        checkToken
    };
};
