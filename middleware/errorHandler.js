/**
 * Global Error Handling Middleware
 * 
 * In Express, error handling middleware is defined by providing 4 arguments: (err, req, res, next).
 * This middleware catches any unhandled errors that occur during request processing,
 * logs the details, and returns a user-friendly JSON error response instead of HTML templates.
 */

function errorHandler(err, req, res, next) {
  // Log the error stack to console for debugging
  console.error('🔥 Global Error Handler Caught:', err.stack || err.message);

  // Set the response status. Default to 500 (Internal Server Error) if not set.
  const statusCode = err.statusCode || 500;

  // Send a JSON response with status, success flag, and error message.
  // We do not leak details of the full error stack in production for security.
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Include stack trace only if we are in development environment
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
