const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const MessageModel = require("../models/MessageModel");

dotenv.config();

module.exports = (UsersModel) => {
  // Register a new user
  const saveUser = async (req, res, next) => {
    try {
      const existing = await UsersModel.getUserByEmail(req.body.email);
      if (existing.code) return next({ status: 500, message: "Error checking email" });
      if (existing.length > 0) return next({ status: 401, message: "Email already in use" });

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const userData = { ...req.body, password: hashedPassword };

      const result = await UsersModel.saveOneUser(userData);
      if (result.code) return next({ status: 500, message: "Error saving user" });

      res.status(201).json({ status: 201, msg: "User registered successfully" });
    } catch (err) {
      next(err);
    }
  };

  // Login user and return token
  const connectUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await UsersModel.getUserByEmail(email);

      if (!result || result.length === 0) {
        return next({ status: 401, message: "Invalid email or password" });
      }

      const userRecord = result[0];
      const isMatch = await bcrypt.compare(password, userRecord.password);

      if (!isMatch) {
        return next({ status: 401, message: "Invalid email or password" });
      }

      const payload = { id: userRecord.id, role: userRecord.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

      const user = {
        id: userRecord.id,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        email: userRecord.email,
        address: userRecord.address,
        complement: userRecord.complement,
        zip: userRecord.zip,
        city: userRecord.city,
        role: userRecord.role,
        picture: userRecord.picture
      };

      res.status(200).json({ token, user });
    } catch (err) {
      next(err);
    }
  };

  // Update user
  const updateUser = async (req, res, next) => {
    try {
      const result = await UsersModel.updateUser(req.body, req.params.id);
      if (result.code) return next({ status: 500, message: "Error updating user" });

      const updated = await UsersModel.getOneUser(req.params.id);
      if (updated.code) return next({ status: 500, message: "Error fetching updated user" });

      const user = updated[0];
      res.status(200).json({ status: 200, newUser: user });
    } catch (err) {
      next(err);
    }
  };

  // Delete user
const deleteUser = async (req, res, next) => {
  try {
    const result = await UsersModel.softDeleteUser(req.params.id);
    if (result.code) return next({ status: 500, message: result.message });

    res.status(200).json({ status: 200, msg: "User marked as deleted" });
  } catch (err) {
    next(err);
  }
};

  // Upload profile picture
  const uploadProfilePicture = async (req, res, next) => {
    try {
      if (!req.files || !req.files.picture) {
        return next({ status: 400, message: "No file uploaded" });
      }

      const file = req.files.picture;
      const fileName = `profile_${Date.now()}_${file.name}`;
      await file.mv(`./public/uploads/${fileName}`);

      const result = await UsersModel.updateUser({ picture: fileName }, req.params.id);
      if (result.code) return next({ status: 500, message: "Failed to update user with picture" });

      res.status(200).json({ status: 200, message: "Profile picture updated", filename: fileName });
    } catch (err) {
      next({ status: 500, message: "Upload failed", error: err });
    }
  };

  // Token validation
  const checkToken = async (req, res, next) => {
    try {
      const result = await UsersModel.getOneUser(req.user.id);
      if (result.code) return next({ status: 500, message: "Error validating token" });

      const user = result[0];
      res.status(200).json({ status: 200, user });
    } catch (err) {
      next(err);
    }
  };

  // Get all users (admin only)
  const getAllUsers = async (req, res, next) => {
    try {
      const users = await UsersModel.getAllUsers();
      if (users.code) return next({ status: 500, message: "Error retrieving users" });

      res.status(200).json({ status: 200, result: users });
    } catch (err) {
      next(err);
    }
  };

  // Get one user by ID
  const getOneUser = async (req, res, next) => {
    try {
      const result = await UsersModel.getOneUser(req.params.id);
      if (result.code || result.length === 0) {
        return next({ status: 404, message: "User not found" });
      }

      res.status(200).json({ status: 200, user: result[0] });
    } catch (err) {
      next(err);
    }
  };

  // Get current user profile
  const getCurrentUser = async (req, res, next) => {
    try {
      const result = await UsersModel.getOneUser(req.user.id);
      if (!result || result.length === 0) {
        return next({ status: 404, message: "User not found" });
      }

      res.status(200).json({ status: 200, user: result[0] });
    } catch (err) {
      next(err);
    }
  };

  // Alias
  const getProfile = getCurrentUser;

  // Send a message
  const sendMessage = async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

      if (!receiverId || !content) {
        return next({ status: 400, message: "Receiver ID and content are required" });
      }

      const insertResult = await MessageModel.saveOneMessage(senderId, receiverId, content);
      if (insertResult.code) return next({ status: insertResult.code, message: insertResult.message });

      const insertedId = insertResult.insertId;
      const fullMessage = await MessageModel.getMessageById(insertedId);

      if (!fullMessage) {
        return next({ status: 500, message: "Failed to retrieve saved message" });
      }

      res.status(201).json({ status: 201, result: fullMessage });
    } catch (err) {
      next(err);
    }
  };

  return {
    sendMessage,
    saveUser,
    connectUser,
    updateUser,
    deleteUser,
    checkToken,
    getAllUsers,
    getOneUser,
    getCurrentUser,
    uploadProfilePicture,
    getProfile
  };
};
