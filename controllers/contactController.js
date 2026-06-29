/**
 * Contact Controller
 * 
 * Handles incoming HTTP requests for portfolio contact form submissions.
 * It validates inputs (presence and format) and interacts with the Contact model
 * to save data, handling success and error cases cleanly.
 */

const Contact = require('../models/contactModel');

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
 * Validates request body fields and inserts them into the MySQL database.
 */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // --- Validation Section ---
    const errors = [];

    // Check if name is provided and not empty (after trimming whitespace)
    if (!name || name.trim() === '') {
      errors.push('Name is required.');
    }

    // Check if email is provided and not empty
    if (!email || email.trim() === '') {
      errors.push('Email is required.');
    } else if (!isValidEmail(email)) {
      // Validate email format
      errors.push('Please provide a valid email address.');
    }

    // Check if subject is provided and not empty
    if (!subject || subject.trim() === '') {
      errors.push('Subject is required.');
    }

    // Check if message is provided and not empty
    if (!message || message.trim() === '') {
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
    // Prepare the trimmed data
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
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
