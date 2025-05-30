const express = require("express");
const app = express();
const mysql = require("promise-mysql");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment variables
dotenv.config();

// Allow CORS for your frontend
const frontendUrl = "http://ihsanerdemunal.ide.3wa.io:3000";
app.use(cors({
  origin: frontendUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Handle file uploads
app.use(fileUpload({ createParentPath: true }));

// ✅ Stripe webhook raw body handling must come before `express.json()`
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Serve static files (example: images)
app.use(express.static(__dirname + '/public'));

// Connect to MySQL
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).then((db) => {
  console.log("✅ Connected to MySQL database.");

  // Prevent idle disconnect
  setInterval(() => db.query('SELECT 1'), 10000);

  // Welcome route
  app.get('/', (req, res) => {
    res.json({ status: 200, msg: "Welcome to Roller Derby API" });
  });

  // Load all routes (inject db)
  require('./routes/index')(app, db);

}).catch((err) => {
  console.error("❌ Failed to connect to the database:", err);
});

// Start the server
const PORT = process.env.PORT || 9500;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
