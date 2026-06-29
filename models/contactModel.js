/**
 * Contact Model
 * 
 * Defines the database interactions for the `contacts` table.
 * It uses the database pool connection exported from config/db.js.
 */

const db = require('../config/db');

class Contact {
  /**
   * Insert a new contact form submission into the database.
   * 
   * @param {Object} contactData - The contact details.
   * @param {string} contactData.name - The name of the user.
   * @param {string} contactData.email - The email address of the user.
   * @param {string} contactData.subject - The subject of the message.
   * @param {string} contactData.message - The content of the message.
   * @returns {Promise<Object>} The result of the insert query execution (e.g., insertId).
   */
  static async create(contactData) {
    const { name, email, subject, message } = contactData;
    
    // SQL query to insert contact data. Using placeholders (?) avoids SQL injection attacks.
    const query = `
      INSERT INTO contacts (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `;

    try {
      // Execute the query using the pool. This automatically gets a connection and releases it.
      const [result] = await db.query(query, [name, email, subject, message]);
      return result;
    } catch (error) {
      // Extract detailed message for AggregateError or standard Error
      let detail = error.message;
      if (!detail && error.errors && error.errors.length > 0) {
        detail = error.errors.map(e => e.message).join('; ');
      }
      if (!detail) {
        detail = error.code || error.toString();
      }
      // Throw the error so the controller/middleware can capture and log/handle it
      throw new Error(`Failed to create contact record: ${detail}`);
    }
  }

  /**
   * Optional helper to retrieve all contacts.
   * Useful if you ever expand the backend to include an admin dashboard.
   */
  static async findAll() {
    const query = 'SELECT * FROM contacts ORDER BY created_at DESC';
    try {
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }
  }
}

module.exports = Contact;
