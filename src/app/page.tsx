'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useLanguage } from './contexts/LanguageContext';

export default function HomePage() {
  const { isLoading } = useLanguage();

  // โหลดข้อมูลภาษาเสร็จแล้ว redirect ไป login ทันที
  useEffect(() => {
    if (!isLoading) {
      redirect('/login');
    }
  }, [isLoading]);

  // แสดง loading ระหว่างโหลดข้อมูลภาษา
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            E-Bidding System
          </h1>
          <p className="text-gray-600">ระบบประมูลออนไลน์</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">กำลังเริ่มต้นระบบ...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
