/**
 * Contact Routes Configuration
 * 
 * Maps incoming HTTP routes to their respective controller handlers.
 * This router handles operations related to contact submissions.
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Define a POST route for submitting contact messages.
// This route will be exposed at `/api/contact` after mounting in server.js.
router.post('/', contactController.submitContact);

// Define a GET route for retrieving messages with admin privileges
router.get('/messages', contactController.getMessages);

module.exports = router;
