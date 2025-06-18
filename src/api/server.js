const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { authMiddleware } = require('./config/authMiddleware');
const authRouter = require('./controllers/auth');
const languageRouter = require('./controllers/language');
const companyRouter = require('./controllers/company');
const userRouter = require('./controllers/users');
const userCompanyRouter = require('./controllers/userCompany');
const auctionsRouter = require('./controllers/auctions');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Global Authentication Middleware
app.use(authMiddleware);

// Environment variables
const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || `http://localhost`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO setup with better configuration
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/languages', languageRouter);
app.use('/api/company', companyRouter);
app.use('/api/users', userRouter);
app.use('/api/user-company', userCompanyRouter);
app.use('/api/auctions', auctionsRouter);

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Handle auction updates
  socket.on('auction-update', (data) => {
    try {
      io.emit('auction-update', data);
      console.log('📢 Auction update broadcasted:', data);
    } catch (error) {
      console.error('❌ Error broadcasting auction update:', error);
      socket.emit('error', { message: 'Failed to broadcast auction update' });
    }
  });

  // Handle notifications
  socket.on('new-notification', async (data) => {
    try {
      const response = await fetch(
        `${SERVER_URL}:${PORT}/api/auctions/notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      console.log('✅ Notification logged:', result);

      io.emit('notification', data);
    } catch (error) {
      console.error('❌ Error processing notification:', error);
      socket.emit('error', { message: 'Failed to process notification' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_URL}:${PORT}`);
});
