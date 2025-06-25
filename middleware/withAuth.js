const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user data to the request object
    req.user = decoded;

    // Pass control to the next middleware/route
    next();
  } catch (err) {
    // Handle token verification errors (invalid/expired)
    console.error("Invalid or expired token:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
