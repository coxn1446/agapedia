const { Server } = require('socket.io');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.DEFAULT_CLIENT_URL || process.env.QA_CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Placeholder: Add real-time event handlers here
    // Example: socket.on('join-room', (roomId) => { ... });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket() first.');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};

