import { io } from 'socket.io-client';

// ใช้ environment variable หรือ fallback เป็น localhost ถ้าไม่มีค่า
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

// สร้าง socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false, // ไม่เชื่อมต่อทันทีตอนสร้าง instance
  reconnection: true, // เปิดใช้งานการเชื่อมต่อใหม่อัตโนมัติ
  timeout: 10000, // timeout 10 วินาที
});

socket.on('connect', () => {
  console.log('🟢 Socket connected');
});

socket.on('disconnect', () => {
  console.log('🔴 Socket disconnected');
});

socket.on('connect_error', (error: any) => {
  console.error('❌ Socket connection error:', error);
});

// ฟังก์ชันสำหรับเชื่อมต่อ socket
export const connectSocket = () => {
  try {
    if (!socket.connected) {
      socket.connect();
    }
  } catch (error) {
    console.error('❌ Error connecting socket:', error);
  }
};

// ฟังก์ชันสำหรับตัดการเชื่อมต่อ
export const disconnectSocket = () => {
  try {
    if (socket.connected) {
      socket.disconnect();
    }
  } catch (error) {
    console.error('❌ Error disconnecting socket:', error);
  }
};

// ฟังก์ชันสำหรับส่งการแจ้งเตือน
export const sendNotification = (name: string) => {
  try {
    if (!socket.connected) {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      socket.connect();
    }
    socket.emit('new-notification', { name });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};

// ฟังก์ชันสำหรับรับการแจ้งเตือน
export const subscribeToNotifications = (callback: (data: any) => void) => {
  try {
    socket.on('notification', (data: any) => {
      callback(data);
    });
  } catch (error) {
    console.error('❌ Error subscribing to notifications:', error);
  }
};

// ฟังก์ชันสำหรับยกเลิกการรับการแจ้งเตือน
export const unsubscribeFromNotifications = (callback: (data: any) => void) => {
  try {
    socket.off('notification', callback);
  } catch (error) {
    console.error('❌ Error unsubscribing from notifications:', error);
  }
};

// =============================================================================
// AUCTION ROOM FUNCTIONS
// =============================================================================

// ฟังก์ชันสำหรับเข้าร่วมห้องประมูล
export const joinAuction = (data: {
  auctionId: number;
  userId: number;
  userName?: string;
  companyId?: number;
  companyName?: string;
}) => {
  try {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-auction', data);
  } catch (error) {
    console.error('❌ Error joining auction:', error);
  }
};

// ฟังก์ชันสำหรับออกจากห้องประมูล
export const leaveAuction = (data: { auctionId: number }) => {
  try {
    if (socket.connected) {
      socket.emit('leave-auction', data);
    }
  } catch (error) {
    console.error('❌ Error leaving auction:', error);
  }
};

// ฟังก์ชันสำหรับรับข้อมูลการอัพเดทผู้เข้าร่วมประมูล
export const subscribeToAuctionUpdates = (
  callback: (data: {
    auctionId: number;
    onlineCount: number;
    onlineUsers: Array<{
      userId: number;
      userName: string;
      companyName: string;
      socketId: string;
    }>;
  }) => void
) => {
  try {
    socket.on('auction-participants-updated', (data) => {
      callback(data);
    });
  } catch (error) {
    console.error('❌ Error subscribing to auction updates:', error);
  }
};

// ฟังก์ชันสำหรับยกเลิกการรับข้อมูลการอัพเดทผู้เข้าร่วมประมูล
export const unsubscribeFromAuctionUpdates = () => {
  try {
    socket.off('auction-participants-updated');
  } catch (error) {
    console.error('❌ Error unsubscribing from auction updates:', error);
  }
};

// ฟังก์ชันสำหรับรับยืนยันการเข้าร่วมห้องประมูล
export const subscribeToAuctionJoined = (
  callback: (data: {
    auctionId: number;
    onlineCount: number;
    onlineUsers: Array<any>;
  }) => void
) => {
  try {
    socket.on('auction-joined', (data) => {
      callback(data);
    });
  } catch (error) {
    console.error('❌ Error subscribing to auction joined:', error);
  }
};

// ฟังก์ชันสำหรับยกเลิกการรับยืนยันการเข้าร่วมห้องประมูล
export const unsubscribeFromAuctionJoined = () => {
  try {
    socket.off('auction-joined');
  } catch (error) {
    console.error('❌ Error unsubscribing from auction joined:', error);
  }
};

// =============================================================================
// BID FUNCTIONS
// =============================================================================

// ฟังก์ชันสำหรับรับข้อมูลการเสนอราคาใหม่
export const subscribeToBidUpdates = (
  callback: (data: {
    auctionId: number;
    bidData: {
      bid_id: number;
      auction_id: number;
      user_id: number;
      company_id: number;
      bid_amount: number;
      bid_time: string;
      status: string;
    };
  }) => void
) => {
  try {
    socket.on('new-bid', (data) => {
      callback(data);
    });
  } catch (error) {
    console.error('❌ Error subscribing to bid updates:', error);
  }
};

// ฟังก์ชันสำหรับยกเลิกการรับข้อมูลการเสนอราคา
export const unsubscribeFromBidUpdates = () => {
  try {
    socket.off('new-bid');
  } catch (error) {
    console.error('❌ Error unsubscribing from bid updates:', error);
  }
};

// ฟังก์ชันสำหรับรับข้อมูลการอัปเดทสถานะ bid (reject, cancel, etc.)
export const subscribeToBidStatusUpdates = (
  callback: (data: {
    auctionId: number;
    bidId: number;
    status: string;
    bidData: {
      auction_id: number;
      user_id: number;
      company_id: number;
      bid_amount: number;
      bid_time: string;
      status: string;
      user_name?: string;
      company_name?: string;
    };
  }) => void
) => {
  try {
    socket.on('bid-status-updated', (data) => {
      callback(data);
    });
  } catch (error) {
    console.error('❌ Error subscribing to bid status updates:', error);
  }
};

// ฟังก์ชันสำหรับยกเลิกการรับข้อมูลการอัปเดทสถานะ bid
export const unsubscribeFromBidStatusUpdates = () => {
  try {
    socket.off('bid-status-updated');
  } catch (error) {
    console.error('❌ Error unsubscribing from bid status updates:', error);
  }
};

// =============================================================================
// AUCTION STATUS FUNCTIONS
// =============================================================================

// ฟังก์ชันสำหรับรับข้อมูลการอัปเดทสถานะประมูล
export const subscribeToAuctionStatusUpdates = (
  callback: (data: {
    auctionId: number;
    status: number;
    timestamp: string;
  }) => void
) => {
  try {
    socket.on('auctionStatusUpdate', (data) => {
      callback(data);
    });
  } catch (error) {
    console.error('❌ Error subscribing to auction status updates:', error);
  }
};

// ฟังก์ชันสำหรับยกเลิกการรับข้อมูลการอัปเดทสถานะประมูล
export const unsubscribeFromAuctionStatusUpdates = () => {
  try {
    socket.off('auctionStatusUpdate');
  } catch (error) {
    console.error('❌ Error unsubscribing from auction status updates:', error);
  }
};

export default socket;
