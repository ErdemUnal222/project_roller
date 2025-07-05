const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to protect admin-only routes
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header exists and has "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  // Extract token from header
  const token = authHeader.split(' ')[1];

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has the admin role
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ status: 403, msg: "Access denied: admin only" });
    }

    // Attach admin user to request
    req.user = decoded;
    next(); // Proceed to route
  } catch (err) {
    console.error("Token error:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
