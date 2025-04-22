const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (UserModel) => {
    // Register a new user
    const saveUser = async (req, res) => {
        try {
            const existing = await UserModel.getUserByEmail(req.body.email);
            if (existing.code) {
                return res.status(500).json({ status: 500, msg: "Error while checking email." });
            }
            if (existing.length > 0) {
                return res.status(409).json({ status: 409, msg: "Email already in use." });
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const userData = {
                ...req.body,
                password: hashedPassword
            };

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

    // User login
    const connectUser = async (req, res) => {
        try {
            const check = await UserModel.getUserByEmail(req.body.email);
            if (check.code) {
                return res.status(500).json({ status: 500, msg: "Error while checking email." });
            }
            if (check.length === 0) {
                return res.status(404).json({ status: 404, msg: "User not found." });
            }

            const isValid = await bcrypt.compare(req.body.password, check[0].password);
            if (!isValid) {
                return res.status(401).json({ status: 401, msg: "Invalid email or password." });
            }

            const payload = { id: check[0].id, role: check[0].role };
            const token = jwt.sign(payload, process.env.SECRET);

            const update = await UserModel.updateConnexion(check[0].id);
            if (update.code) {
                return res.status(500).json({ status: 500, msg: "Error while updating connection timestamp." });
            }

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

    // Update user
    const updateUser = async (req, res) => {
        try {
            const update = await UserModel.updateUser(req.body, req.params.id);
            if (update.code) {
                return res.status(500).json({ status: 500, msg: "Error while updating user." });
            }

            const newUser = await UserModel.getOneUser(req.params.id);
            if (newUser.code) {
                return res.status(500).json({ status: 500, msg: "Error while retrieving updated user." });
            }

            const user = {
                id: newUser[0].id,
                firstName: newUser[0].firstName,
                lastName: newUser[0].lastName,
                email: newUser[0].email,
                address: newUser[0].address,
                complement: newUser[0].complement,
                zip: newUser[0].zip,
                city: newUser[0].city,
                phone: newUser[0].phone,
                role: newUser[0].role
            };

            res.status(200).json({ status: 200, newUser: user });
        } catch (err) {
            console.error("Error in updateUser:", err);
            res.status(500).json({ status: 500, msg: "Unexpected server error." });
        }
    };

    // Delete user
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

    // Validate JWT token and return user data
    const checkToken = async (req, res) => {
        try {
            const user = await UserModel.getOneUser(req.id);
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

    return {
        saveUser,
        connectUser,
        updateUser,
        deleteUser,
        checkToken
    };
};
