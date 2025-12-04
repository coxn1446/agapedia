const http = require('http');
const { initializeDatabase, closeDatabase } = require('./server/db');
const loadApp = require('./server/loaders');
const { initializeSocket } = require('./server/socket');

const PORT = process.env.PORT || 5000;

let server = null;

const startServer = async () => {
  try {
    // Initialize database connection
    // In development, this will fail if DB doesn't exist, which is expected
    try {
      await initializeDatabase();
    } catch (dbError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Database connection failed. Server will start but database features will not work.');
        console.warn('To fix: Create the database and set up environment variables.');
      } else {
        throw dbError;
      }
    }

    // Load Express app with all middleware
    const app = await loadApp();

    // Create HTTP server
    server = http.createServer(app);

    // Initialize Socket.io
    initializeSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      
      try {
        await closeDatabase();
        console.log('Database connections closed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
  } else {
    await closeDatabase();
    process.exit(0);
  }
};

// Start the server
startServer();

