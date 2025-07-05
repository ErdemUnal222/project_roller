// ------------------- SERVER ENTRY POINT -------------------

// Log message when server starts (before anything else runs)
console.log("Server starting...");

// Import required modules
const express = require("express"); // Core web framework for building APIs
const mysql = require("promise-mysql"); // Promisified MySQL for async/await support
const fileUpload = require("express-fileupload"); // Middleware to handle multipart/form-data for file uploads
const cors = require("cors"); // Middleware to allow frontend requests from different domains
const dotenv = require("dotenv"); // Loads environment variables from a .env file into process.env
const bodyParser = require("body-parser"); // Parses incoming request bodies in a middleware
const path = require("path"); // Helps work with file and directory paths
const errorHandler = require("./middleware/errorHandler"); // Custom error-handling middleware

// Load environment variables (DB credentials, frontend URL, etc.)
dotenv.config();

// Initialize Express application
const app = express();

// Define frontend URL (for CORS access), fallback to localhost
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// ------------------- MIDDLEWARE -------------------

// Enable CORS so frontend (React) can communicate with backend (Node)
app.use(cors({
  origin: frontendUrl, // Allow only frontend domain
  credentials: true, // Allow cookies and auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"
  ]
}));

// Respond to all OPTIONS preflight requests (especially for PUT/DELETE with Auth headers)
app.options("*", cors({ origin: frontendUrl, credentials: true }));

// Enable file uploads (with nested folder creation support)
app.use(fileUpload({ createParentPath: true }));

// Special middleware: Stripe requires **raw** body to validate signature
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next); // Default to JSON parsing
  }
});

// Parse standard form submissions (e.g. login forms)
app.use(express.urlencoded({ extended: false }));

// Serve static files for uploaded images and files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ------------------- DATABASE -------------------

// Connect to MySQL database using credentials in .env
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).then((db) => {
  console.log("Connected to MySQL database.");

  // Keep MySQL connection alive (to avoid timeout in some environments)
  setInterval(() => db.query('SELECT 1'), 10000); // every 10s

  // ------------------- ROUTING -------------------

  // Basic welcome route for root
  app.get('/', (req, res) => {
    res.json({ status: 200, message: "Welcome to the Roller Derby API" });
  });

  // Create a central router for versioned API endpoints
  const apiRouter = express.Router();
  require('./routes/index')(apiRouter, db); // Pass db connection to route handlers
  app.use('/api/v1', apiRouter); // Prefix all API endpoints with /api/v1

  // Debug route (useful for manual API check)
  app.get('/api/v1/debug', (req, res) => {
    console.log("Debug endpoint hit");
    res.json({ status: "ok" });
  });

  // Simple test route to verify server is responsive
  app.get('/test-direct', (req, res) => {
    console.log("/test-direct ping received");
    res.send("OK");
  });

  // Custom global error handler (placed after all routes)
  app.use(errorHandler);

  // Start the Express server on defined port
  const PORT = process.env.PORT || 9500;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}).catch((err) => {
  // Handle MySQL connection error (e.g., wrong credentials, no DB)
  console.error("Database connection failed:", err);

  // Fallback handler if DB is unavailable — returns 404 for all routes
  app.use('*', (req, res) => {
    console.warn("No matching route:", req.method, req.originalUrl);
    res.status(404).json({ message: "Route not found", path: req.originalUrl });
  });
});
