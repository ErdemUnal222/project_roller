
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

app.get('/diagnose-token', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error("❌ Authorization header missing or malformed");
    return res.status(400).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🔍 Received token:", token);

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("✅ Token verified successfully:", decoded);
    return res.status(200).json({ status: "Token valid", decoded });
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ error: err.message });
  }
});

const PORT = 9500;
app.listen(PORT, () => {
  console.log(`Token diagnostic server running on https://ihsanerdemunal.ide.3wa.io:${PORT}`);
});
