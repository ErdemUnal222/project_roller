const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Middleware to protect routes that require authentication
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the request has an Authorization header in the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = decoded;

    // ✅ Debug: print decoded token payload
    console.log("🧩 withAuth: Token decoded", decoded);

    next();
  } catch (err) {
    console.error("❌ Invalid or expired token:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
