// ------------------- SERVER ENTRY POINT -------------------

// Log a message when the server starts
console.log("Server starting...");

// Load required dependencies
const express = require("express");               // Express framework for building REST APIs
const mysql = require("promise-mysql");           // Promisified MySQL driver for easier async/await usage
const fileUpload = require("express-fileupload"); // Middleware for handling file uploads
const cors = require("cors");                     // Enables cross-origin requests from frontend
const dotenv = require("dotenv");                 // Loads environment variables from .env file
const bodyParser = require("body-parser");        // Parses incoming request payloads
const path = require("path");                     // Utility for working with file system paths
const errorHandler = require("./middleware/errorHandler"); // Global error handler

// Load environment variables into process.env
dotenv.config();

// Initialize the Express application
const app = express();

// Define the allowed frontend domain (for CORS)
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// ------------------- MIDDLEWARE SETUP -------------------

// Enable CORS for frontend domain and allow credentials (cookies, auth headers)
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"
  ]
}));

// Handle preflight OPTIONS requests for all routes
app.options("*", cors({ origin: frontendUrl, credentials: true }));

// Enable file uploads (with automatic folder creation if needed)
app.use(fileUpload({ createParentPath: true }));

// Special body parser for Stripe webhook endpoint (Stripe requires raw body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next); // Default JSON parsing for all other routes
  }
});

// Parse URL-encoded form data (e.g. from login forms)
app.use(express.urlencoded({ extended: false }));

// Serve static files (uploaded files and images)
app.use('/uploads', express.static(path.join(__dirname, 'public','uploads')));
app.use('/images', express.static(path.join(__dirname, 'public','images')));

// ------------------- DATABASE CONNECTION -------------------

// Connect to MySQL using credentials from .env file
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).then((db) => {
  console.log("Connected to MySQL database.");

  // Keep the connection alive by sending a lightweight query every 10 seconds
  setInterval(() => db.query('SELECT 1'), 10000);

  // ------------------- ROUTES -------------------

  // Basic route for testing root access
  app.get('/', (req, res) => {
    res.json({ status: 200, message: "Welcome to the Roller Derby API" });
  });

  // Load all API routes with dependency injection (database)
  const apiRouter = express.Router();
  require('./routes/index')(apiRouter, db);       // Inject db into all route modules
  app.use('/api/v1', apiRouter);                  // Prefix all API routes with /api/v1

  // Route for quick manual backend check
  app.get('/api/v1/debug', (req, res) => {
    console.log("Debug endpoint hit");
    res.json({ status: "ok" });
  });

  // Simple direct connectivity check
  app.get('/test-direct', (req, res) => {
    console.log("/test-direct ping received");
    res.send("OK");
  });

  // Global error handler for any thrown errors in controllers/routes
  app.use(errorHandler);

  // Start the server on the specified port
  const PORT = process.env.PORT || 9500;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}).catch((err) => {
  // Catch any database connection errors
  console.error("Database connection failed:", err);

  // Fallback: all incoming requests return 404 if DB is unreachable
  app.use('*', (req, res) => {
    console.warn("No matching route:", req.method, req.originalUrl);
    res.status(404).json({ message: "Route not found", path: req.originalUrl });
  });
});
