/**
 * Chat Routes Configuration
 * 
 * Maps incoming HTTP routes to their respective controller handlers.
 * This router handles AI chatbot requests.
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Define a POST route for sending messages to the AI chatbot.
// This route will be exposed at `/api/chat` after mounting in server.js.
router.post('/', chatController.handleChat);

module.exports = router;
