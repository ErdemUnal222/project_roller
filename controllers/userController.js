const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (UsersModel) => {
    // Controller to register a new user
    const saveUser = async(req, res) => {
        try {
            const check = await UsersModel.getUserByEmail(req.body.email);
            if (check.code) {
                return res.status(500).json({ status: 500, msg: "Error checking email" });
            }
            if (check.length > 0) {
                return res.status(401).json({ status: 401, msg: "Email already in use" });
            }


            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const userData = {
                ...req.body,
                password: hashedPassword
            };

            const user = await UsersModel.saveOneUser(userData);
            if (user.code) {
                return res.status(500).json({ status: 500, msg: "Error saving user" });
            }

            res.status(201).json({ status: 201, msg: "User registered successfully" });
        }
        catch (err) {
            console.error("Error in saveUser:", err);
            res.status(500).json({ status: 500, msg: "Unexpected server error" });
        }
    };


    // Controller to log in a user
    const connectUser = async(req, res) => {
        try {
            // Check if a user with the same email exists
            const check = await UsersModel.getUserByEmail(req.body.email);
            if (check.code) {
                return res.status(500).json({ status: 500, msg: "Oops, an error occurred while checking the email!" });
            }
            if (check.length === 0) {
                return res.status(404).json({ status: 404, msg: "User not found!" });
            }

            // Compare the provided password with the stored password
            const same = await bcrypt.compare(req.body.password, check[0].password);
            if (same) {
                // Create the payload for the JWT
                const payload = { id: check[0].id, role: check[0].role };
                // Create the JWT
                const token = jwt.sign(payload, process.env.SECRET);
                // Update the user's last connection timestamp
                const connect = await UsersModel.updateConnexion(check[0].id);
                if (connect.code) {
                    return res.status(500).json({ status: 500, msg: "Oops, an error occurred while updating the connection timestamp!" });
                }
                const user = {
                    id: check[0].id,
                    firstName: check[0].firstName,
                    lastName: check[0].lastName,
                    picture: check[0].picture,
                    email: check[0].email,
                    address: check[0].address,
                    complement: check[0].complement,
                    zip_code: check[0].zip_code,
                    city: check[0].city
                };
                res.status(200).json({ status: 200, token, user });
            }
            else {
                res.status(401).json({ status: 401, msg: "Invalid email or password!" });
            }
        }
        catch (err) {
            console.error("❌ ERROR in checkToken:", err);
            res.status(500).json({ status: 500, msg: "Oops, an error occurred!" });
        }
    };

    // Controller to update a user
    const updateUser = async(req, res) => {
        try {
            // Update the user in the database
            const user = await UsersModel.updateUser(req, req.params.id);
            if (user.code) {
                return res.status(500).json({ status: 500, msg: "Oops, an error occurred while updating the user!" });
            }
            // Fetch the updated user data
            const newUser = await UsersModel.getOneUser(req.params.id);
            if (newUser.code) {
                return res.status(500).json({ status: 500, msg: "Oops, an error occurred while fetching the updated user!" });
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
        }
        catch (err) {
            res.status(500).json({ status: 500, msg: "Oops, an error occurred!" });
        }
    };

    // Controller to delete a user
    const deleteUser = async(req, res) => {
        try {
            const deletionResult = await UsersModel.deleteOneUser(req.params.id);
            if (deletionResult.code) {
                return res.status(500).json({ status: 500, msg: "Oops, an error occurred while deleting the user!" });
            }
            res.status(200).json({ status: 200, msg: "User deleted successfully!" });
        }
        catch (err) {
            res.status(500).json({ status: 500, msg: "Oops, an error occurred!" });
        }
    };

    // Controller to check token validity
    const checkToken = async(req, res) => {
        try {
            const user = await UsersModel.getOneUser(req.user.id);
            if (user.code) {
                return res.status(500).json({ status: 500, msg: "Error registering user" });
            }
            else {
                const myUser = {
                    id: user[0].id,
                    firstName: user[0].firstName,
                    lastName: user[0].lastName,
                    email: user[0].email,
                    address: user[0].address,
                    zip: user[0].zip,
                    city: user[0].city,
                    phone: user[0].phone,
                    role: user[0].role
                };
                res.status(200).json({ status: 200, user: myUser });
            }
        }
        catch (err) {
            res.status(500).json({ status: 500, msg: "Error encountered" });
        }
    };
    
    const getAllUsers = async (req, res) => {
        try {
            const users = await UsersModel.getAllUsers();
            if (users.code) {
                return res.status(500).json({ status: 500, msg: "Error retrieving users" });
            }
            res.status(200).json({ status: 200, result: users });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Unexpected error retrieving users" });
        }
    };

    // ✅ Get a single user by ID
    const getOneUser = async (req, res) => {
        try {
            const user = await UsersModel.getOneUser(req.params.id);
            if (user.code || user.length === 0) {
                return res.status(404).json({ status: 404, msg: "User not found" });
            }
            res.status(200).json({ status: 200, user: user[0] });
        } catch (err) {
            res.status(500).json({ status: 500, msg: "Unexpected error retrieving user" });
        }
    };

    return {
        saveUser,
        connectUser,
        updateUser,
        deleteUser,
        checkToken,
        getAllUsers,
        getOneUser // ✅ make sure to export these
    };
};
