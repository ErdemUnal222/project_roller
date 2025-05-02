// Import required packages
const express = require("express");
const mysql = require("promise-mysql");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Frontend URL for CORS
const frontendUrl = "http://ihsanerdemunal.ide.3wa.io:3000";

// Middlewares
app.use(cors({
  origin: frontendUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Handle file uploads
app.use(fileUpload({ createParentPath: true }));

// Body parsing (Stripe special case handled separately)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));

// Serve static files (e.g., profile pictures)
app.use('/uploads', express.static('uploads')); // ✅ Added for profile pictures

// Database connection
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
})
.then((db) => {
  console.log("✅ Connected to MySQL");

  // Keep connection alive
  setInterval(() => db.query('SELECT 1'), 10000);

  // Test basic route
  app.get('/', (req, res) => {
    res.json({ status: 200, msg: "Welcome to Roller Derby API" });
  });

  // Load all API routes
  const apiRouter = express.Router();
  require('./routes')(apiRouter, db);
  app.use('/api/v1', apiRouter); // ✅ Correct mount here

})
.catch((err) => console.error("DB connection error:", err));

// Start server
const PORT = process.env.PORT || 9500;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
