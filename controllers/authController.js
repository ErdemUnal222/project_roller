// Import required modules
const bcrypt = require("bcryptjs");              // For hashing passwords securely
const jwt = require("jsonwebtoken");             // For generating and verifying JWT tokens
const dotenv = require("dotenv");                // Load environment variables
dotenv.config();                                 // Initialize dotenv

// Exporting a factory function that injects the UserModel
module.exports = (UserModel) => {
    
    // REGISTER a new user
    const saveUser = async (req, res, next) => {
        try {
            const { firstName, lastName, email, password, address, zip, city } = req.body;

            // Ensure required fields are present
            if (!firstName || !lastName || !email || !password || !address || !zip || !city) {
                return next({ status: 400, message: "All required fields must be filled out." });
            }

            // Check if email is already registered
            const existing = await UserModel.getUserByEmail(email);
            if (existing.code) {
                return next({ status: 500, message: "Error while checking email." });
            }
            if (existing.length > 0) {
                return next({ status: 409, message: "Email already in use." });
            }

            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = { ...req.body, password: hashedPassword };

            // Save the user in the database
            const user = await UserModel.saveOneUser(userData);
            if (user.code) {
                return next({ status: 500, message: "Error while saving user." });
            }

            // Send success response
            res.status(201).json({ status: 201, msg: "User registered successfully!" });
        } catch (err) {
            next(err);
        }
    };

    // LOGIN a user
    const connectUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next({ status: 400, message: "Email and password are required." });
            }

            // Check user exists
            const check = await UserModel.getUserByEmail(email);
            if (check.code) return next({ status: 500, message: "Error checking email." });
            if (check.length === 0) return next({ status: 404, message: "User not found." });

            // Compare password
            const isValid = await bcrypt.compare(password, check[0].password);
            if (!isValid) return next({ status: 401, message: "Invalid email or password." });

            // Generate JWT token
            const payload = { id: check[0].id, role: check[0].role };
            const token = jwt.sign(payload, process.env.JWT_SECRET);

            // Update user's last connection time
            const update = await UserModel.updateConnexion(check[0].id);
            if (update.code) return next({ status: 500, message: "Error updating connection." });

            // Build safe user object
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
            next(err);
        }
    };

    // UPDATE a user's profile
    const updateUser = async (req, res, next) => {
        try {
            if (!req.body || typeof req.body !== 'object') {
                return next({ status: 400, message: "Invalid or missing body" });
            }

            const user = await UserModel.updateUser(req.body, req.params.id);
            if (user.code) return next({ status: 500, message: "Error updating user!" });

            const newUser = await UserModel.getOneUser(req.params.id);
            if (newUser.code || newUser.length === 0) {
                return next({ status: 404, message: "Updated user not found!" });
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
            next(err);
        }
    };

    // DELETE a user by ID
    const deleteUser = async (req, res, next) => {
        try {
            const deletion = await UserModel.deleteOneUser(req.params.id);
            if (deletion.code) return next({ status: 500, message: "Error while deleting user." });

            res.status(200).json({ status: 200, msg: "User deleted successfully." });
        } catch (err) {
            next(err);
        }
    };

    // VERIFY AUTHENTICATED USER (via JWT token)
    const checkToken = async (req, res, next) => {
        try {
            const user = await UserModel.getOneUser(req.user.id);
            if (user.code) return next({ status: 500, message: "Error retrieving user." });

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
            next(err);
        }
    };

    // Return all controller methods as an object
    return {
        saveUser,
        connectUser,
        updateUser,
        deleteUser,
        checkToken
    };
};
