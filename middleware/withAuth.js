const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error("Authorization header is missing or malformed");
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error("Token extraction failed");
    return res.status(401).json({ status: 401, msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET); // ✅ USE JWT_SECRET HERE
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
