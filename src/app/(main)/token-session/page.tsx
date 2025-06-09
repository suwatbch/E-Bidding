'use client';

import React from 'react';
import TokenDemo from '@/app/components/TokenDemo';

export default function TokenDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔐 Token Management Demo
          </h1>
          <p className="text-gray-600">
            ระบบจัดการ Token แบบ Real-time พร้อมตรวจสอบการหมดอายุ
          </p>
        </div>

        {/* Demo Component */}
        <TokenDemo />

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📖 วิธีใช้งาน:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• หากยังไม่ได้ login กรุณา login ก่อนเพื่อดูข้อมูล token</li>
            <li>• Token จะหมดอายุใน 1 วัน หลังจาก login</li>
            <li>• ระบบจะเตือนเมื่อเหลือ 30 นาทีก่อนหมดอายุ</li>
            <li>• ข้อมูลจะอัปเดตแบบ real-time ทุกวินาที</li>
            <li>• ระบบจะ auto-logout เมื่อ token หมดอายุ</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            ← กลับหน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}
