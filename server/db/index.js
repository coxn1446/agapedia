const { Pool } = require('pg');

let pool = null;

const initializeDatabase = async () => {
  try {
    const config = getDatabaseConfig();
    
    pool = new Pool(config);
    
    // Test connection
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production' || env === 'qa') {
    // Production/QA: Use Cloud SQL with Unix socket
    return {
      host: process.env.DB_INSTANCE_UNIX_SOCKET || process.env.QA_DB_INSTANCE_UNIX_SOCKET,
      user: process.env.DB_USER || process.env.QA_DB_USER,
      password: process.env.DB_PASSWORD || process.env.QA_DB_PASSWORD,
      database: process.env.DB_DATABASE || process.env.QA_DB_DATABASE,
      // Cloud SQL connection via Unix socket
    };
  } else {
    // Development: Use local PostgreSQL
    return {
      host: process.env.REACT_APP_DB_host || 'localhost',
      port: process.env.REACT_APP_DB_port || 5432,
      user: process.env.REACT_APP_DB_user || 'postgres',
      password: process.env.REACT_APP_DB_password || 'postgres',
      database: process.env.REACT_APP_DB_database || 'agapedia',
    };
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed');
  }
};

module.exports = {
  initializeDatabase,
  getPool,
  closeDatabase,
};

