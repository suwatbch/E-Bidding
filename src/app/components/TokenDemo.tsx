'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  useTokenExpiration,
  formatExpirationDate,
} from '@/app/hooks/useTokenExpiration';
import TokenStatus from './TokenStatus';

const TokenDemo: React.FC = () => {
  const {
    user,
    isAuthenticated,
    tokenExpiresAt,
    isTokenExpired,
    getTimeUntilExpiration,
    logout,
  } = useAuth();

  const { timeRemaining, isExpiringSoon, timeRemainingMs } =
    useTokenExpiration();

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-gray-600">ยังไม่ได้ Login</h3>
        <p className="text-sm text-gray-500">กรุณา login เพื่อดูข้อมูล token</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white border rounded-lg shadow">
      <h3 className="text-lg font-bold text-gray-800">
        📊 ข้อมูล Token Session
      </h3>

      {/* User Info */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="font-semibold text-blue-800">👤 ข้อมูลผู้ใช้:</h4>
        <p className="text-sm">ชื่อ: {user?.full_name}</p>
        <p className="text-sm">Username: {user?.username}</p>
        <p className="text-sm">Role: {user?.role}</p>
      </div>

      {/* Token Status Widget */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">🔐 สถานะ Token:</h4>
        <TokenStatus showDetails={true} />
      </div>

      {/* Detailed Token Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">
          ⏰ รายละเอียด Token:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <strong>วันที่หมดอายุ:</strong>
            <br />
            {tokenExpiresAt
              ? formatExpirationDate(tokenExpiresAt)
              : 'ไม่มีข้อมูล'}
          </div>
          <div>
            <strong>เวลาเหลือ:</strong>
            <br />
            {timeRemaining}
          </div>
          <div>
            <strong>เวลาเหลือ (มิลลิวินาที):</strong>
            <br />
            {timeRemainingMs.toLocaleString()} ms
          </div>
          <div>
            <strong>สถานะ:</strong>
            <br />
            {isTokenExpired() ? '❌ หมดอายุแล้ว' : '✅ ยังใช้ได้'}
          </div>
          <div>
            <strong>เตือนหมดอายุ:</strong>
            <br />
            {isExpiringSoon ? '⚠️ ใกล้หมดอายุ' : '😊 ยังไม่ต้องกังวล'}
          </div>
          <div>
            <strong>Authentication:</strong>
            <br />
            {isAuthenticated ? '🔓 Authenticated' : '🔒 Not Authenticated'}
          </div>
        </div>
      </div>

      {/* Manual Check Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            const expired = isTokenExpired();
            alert(`Token ${expired ? 'หมดอายุแล้ว' : 'ยังใช้ได้'}`);
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          🔍 ตรวจสอบ Token
        </button>

        <button
          onClick={() => {
            const timeLeft = getTimeUntilExpiration();
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            alert(`เหลือเวลา: ${hours} ชั่วโมง ${minutes} นาที`);
          }}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          ⏱️ เช็คเวลาเหลือ
        </button>

        <button
          onClick={() => {
            if (confirm('ต้องการออกจากระบบหรือไม่?')) {
              logout();
            }
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          🚪 Logout
        </button>
      </div>

      {/* Real-time Update Indicator */}
      <div className="text-xs text-gray-500 border-t pt-2">
        💡 <strong>หมายเหตุ:</strong> ข้อมูลนี้อัปเดตแบบ real-time ทุกวินาที
        และระบบจะตรวจสอบ token ทุก 1 นาที
      </div>
    </div>
  );
};

export default TokenDemo;
