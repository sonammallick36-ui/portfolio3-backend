/**
 * Contact Controller
 * 
 * Handles incoming HTTP requests for portfolio contact form submissions.
 * It validates inputs (presence and format) and interacts with the Contact model
 * to save data, handling success and error cases cleanly.
 */

const Contact = require('../models/contactModel');
const xss = require('xss');

/**
 * Helper function to validate email addresses using a regular expression.
 * 
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function isValidEmail(email) {
  // Standard RFC 5322 regex for checking basic email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle POST /api/contact API requests.
 * Sanitizes input parameters using the 'xss' package and then performs validation.
 * Inserts the safe data into the MySQL database if valid.
 */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // --- Sanitization Section ---
    // Sanitize input values with 'xss' to close Stored XSS gaps.
    // Trim remaining whitespace to prevent saving empty/whitespace messages.
    const sanitizedName = name ? xss(name).trim() : '';
    const sanitizedEmail = email ? xss(email).trim() : '';
    const sanitizedSubject = subject ? xss(subject).trim() : '';
    const sanitizedMessage = message ? xss(message).trim() : '';

    // --- Validation Section ---
    const errors = [];

    // Check if name is provided and not empty
    if (!sanitizedName) {
      errors.push('Name is required.');
    }

    // Check if email is provided and not empty
    if (!sanitizedEmail) {
      errors.push('Email is required.');
    } else if (!isValidEmail(sanitizedEmail)) {
      // Validate email format
      errors.push('Please provide a valid email address.');
    }

    // Check if subject is provided and not empty
    if (!sanitizedSubject) {
      errors.push('Subject is required.');
    }

    // Check if message is provided and not empty
    if (!sanitizedMessage) {
      errors.push('Message is required.');
    }

    // If there are validation failures, return a 400 Bad Request response with the list of errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // --- Database Insertion Section ---
    // Use the sanitized data for insertion
    const contactData = {
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage
    };

    // Insert the details through the Contact model
    const result = await Contact.create(contactData);

    // Return a 201 Created status and success JSON payload
    return res.status(201).json({
      success: true,
      message: 'Thank you! Your contact message has been sent successfully.',
      data: {
        id: result.insertId,
        name: contactData.name,
        email: contactData.email
      }
    });

  } catch (error) {
    // If an error occurs, pass it to the express next() function to let our
    // global error handling middleware send a standard JSON error response.
    next(error);
  }
};

/**
 * Retrieve all contact messages (Admin-only).
 * Requires query parameter `?password=...` matching process.env.ADMIN_PASSWORD.
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { password } = req.query;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Fallback if not configured

    if (!password || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please provide a valid password.'
      });
    }

    const messages = await Contact.findAll();
    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    next(error);
  }
};
