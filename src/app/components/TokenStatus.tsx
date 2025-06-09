'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  useTokenExpiration,
  formatExpirationDate,
} from '@/app/hooks/useTokenExpiration';

interface TokenStatusProps {
  showDetails?: boolean;
  className?: string;
}

const TokenStatus: React.FC<TokenStatusProps> = ({
  showDetails = false,
  className = '',
}) => {
  const { isAuthenticated, tokenExpiresAt, logout } = useAuth();
  const { isExpired, timeRemaining, isExpiringSoon } = useTokenExpiration();

  if (!isAuthenticated || !tokenExpiresAt) {
    return null;
  }

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (isExpiringSoon) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (isExpired) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (isExpiringSoon) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  if (isExpired) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()} ${className}`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">Session หมดอายุ</span>
        <button
          onClick={logout}
          className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()} ${className}`}
    >
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {isExpiringSoon
            ? '⚠️ Session จะหมดอายุเร็วๆ นี้'
            : '✅ Session ใช้งานได้'}
        </span>
        <span className="text-xs opacity-75">เหลือเวลา: {timeRemaining}</span>
        {showDetails && tokenExpiresAt && (
          <span className="text-xs opacity-60">
            หมดอายุ: {formatExpirationDate(tokenExpiresAt)}
          </span>
        )}
      </div>
      {isExpiringSoon && (
        <button
          onClick={() => {
            if (
              confirm('ต้องการต่ออายุ session หรือไม่? (จะต้อง login ใหม่)')
            ) {
              logout();
            }
          }}
          className="ml-2 px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          ต่ออายุ
        </button>
      )}
    </div>
  );
};

export default TokenStatus;
