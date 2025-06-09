'use client';

import { useState, useEffect } from 'react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SaveIcon from '@mui/icons-material/Save';
import {
  connectSocket,
  disconnectSocket,
  sendNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/app/services/socketService';
import Container from '@/app/components/ui/Container';

export default function AlertsPage() {
  const [notificationName, setNotificationName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อโหลดหน้า
    connectSocket();
    setIsConnected(true);
    console.log('Socket connected');

    // รับการแจ้งเตือนใหม่
    const handleNewNotification = (data: { name: string }) => {
      console.log('New notification received:', data);
      setSavedName(data.name); // อัพเดทการแสดงผลเมื่อได้รับการแจ้งเตือนใหม่
    };

    // สมัครรับการแจ้งเตือน
    subscribeToNotifications(handleNewNotification);

    // cleanup เมื่อออกจากหน้า
    return () => {
      unsubscribeFromNotifications(handleNewNotification);
      disconnectSocket();
      setIsConnected(false);
      console.log('Socket disconnected');
    };
  }, []);

  const handleSaveNotification = () => {
    if (notificationName.trim()) {
      console.log('Sending notification:', notificationName);
      // ส่งการแจ้งเตือนผ่าน socket อย่างเดียว ไม่ต้องเซ็ต state โดยตรง
      sendNotification(notificationName.trim());
      setNotificationName('');
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">การแจ้งเตือน</h1>
        <p className="mt-2 text-gray-600">จัดการการแจ้งเตือนของคุณ</p>
        <p className="mt-1 text-sm text-gray-500">
          สถานะการเชื่อมต่อ: {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
        </p>
      </div>

      {/* Notification Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <NotificationsActiveIcon className="text-blue-600 w-6 h-6" />
            <h2 className="text-2xl font-semibold">ตั้งค่าการแจ้งเตือน</h2>
          </div>

          {/* Input Form */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={notificationName}
              onChange={(e) => setNotificationName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && notificationName.trim()) {
                  handleSaveNotification();
                }
              }}
              placeholder="กรอกชื่อที่ต้องการรับการแจ้งเตือน..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSaveNotification}
              disabled={!notificationName.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="w-5 h-5" />
              บันทึก
            </button>
          </div>

          {/* Display Area */}
          <div className="bg-gray-50 rounded-lg p-6">
            {savedName ? (
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{savedName}</p>
                <p className="text-sm text-gray-500 mt-2">การแจ้งเตือนล่าสุด</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <NotificationsActiveIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ยังไม่มีรายการแจ้งเตือน</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
