const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to protect routes that require a logged-in user
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header exists and is in "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  // Extract token from Authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode the token using JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to the request object (available in controllers)
    req.user = decoded;

    // Continue to the next middleware or route
    next();
  } catch (err) {
    // If token is invalid or expired
    console.error("Invalid or expired token:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
