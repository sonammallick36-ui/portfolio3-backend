/**
 * Database Configuration File
 * 
 * This file establishes a connection pool to the MySQL database using the mysql2/promise library.
 * It also automatically initializes the required `contacts` table if it does not exist,
 * making deployment on platforms like Render or local setups simpler and automated.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a database connection pool. A pool allows us to reuse database connections,
// improving performance under concurrent requests.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Initialize the Database
 * 
 * Verifies connection connectivity and ensures the required table exists.
 */
async function initializeDatabase() {
  let connection;
  try {
    // Attempt to acquire a connection from the pool to verify settings
    connection = await pool.getConnection();
    console.log('✅ Successfully connected to the MySQL database.');

    // SQL query to create the contacts table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    // Execute the table creation query
    await connection.query(createTableQuery);
    console.log('✅ Contacts table verified / created successfully.');
  } catch (error) {
    let detail = error.message;
    // Node.js 16+ throws AggregateError on connection failure if localhost resolves to both IPv4 and IPv6.
    // This extracts the specific connection errors from inside the AggregateError.
    if (!detail && error.errors && error.errors.length > 0) {
      detail = error.errors.map(e => e.message).join('; ');
    }
    if (!detail) {
      detail = error.code || error.toString();
    }
    console.error('❌ Database initialization error:', detail);
    console.error('Please verify your database server is running and .env credentials are correct.');
  } finally {
    // Release the connection back to the pool if it was established
    if (connection) connection.release();
  }
}

// Run database verification and table creation
initializeDatabase();

// Export the database pool to be used in other models
module.exports = pool;
