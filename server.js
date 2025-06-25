// ------------------- SERVER ENTRY POINT -------------------

console.log("Server starting...");

const express = require("express");
const mysql = require("promise-mysql");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// ------------------- MIDDLEWARE -------------------

// Enable CORS
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"
  ]
}));
app.options("*", cors({ origin: frontendUrl, credentials: true }));

// Enable file upload handling
app.use(fileUpload({ createParentPath: true }));

// Use raw body parser for Stripe webhook, JSON parser otherwise
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ------------------- DATABASE -------------------

mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).then((db) => {
  console.log("Connected to MySQL database.");

  // Optional: Display last 5 products
  db.query('SELECT id, title FROM products ORDER BY id DESC LIMIT 5')
    .then(rows => {
      console.log("Last 5 products:");
      rows.forEach(row => console.log(` - [${row.id}] ${row.title}`));
    })
    .catch(err => console.error("Error fetching initial products:", err));

  // Keep MySQL connection alive
  setInterval(() => db.query('SELECT 1'), 10000);

  // ------------------- ROUTING -------------------

  // Root route
  app.get('/', (req, res) => {
    res.json({ status: 200, message: "Welcome to the Roller Derby API" });
  });

  // Mount API routes
  const apiRouter = express.Router();
  require('./routes/index')(apiRouter, db);
  app.use('/api/v1', apiRouter); // ✅ Mount all versioned API routes

  // Debug route
  app.get('/api/v1/debug', (req, res) => {
    console.log("Debug endpoint hit");
    res.json({ status: "ok" });
  });

  // Direct test route
  app.get('/test-direct', (req, res) => {
    console.log("/test-direct ping received");
    res.send("OK");
  });

  // Global error handler
  app.use(errorHandler);

  // Start server
  const PORT = process.env.PORT || 9500;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test endpoint: http://ihsanerdemunal.ide.3wa.io:${PORT}/test-direct`);
  });

}).catch((err) => {
  console.error("Database connection failed:", err);

  // Fallback if DB connection fails
  app.use('*', (req, res) => {
    console.warn("No matching route:", req.method, req.originalUrl);
    res.status(404).json({ message: "Route not found", path: req.originalUrl });
  });
});
