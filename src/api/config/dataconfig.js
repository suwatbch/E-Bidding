const mysql = require('mysql2/promise');

// Database configuration with environment variable support
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'admin_ebidding',
  password: process.env.DB_PASSWORD || 'admin231',
  database: process.env.DB_NAME || 'ebidding',
  charset: 'utf8mb4',
  timezone: '+07:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Log database configuration (without password)
console.log('🔗 Database Configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  environment: process.env.NODE_ENV || 'development',
});

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection with retry logic
async function testConnection(maxRetries = 5, retryDelay = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return true;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.error('💥 Failed to connect to database after all retry attempts');
  return false;
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
