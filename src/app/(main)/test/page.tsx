'use client';

import { useState } from 'react';
import Container from '@/app/components/ui/Container';
import ThaiDatePicker, {
  getThaiDisplayDate,
  getThaiDisplayDateTime,
  getDataDate,
  getDataDateTime,
} from '@/app/components/ui/DatePicker';

export default function TestPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  // กำหนดขอบเขตปี: ปีปัจจุบัน ± 10 ปี
  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear - 10, 0, 1); // 1 มกราคม ของ 10 ปีที่แล้ว
  const maxDate = new Date(currentYear + 10, 11, 31); // 31 ธันวาคม ของ 10 ปีข้างหน้า

  return (
    <Container className="py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-8 h-8 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                ทดสอบ ThaiDatePicker Component
              </h1>
              <p className="text-gray-600 mt-1">
                ตัวอย่างการใช้งาน ThaiDatePicker Component
                ที่สามารถนำไปใช้ซ้ำได้
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Only */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              ปฏิทินธรรมดา
            </h2>

            <ThaiDatePicker
              selected={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              label="เลือกวันที่"
              placeholder="กรุณาเลือกวันที่"
              minDate={minDate}
              maxDate={maxDate}
              className="w-full"
            />

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>วันที่ที่เลือก (แสดงผล):</strong>{' '}
                {getThaiDisplayDate(selectedDate)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>วันที่สำหรับใช้งาน (ค.ศ.):</strong>{' '}
                {getDataDate(selectedDate)}
              </p>
            </div>
          </div>

          {/* Calendar with Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              ปฏิทินพร้อมเวลา
            </h2>

            <ThaiDatePicker
              selected={selectedDateTime}
              onChange={(date) => date && setSelectedDateTime(date)}
              label="เลือกวันและเวลา"
              placeholder="กรุณาเลือกวันและเวลา"
              showTimeSelect={true}
              timeCaption="เวลา"
              minDate={minDate}
              maxDate={maxDate}
              className="w-full"
            />

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>วันเวลาที่เลือก (แสดงผล):</strong>{' '}
                {getThaiDisplayDateTime(selectedDateTime)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>วันเวลาสำหรับใช้งาน (ค.ศ.):</strong>{' '}
                {getDataDateTime(selectedDateTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Component Usage Examples */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
              />
            </svg>
            ตัวอย่างการใช้งาน Component
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Import Component:
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`import ThaiDatePicker, { 
  getThaiDisplayDate, 
  getThaiDisplayDateTime, 
  getDataDate, 
  getDataDateTime 
} from '@/app/components/ui/ThaiDatePicker';`}
            </pre>

            <h3 className="font-medium text-gray-900 mb-3 mt-4">
              การใช้งานแบบเลือกเฉพาะวันที่:
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<ThaiDatePicker
  selected={selectedDate}
  onChange={(date) => date && setSelectedDate(date)}
  label="เลือกวันที่"
  placeholder="กรุณาเลือกวันที่"
  className="w-full"
/>`}
            </pre>

            <h3 className="font-medium text-gray-900 mb-3 mt-4">
              การใช้งานแบบเลือกวันที่และเวลา:
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<ThaiDatePicker
  selected={selectedDateTime}
  onChange={(date) => date && setSelectedDateTime(date)}
  label="เลือกวันและเวลา"
  placeholder="กรุณาเลือกวันและเวลา"
  showTimeSelect={true}
  timeCaption="เวลา"
  className="w-full"
/>`}
            </pre>

            <h3 className="font-medium text-gray-900 mb-3 mt-4">
              Helper Functions:
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`// แสดงผลวันที่แบบไทย (พ.ศ.)
const displayDate = getThaiDisplayDate(selectedDate); // "05/06/2568"

// แสดงผลวันเวลาแบบไทย (พ.ศ.)
const displayDateTime = getThaiDisplayDateTime(selectedDateTime); // "05/06/2568 14:30"

// รูปแบบข้อมูลสำหรับส่งไปยัง API (ค.ศ.)
const dataDate = getDataDate(selectedDate); // "2025/06/05"
const dataDateTime = getDataDateTime(selectedDateTime); // "2025/06/05 14:30"`}
            </pre>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            ฟีเจอร์ของ ThaiDatePicker Component
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.932 6.932 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <h3 className="font-medium text-gray-900">
                  Reusable Component
                </h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• สามารถนำไปใช้ซ้ำได้ทุกที่</li>
                <li>• Props ที่ยืดหยุ่น</li>
                <li>• TypeScript support</li>
                <li>• Clean API interface</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                  />
                </svg>
                <h3 className="font-medium text-gray-900">Thai Features</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• แสดงผลเป็นพุทธศักราช</li>
                <li>• ภาษาไทยสมบูรณ์</li>
                <li>• รูปแบบวันที่ไทย</li>
                <li>• Helper functions ครบครัน</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                <h3 className="font-medium text-gray-900">Beautiful UI</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• การออกแบบที่สวยงาม</li>
                <li>• Animation ที่ลื่นไหล</li>
                <li>• สีสันที่สวยงาม</li>
                <li>• ตอบสนองบนมือถือ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
