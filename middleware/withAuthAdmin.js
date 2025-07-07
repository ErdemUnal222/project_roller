const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to protect admin-only routes
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the request includes a properly formatted Authorization header
  // Example format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  // Extract the token from the header string
  const token = authHeader.split(' ')[1];

  try {
    // Decode and verify the token using the secret key stored in .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only allow access if the user has the admin role
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ status: 403, msg: "Access denied: admin only" });
    }

    // Attach the decoded token (user info) to the request object
    req.user = decoded;

    // Continue to the next middleware or route
    next();
  } catch (err) {
    // Token is missing, invalid, or expired
    console.error("Token error:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
