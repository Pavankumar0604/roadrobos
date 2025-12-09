const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL Connection Pool Configuration
// This configuration works with both local MySQL and cPanel MySQL

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'roadrobos_db',
  port: process.env.DB_PORT || 3306,
  
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // Additional settings for reliability
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // Timezone configuration
  timezone: '+05:30', // IST timezone
  
  // Character set
  charset: 'utf8mb4',
  
  // Date strings - prevent date conversion issues
  dateStrings: [
    'DATE',
    'DATETIME'
  ]
};

// Create connection pool
let pool;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    pool.getConnection()
      .then(connection => {
        console.log('✅ MySQL Database connected successfully');
        connection.release();
      })
      .catch(err => {
        console.error('❌ MySQL Database connection failed:', err.message);
        console.error('Please check your database configuration in .env file');
      });
  }
  return pool;
};

// Helper function to execute queries
const query = async (sql, params = []) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function for transactions
const transaction = async (callback) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Close pool (for graceful shutdown)
const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('MySQL connection pool closed');
  }
};

// Health check function
const healthCheck = async () => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as health');
    connection.release();
    return rows[0].health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

module.exports = {
  getPool,
  query,
  transaction,
  closePool,
  healthCheck
};
