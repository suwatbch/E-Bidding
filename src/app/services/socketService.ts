import { io } from 'socket.io-client';

// ใช้ environment variable หรือ fallback เป็น localhost ถ้าไม่มีค่า
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// สร้าง socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false, // ไม่เชื่อมต่อทันทีตอนสร้าง instance
  reconnection: true, // เปิดใช้งานการเชื่อมต่อใหม่อัตโนมัติ
  timeout: 10000, // timeout 10 วินาที
});

socket.on('connect', () => {
  // console.log('🟢 Socket connected');
});

socket.on('disconnect', () => {
  // console.log('🔴 Socket disconnected');
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
    console.log('📤 Notification sent:', name);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};

// ฟังก์ชันสำหรับรับการแจ้งเตือน
export const subscribeToNotifications = (callback: (data: any) => void) => {
  try {
    socket.on('notification', (data: any) => {
      console.log('📨 Notification received:', data);
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

export default socket;
