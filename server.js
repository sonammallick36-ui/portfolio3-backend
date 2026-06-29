/**
 * Main Application Server Entry Point
 * 
 * Configures the Express app, loads environment variables, registers middlewares,
 * mounts routes, and starts listening for HTTP traffic.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// Load env configurations before doing anything else
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Middleware Setup ---
// Configure allowed origins, ensuring Netlify frontend works as expected.
// We also whitelist common local ports (Vite, CRA, etc.) to make development easier.
const allowedOrigins = [
  process.env.FRONTEND_URL, // From environment file (e.g., your Netlify domain)
  'http://localhost:3000',  // React / Next.js default port
  'http://localhost:5173',  // Vite default port
  'http://localhost:8080'   // Vue default port
].filter(Boolean);          // Removes any empty values if FRONTEND_URL is not set

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow tools like Postman, curl, or server-to-server requests which send no Origin header.
    // 2. In non-production environments, allow all origins for debugging ease.
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check if the requesting domain is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Access blocked by CORS policy. This origin is not allowed access.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow session cookies / cookies to pass through if added later
};

// Apply CORS middleware configuration
app.use(cors(corsOptions));

// --- Body Parsing Middleware ---
// Parse incoming requests with JSON payloads (e.g. from frontend fetch / axios calls)
app.use(express.json());
// Parse incoming URL-encoded form data payloads
app.use(express.urlencoded({ extended: true }));

// --- Static Uploads Middleware ---
// Expose the uploads directory publicly so uploaded media files can be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routing Configuration ---
// Mount our contact form router under the path "/api/contact"
app.use('/api/contact', require('./routes/contactRoutes'));

// Welcome/Status endpoint to test if the API server is online
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Portfolio Website Backend API!',
    status: 'Operational',
    timestamp: new Date()
  });
});

// --- Fallback for Undefined Routes ---
app.use((req, res, next) => {
  const error = new Error(`Endpoint not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// --- Error Handling Middleware ---
// Registers our custom global error handler to format errors as JSON objects
app.use(errorHandler);

// --- Server Startup ---
// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
