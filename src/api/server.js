const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const auctionRoutes = require('./routes/auction');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// รับค่า environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SERVER_URL = process.env.SERVER_URL || `http://localhost`;

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('🟢 Client connected, socket id:', socket.id);

  socket.on('new-notification', (data) => {
    console.log('📨 Received notification:', data);
    io.emit('notification', data);
    console.log('📤 Sent notification to all clients');
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected, socket id:', socket.id);
  });
});

// API Routes
app.use('/api/auctions', auctionRoutes);

// Test route
app.get('/api/test', (req, res) => {
  console.log('📝 Test API called');
  res.json({ message: 'API is working!' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📡 Socket.IO ready on port ${PORT}
🌐 API available at ${SERVER_URL}:${PORT}
  `);
}); 