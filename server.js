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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Load env configurations before doing anything else
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy is required when hosting behind a reverse proxy (e.g., Render, Heroku)
// to make express-rate-limit identify users correctly based on their real IP addresses.
app.set('trust proxy', 1);

// --- Global Security Headers (Helmet) ---
app.use(helmet());

// --- CORS Middleware Setup ---
// Configure allowed origins, ensuring Netlify frontend works as expected.
// Localhost ports (3000, 5173, 8080) are only whitelisted in non-production environments.
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080'
    ].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow tools like Postman, curl, or server-to-server requests which send no Origin header.
    if (!origin) {
      return callback(null, true);
    }
    
    // In development mode, bypass origin restrictions
    if (process.env.NODE_ENV !== 'production') {
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
  credentials: true
};

// Apply CORS middleware configuration
app.use(cors(corsOptions));

// --- Body Parsing Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Uploads Middleware ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Rate Limiter Setup ---
// Restrict requests to /api/contact to prevent spam (max 100 requests per 15 minutes)
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many contact submissions from this IP. Please try again after 15 minutes.'
  }
});

// Restrict requests to /api/chat to prevent OpenRouter key abuse (max 60 requests per 15 minutes)
const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 chat requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat requests from this IP. Please try again after 15 minutes.'
  }
});

// --- API Routing Configuration ---
// Mount contact form router under "/api/contact" with rate limiting applied
app.use('/api/contact', contactRateLimiter, require('./routes/contactRoutes'));

// Mount AI chatbot router under "/api/chat" with rate limiting applied
app.use('/api/chat', chatRateLimiter, require('./routes/chatRoutes'));

// Health check endpoint for uptime monitors and platform deployment verification (e.g. Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date()
  });
});

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
