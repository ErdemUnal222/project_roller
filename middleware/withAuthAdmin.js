const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET);

    // Check if the user has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ status: 403, msg: "Access denied: admin only" });
    }

    // Attach full user info to request
    req.user = decoded;
    next();
  }
  catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }

};
