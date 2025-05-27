const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const auctionRoutes = require('./routes/auction');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// รับค่า .env
const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || `http://localhost`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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

  socket.on('new-notification', (data) => {
    io.emit('notification', data);
  });
});

// API Routes
app.use('/api/auctions', auctionRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_URL}:${PORT}`);
}); 