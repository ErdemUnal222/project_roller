// Global error-handling middleware for Express
function errorHandler(err, req, res, next) {
  // Log the full error stack trace to the server console
  console.error(err.stack);

  // Determine HTTP status and message to return
  const status = err.status || 500; // Default to 500 if not specified
  const message = err.message || "Internal Server Error";

  // Send a JSON response to the client
  res.status(status).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
