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
const auctionTypeRouter = require('./controllers/auctionType');
const auctionsHelper = require('./helper/auctionsHelper');

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
app.use('/api/language', languageRouter);
app.use('/api/company', companyRouter);
app.use('/api/users', userRouter);
app.use('/api/user-company', userCompanyRouter);
app.use('/api/auctions', auctionsRouter);
app.use('/api/auction-type', auctionTypeRouter);

// Make io accessible to routes
app.set('io', io);

// Store auction room data
const auctionRooms = new Map(); // auctionId -> Set of socket.id
const userSockets = new Map(); // socket.id -> { userId, auctionId, userInfo }

// Helper function to get online users in auction
const getAuctionOnlineUsers = (auctionId) => {
  const room = auctionRooms.get(auctionId);
  if (!room) return [];

  const onlineUsers = [];
  room.forEach((socketId) => {
    const userInfo = userSockets.get(socketId);
    if (userInfo) {
      onlineUsers.push({
        userId: userInfo.userId,
        userName: userInfo.userName,
        companyName: userInfo.companyName,
        socketId: socketId,
      });
    }
  });
  return onlineUsers;
};

// Helper function to broadcast auction participants update
const broadcastAuctionUpdate = (auctionId) => {
  const onlineUsers = getAuctionOnlineUsers(auctionId);
  const roomName = `auction-${auctionId}`;

  io.to(roomName).emit('auction-participants-updated', {
    auctionId: auctionId,
    onlineCount: onlineUsers.length,
    onlineUsers: onlineUsers,
  });

  console.log(`📊 Auction ${auctionId}: ${onlineUsers.length} users online`);
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Handle joining auction room
  socket.on('join-auction', async (data) => {
    console.log('📥 Received join-auction event:', data);
    try {
      const { auctionId, userId, userName, companyId, companyName } = data;

      if (!auctionId || !userId) {
        console.log('❌ Missing required fields:', { auctionId, userId });
        socket.emit('error', { message: 'auctionId and userId are required' });
        return;
      }

      const roomName = `auction-${auctionId}`;

      // ทุกคนสามารถ join room ได้ (เพื่อดูข้อมูล)
      socket.join(roomName);

      // ตรวจสอบว่า user เป็น participant ของ auction หรือไม่
      console.log('🔍 Checking participant:', { auctionId, userId, companyId });
      const isParticipant = await auctionsHelper.isUserAuctionParticipant(
        auctionId,
        userId,
        companyId
      );
      console.log('✅ Participant check result:', isParticipant);

      if (isParticipant) {
        // Leave previous auction room if exists
        const currentUserInfo = userSockets.get(socket.id);
        if (currentUserInfo && currentUserInfo.auctionId !== auctionId) {
          const oldRoomName = `auction-${currentUserInfo.auctionId}`;
          socket.leave(oldRoomName);

          // Remove from old room tracking
          const oldRoom = auctionRooms.get(currentUserInfo.auctionId);
          if (oldRoom) {
            oldRoom.delete(socket.id);
            broadcastAuctionUpdate(currentUserInfo.auctionId);
          }
        }

        // Track user info (เฉพาะ participants เท่านั้น)
        userSockets.set(socket.id, {
          userId,
          userName: userName || `User ${userId}`,
          companyId: companyId || null,
          companyName: companyName || `Company ${userId}`,
          auctionId,
        });

        // Track room participants (เฉพาะ participants เท่านั้น)
        if (!auctionRooms.has(auctionId)) {
          auctionRooms.set(auctionId, new Set());
        }
        auctionRooms.get(auctionId).add(socket.id);

        console.log(`👤 Participant ${userId} joined auction ${auctionId}`);

        // Broadcast updated participant list
        broadcastAuctionUpdate(auctionId);
      } else {
        console.log(
          `👁️ User ${userId} viewing auction ${auctionId} (not a participant)`
        );
      }

      // Send current room info to the user
      const onlineUsers = getAuctionOnlineUsers(auctionId);
      socket.emit('auction-joined', {
        auctionId,
        onlineCount: onlineUsers.length,
        onlineUsers,
      });
    } catch (error) {
      console.error('❌ Error joining auction:', error);
      socket.emit('error', { message: 'Failed to join auction' });
    }
  });

  // Handle leaving auction room
  socket.on('leave-auction', (data) => {
    try {
      const { auctionId } = data;
      const userInfo = userSockets.get(socket.id);

      if (userInfo && userInfo.auctionId === auctionId) {
        const roomName = `auction-${auctionId}`;
        socket.leave(roomName);

        // Remove from room tracking
        const room = auctionRooms.get(auctionId);
        if (room) {
          room.delete(socket.id);
          console.log(`👤 User ${userInfo.userId} left auction ${auctionId}`);
          broadcastAuctionUpdate(auctionId);
        }

        // Remove user info
        userSockets.delete(socket.id);
      }
    } catch (error) {
      console.error('❌ Error leaving auction:', error);
      socket.emit('error', { message: 'Failed to leave auction' });
    }
  });

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

    // Clean up user from auction rooms
    const userInfo = userSockets.get(socket.id);
    if (userInfo) {
      const { auctionId, userId } = userInfo;

      // Remove from room tracking
      const room = auctionRooms.get(auctionId);
      if (room) {
        room.delete(socket.id);
        console.log(`👤 User ${userId} disconnected from auction ${auctionId}`);
        broadcastAuctionUpdate(auctionId);
      }

      // Remove user info
      userSockets.delete(socket.id);
    }
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
