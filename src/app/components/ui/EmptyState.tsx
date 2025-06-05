'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  colSpan?: number;
  height?: string;
}

export default function EmptyState({
  title = 'ไม่พบข้อมูล',
  description = 'ไม่พบข้อมูลที่ตรงกับการค้นหา',
  colSpan = 7,
  height = 'h-64',
}: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className={`text-center py-8 ${height}`}>
          <div className="w-16 h-16 mb-4 text-gray-300 mx-auto">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </td>
    </tr>
  );
}
