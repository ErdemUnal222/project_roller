// Importing required packages
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (UsersModel) => {
  // Register a new user
  const saveUser = async (req, res) => {
    try {
      const check = await UsersModel.getUserByEmail(req.body.email);
      if (check.code) {
        return res.status(500).json({ status: 500, msg: "Error checking email" });
      }
      if (check.length > 0) {
        return res.status(401).json({ status: 401, msg: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const userData = { ...req.body, password: hashedPassword };
      const user = await UsersModel.saveOneUser(userData);

      if (user.code) {
        return res.status(500).json({ status: 500, msg: "Error saving user" });
      }

      res.status(201).json({ status: 201, msg: "User registered successfully" });
    } catch (err) {
      console.error("Error in saveUser:", err);
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };

  // Authenticate and log in a user
  const connectUser = async (req, res) => {
    try {
      const check = await UsersModel.getUserByEmail(req.body.email);
      if (check.code) {
        return res.status(500).json({ status: 500, msg: "Error checking email" });
      }
      if (check.length === 0) {
        return res.status(404).json({ status: 404, msg: "User not found" });
      }

      const same = await bcrypt.compare(req.body.password, check[0].password);
      if (same) {
        const payload = { id: check[0].id, role: check[0].role };
        const token = jwt.sign(payload, process.env.SECRET);

        const connect = await UsersModel.updateConnexion(check[0].id);
        if (connect.code) {
          return res.status(500).json({ status: 500, msg: "Error updating connection time" });
        }

        const user = {
          id: check[0].id,
          firstName: check[0].firstName,
          lastName: check[0].lastName,
          picture: check[0].picture,
          email: check[0].email,
          address: check[0].address,
          complement: check[0].complement,
          zip: check[0].zip,
          city: check[0].city
        };

        res.status(200).json({ status: 200, token, user });
      } else {
        res.status(401).json({ status: 401, msg: "Invalid email or password" });
      }
    } catch (err) {
      console.error("Error in connectUser:", err);
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };

  // Update user data by ID
 const updateUser = async (req, res) => {
  try {
    const user = await UsersModel.updateUser(req.body, req.params.id); // ✅ Only pass req.body

    if (user.code) {
      return res.status(500).json({ status: 500, msg: "Error updating user" });
    }

    const newUser = await UsersModel.getOneUser(req.params.id);
    if (newUser.code) {
      return res.status(500).json({ status: 500, msg: "Error fetching updated user" });
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
      role: newUser[0].role,
      picture: newUser[0].picture
    };

    res.status(200).json({ status: 200, newUser: myUser });
  } catch (err) {
    console.error("❌ Error in updateUser:", err);
    res.status(500).json({ status: 500, msg: "Unexpected server error" });
  }
};


  // Delete a user by ID
  const deleteUser = async (req, res) => {
    try {
      const deletionResult = await UsersModel.deleteOneUser(req.params.id);
      if (deletionResult.code) {
        return res.status(500).json({ status: 500, msg: "Error deleting user" });
      }
      res.status(200).json({ status: 200, msg: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };
  
  const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.files || !req.files.picture) {
      return res.status(400).json({ status: 400, msg: "No file uploaded" });
    }

    const file = req.files.picture;
    const fileName = `profile_${Date.now()}_${file.name}`;

    await file.mv(`./public/uploads/${fileName}`);

    res.status(200).json({ status: 200, filename: fileName });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ status: 500, msg: "Upload failed" });
  }
};

  // Validate JWT and return associated user data
  const checkToken = async (req, res) => {
    try {
      const user = await UsersModel.getOneUser(req.user.id);
      if (user.code) {
        return res.status(500).json({ status: 500, msg: "Error validating token" });
      }

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
    } catch (err) {
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };

  // Retrieve all users
  const getAllUsers = async (req, res) => {
    try {
      const users = await UsersModel.getAllUsers();
      if (users.code) {
        return res.status(500).json({ status: 500, msg: "Error retrieving users" });
      }
      res.status(200).json({ status: 200, result: users });
    } catch (err) {
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };

  // Retrieve a user by ID
  const getOneUser = async (req, res) => {
    try {
      const user = await UsersModel.getOneUser(req.params.id);
      if (user.code || user.length === 0) {
        return res.status(404).json({ status: 404, msg: "User not found" });
      }
      res.status(200).json({ status: 200, user: user[0] });
    } catch (err) {
      res.status(500).json({ status: 500, msg: "Unexpected server error" });
    }
  };

  // ✅ NEW: Retrieve the currently logged-in user's profile
  // getCurrentUser in userController.js
const getCurrentUser = async (req, res) => {
  try {
    console.log('✅ Decoded token user ID:', req.user.id);  // <--- ADD THIS

    const user = await UsersModel.getOneUser(req.user.id);

    console.log('✅ DB user lookup result:', user);  // <--- ADD THIS

    if (!user || user.length === 0) {
      console.error('❌ No user found with ID:', req.user.id);
      return res.status(404).json({ status: 404, msg: "User not found" });
    }

    const myUser = {
      id: user[0].id,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      email: user[0].email,
      address: user[0].address,
      zip: user[0].zip,
      city: user[0].city,
      phone: user[0].phone,
      role: user[0].role,
      picture: user[0].picture
    };

    res.status(200).json({ status: 200, user: myUser });
  } catch (err) {
    console.error('❌ Error in getCurrentUser:', err);
    res.status(500).json({ status: 500, msg: "Unexpected server error" });
  }
};


  // Export all controller functions
  return {
  saveUser,
  connectUser,
  updateUser,
  deleteUser,
  checkToken,
  getAllUsers,
  getOneUser,
  getCurrentUser,
  uploadProfilePicture // ✅ Add this line
};
};
