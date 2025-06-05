'use client';

import React from 'react';

interface LoadingStateProps {
  colSpan?: number;
  height?: string;
  message?: string;
}

export default function LoadingState({
  colSpan = 7,
  height = 'py-8',
  message = 'กำลังโหลดข้อมูล...',
}: LoadingStateProps) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className={`flex flex-col justify-center items-center ${height}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </td>
    </tr>
  );
}
