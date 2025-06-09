const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: '115.178.63.11',
  port: 3306,
  user: 'swmaxnet_admin',
  password: '%2Y2il5c0',
  database: 'swmaxnet_ebidding',
  charset: 'utf8mb4',
  timezone: '+07:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Get database connection
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('❌ Failed to get connection:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getConnection,
};
