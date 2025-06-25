// Import required modules
const bcrypt = require("bcryptjs");              // For password hashing
const jwt = require("jsonwebtoken");             // For generating authentication tokens
const dotenv = require("dotenv");                // For accessing environment variables
dotenv.config();                                 // Load .env configuration

// Exporting a function that takes the UserModel as an argument
module.exports = (UserModel) => {
    
    // REGISTER A NEW USER
    const saveUser = async (req, res, next) => {
        try {
            const { firstName, lastName, email, password, address, zip, city } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !email || !password || !address || !zip || !city) {
                return next({ status: 400, message: "All required fields must be filled out." });
            }

            // Check if the email already exists in the database
            const existing = await UserModel.getUserByEmail(email);
            if (existing.code) {
                return next({ status: 500, message: "Error while checking email." });
            }
            if (existing.length > 0) {
                return next({ status: 409, message: "Email already in use." });
            }

            // Hash the user's password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = { ...req.body, password: hashedPassword };

            // Save the new user
            const user = await UserModel.saveOneUser(userData);
            if (user.code) {
                return next({ status: 500, message: "Error while saving user." });
            }

            res.status(201).json({ status: 201, msg: "User registered successfully!" });
        } catch (err) {
            next(err);
        }
    };

    // LOGIN USER
    const connectUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Check for empty fields
            if (!email || !password) {
                return next({ status: 400, message: "Email and password are required." });
            }

            // Check if the user exists
            const check = await UserModel.getUserByEmail(email);
            if (check.code) {
                return next({ status: 500, message: "Error while checking email." });
            }
            if (check.length === 0) {
                return next({ status: 404, message: "User not found." });
            }

            // Validate the password
            const isValid = await bcrypt.compare(password, check[0].password);
            if (!isValid) {
                return next({ status: 401, message: "Invalid email or password." });
            }

            // Generate a JWT token
            const payload = { id: check[0].id, role: check[0].role };
            const token = jwt.sign(payload, process.env.JWT_SECRET);

            // Update the user's last connection timestamp
            const update = await UserModel.updateConnexion(check[0].id);
            if (update.code) {
                return next({ status: 500, message: "Error while updating connection timestamp." });
            }

            // Construct a clean user object to return (excluding password)
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

    // UPDATE A USER BY ID
    const updateUser = async (req, res, next) => {
        try {
            // Validate request body
            if (!req.body || typeof req.body !== 'object') {
                return next({ status: 400, message: "Invalid or missing body" });
            }

            // Update user information in the database
            const user = await UserModel.updateUser(req.body, req.params.id);
            if (user.code) {
                return next({ status: 500, message: "Error updating user!" });
            }

            // Retrieve the updated user from the database
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

    // DELETE A USER BY ID
    const deleteUser = async (req, res, next) => {
        try {
            const deletion = await UserModel.deleteOneUser(req.params.id);
            if (deletion.code) {
                return next({ status: 500, message: "Error while deleting user." });
            }
            res.status(200).json({ status: 200, msg: "User deleted successfully." });
        } catch (err) {
            next(err);
        }
    };

    // CHECK AUTHENTICATED USER VIA TOKEN
    const checkToken = async (req, res, next) => {
        try {
            // Retrieve user data based on ID in JWT token
            const user = await UserModel.getOneUser(req.user.id);
            if (user.code) {
                return next({ status: 500, message: "Error retrieving user." });
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
            next(err);
        }
    };

    // Return all controller methods
    return {
        saveUser,
        connectUser,
        updateUser,
        deleteUser,
        checkToken
    };
};
