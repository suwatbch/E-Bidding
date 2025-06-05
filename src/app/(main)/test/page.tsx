'use client';

import { useState } from 'react';
import Container from '@/app/components/ui/Container';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';

registerLocale('th', th);

// Custom styles for DatePicker
const datePickerStyles = `
  .react-datepicker {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-family: inherit;
    background: white;
    display: flex;
  }
  
  .react-datepicker__header {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    padding: 16px;
    position: relative;
  }
  
  .react-datepicker__current-month {
    color: white;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
    text-align: center;
  }
  
  .react-datepicker__time__header{
    color: white !important;
    font-weight: bold;
    font-size: 0.944rem;
    margin-top: 0;
  }
  
  .react-datepicker__header__dropdown {
    margin: 8px 0 12px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .react-datepicker__month-dropdown-container,
  .react-datepicker__year-dropdown-container {
    position: relative;
  }
  
  .react-datepicker__month-read-view,
  .react-datepicker__year-read-view {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 6px 12px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .react-datepicker__month-read-view:hover,
  .react-datepicker__year-read-view:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__year-read-view--down-arrow {
    border-top: 4px solid white;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    margin-left: 8px;
    transition: transform 0.2s ease;
  }
  
  .react-datepicker__month-read-view:hover .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__year-read-view:hover .react-datepicker__year-read-view--down-arrow {
    transform: translateY(-1px);
  }
  
  .react-datepicker__day-names {
    margin-bottom: 8px;
  }
  
  .react-datepicker__day-name {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 12px;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
  }
  
  .react-datepicker__month-container {
    flex: 1;
  }
  
  .react-datepicker__month {
    margin: 16px;
    background: white;
  }
  
  .react-datepicker__day {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 2px;
    border-radius: 8px;
    color: #374151;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .react-datepicker__day:hover {
    background: #dbeafe;
    color: #1d4ed8;
    transform: scale(1.05);
  }
  
  .react-datepicker__day--selected {
    background: #3b82f6 !important;
    color: white !important;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }
  
  .react-datepicker__day--today {
    background: #fef3c7;
    color: #d97706;
    font-weight: 600;
  }
  
  .react-datepicker__day--keyboard-selected {
    background: #eff6ff;
    color: #1d4ed8;
  }
  
  .react-datepicker__day--disabled {
    color: #d1d5db;
    cursor: not-allowed;
  }
  
  .react-datepicker__day--disabled:hover {
    background: transparent;
    transform: none;
  }
  
  .react-datepicker__navigation {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  
  .react-datepicker__navigation:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .react-datepicker__navigation--previous {
    left: 12px;
  }
  
  .react-datepicker__navigation--next {
    right: 12px;
  }
  
  .react-datepicker__navigation-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    font-size: 14px;
    color: white;
    font-weight: bold;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: white;
    border-style: solid;
    border-width: 2px 2px 0 0;
    content: '';
    display: block;
    height: 8px;
    width: 8px;
    transform: rotate(-45deg);
    transition: all 0.2s ease;
  }
  
  .react-datepicker__navigation--previous .react-datepicker__navigation-icon::before {
    transform: rotate(-135deg);
  }
  
  .react-datepicker__navigation--next .react-datepicker__navigation-icon::before {
    transform: rotate(45deg);
  }
  
  .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
    border-color: white;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
  
  .react-datepicker__time-container {
    border-left: 1px solid #e5e7eb;
    border-radius: 12px;
    width: 120px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }
  
  .react-datepicker__time {
    background: transparent;
    border-radius: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .react-datepicker__time-box {
    width: 100%;
    flex: 1;
  }
  
  /* Custom time button in header */
  .react-datepicker__header__dropdown::after {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 6px 12px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: 8px;
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  
  .react-datepicker__header__dropdown:hover::after {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  .react-datepicker__time-name {
    display: none;
  }
  
  .react-datepicker__time-list {
    height: 320px !important;
    overflow-y: auto;
    padding: 8px;
    background: #f8fafc;
  }
  
  .react-datepicker__time-list-item {
    height: auto !important;
    padding: 8px 12px;
    color: #374151;
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 6px;
    margin: 2px 0;
    text-align: center;
    background: white;
    border: 1px solid #e5e7eb;
  }
  
  .react-datepicker__time-list-item:hover {
    background: #dbeafe;
    color: #1d4ed8;
    border-color: #3b82f6;
  }
  
  .react-datepicker__time-list-item--selected {
    background: #3b82f6 !important;
    color: white !important;
    font-weight: 600;
    border-color: #1d4ed8;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }
  
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 120px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .react-datepicker__year-option,
  .react-datepicker__month-option {
    padding: 8px 12px;
    color: #374151;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .react-datepicker__year-option:hover,
  .react-datepicker__month-option:hover {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .react-datepicker__year-option--selected,
  .react-datepicker__month-option--selected {
    background: #3b82f6;
    color: white;
    font-weight: 600;
  }
  
  .react-datepicker__triangle {
    display: none;
  }
`;

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  label: string;
  placeholder?: string;
}

export default function TestPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  // กำหนดขอบเขตปี: ปีปัจจุบัน ± 10 ปี
  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear - 10, 0, 1); // 1 มกราคม ของ 10 ปีที่แล้ว
  const maxDate = new Date(currentYear + 10, 11, 31); // 31 ธันวาคม ของ 10 ปีข้างหน้า

  const formatDateTime = (date: Date) => {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // ฟังก์ชันสำหรับแสดงผลในหน้าจอ (พ.ศ. วัน/เดือน/ปี)
  const formatDateTimeForDisplay = (date: Date) => {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear() + 543; // แปลงเป็นพุทธศักราช
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // ฟังก์ชันสำหรับแสดงเฉพาะวันที่ (พ.ศ. วัน/เดือน/ปี)
  const formatDateOnlyForDisplay = (date: Date) => {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear() + 543; // แปลงเป็นพุทธศักราช

      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // ฟังก์ชันสำหรับใช้งานจริง (ค.ศ. ปี/เดือน/วัน)
  const formatDateTimeForData = (date: Date) => {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear(); // ใช้ ค.ศ.
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // ฟังก์ชันสำหรับใช้งานจริง เฉพาะวันที่ (ค.ศ. ปี/เดือน/วัน)
  const formatDateOnlyForData = (date: Date) => {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear(); // ใช้ ค.ศ.

      return `${year}/${month}/${day}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  const CustomDateInput: React.FC<
    CustomInputProps & { icon?: React.ReactNode }
  > = ({ value, onClick, label, placeholder, icon }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2 mb-1.5">
          {icon}
          {label}
        </div>
      </label>
      <div
        className="relative w-full h-[42px] rounded-lg border border-gray-300 pl-3 pr-3 text-sm cursor-pointer bg-white flex items-center justify-between hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20"
        onClick={onClick}
        style={{ minHeight: '42px', maxHeight: '42px' }}
      >
        <span className="flex-1 text-left text-gray-900">
          {value || placeholder}
        </span>
        <div className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <Container className="py-6">
      <style jsx global>
        {datePickerStyles}
      </style>
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
                ทดสอบปฏิทิน
              </h1>
              <p className="text-gray-600 mt-1">
                หน้าทดสอบปฏิทินที่มีการออกแบบและฟีเจอร์ครบถ้วน
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

            <div className="w-full">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                locale="th"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={20}
                showMonthDropdown
                dateFormat="dd/MM/yyyy"
                dropdownMode="select"
                minDate={minDate}
                maxDate={maxDate}
                customInput={
                  <CustomDateInput
                    value={formatDateOnlyForDisplay(selectedDate)}
                    onClick={() => {}}
                    label="เลือกวันที่"
                    placeholder="กรุณาเลือกวันที่"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                        />
                      </svg>
                    }
                  />
                }
                wrapperClassName="w-full"
                showPopperArrow={false}
                fixedHeight
                renderCustomHeader={({
                  monthDate,
                  decreaseMonth,
                  increaseMonth,
                  decreaseYear,
                  increaseYear,
                }) => (
                  <div className="flex flex-col items-center">
                    <div className="flex justify-between items-center w-full mb-2">
                      <div
                        onClick={decreaseYear}
                        className="react-datepicker__navigation--previous cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white/80">
                        ปี
                      </span>
                      <div
                        onClick={increaseYear}
                        className="react-datepicker__navigation--next cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <div
                        onClick={decreaseMonth}
                        className="react-datepicker__navigation--previous cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white/80">
                        เดือน
                      </span>
                      <div
                        onClick={increaseMonth}
                        className="react-datepicker__navigation--next cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="text-lg font-medium text-white mt-2">
                      {monthDate.toLocaleString('th-TH', {
                        month: 'long',
                      })}{' '}
                      {monthDate.getFullYear() + 543}
                    </span>
                  </div>
                )}
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>วันที่ที่เลือก (แสดงผล):</strong>{' '}
                {formatDateOnlyForDisplay(selectedDate)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>วันที่สำหรับใช้งาน (ค.ศ.):</strong>{' '}
                {formatDateOnlyForData(selectedDate)}
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

            <div className="w-full">
              <DatePicker
                selected={selectedDateTime}
                onChange={(date) => date && setSelectedDateTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="เวลา"
                dateFormat="dd/MM/yyyy HH:mm"
                locale="th"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={20}
                showMonthDropdown
                dropdownMode="select"
                minDate={minDate}
                maxDate={maxDate}
                customInput={
                  <CustomDateInput
                    value={formatDateTimeForDisplay(selectedDateTime)}
                    onClick={() => {}}
                    label="เลือกวันและเวลา"
                    placeholder="กรุณาเลือกวันและเวลา"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    }
                  />
                }
                wrapperClassName="w-full"
                showPopperArrow={false}
                fixedHeight
                renderCustomHeader={({
                  monthDate,
                  decreaseMonth,
                  increaseMonth,
                  decreaseYear,
                  increaseYear,
                }) => (
                  <div className="flex flex-col items-center">
                    <div className="flex justify-between items-center w-full mb-2">
                      <div
                        onClick={decreaseYear}
                        className="react-datepicker__navigation--previous cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white/80">
                        ปี
                      </span>
                      <div
                        onClick={increaseYear}
                        className="react-datepicker__navigation--next cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <div
                        onClick={decreaseMonth}
                        className="react-datepicker__navigation--previous cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white/80">
                        เดือน
                      </span>
                      <div
                        onClick={increaseMonth}
                        className="react-datepicker__navigation--next cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="text-lg font-medium text-white mt-2">
                      {monthDate.toLocaleString('th-TH', {
                        month: 'long',
                      })}{' '}
                      {monthDate.getFullYear() + 543}
                    </span>
                  </div>
                )}
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>วันเวลาที่เลือก (แสดงผล):</strong>{' '}
                {formatDateTimeForDisplay(selectedDateTime)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>วันเวลาสำหรับใช้งาน (ค.ศ.):</strong>{' '}
                {formatDateTimeForData(selectedDateTime)}
              </p>
            </div>
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
            ฟีเจอร์ของปฏิทิน
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
                <h3 className="font-medium text-gray-900">การปรับแต่ง</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• หัวปฏิทินไล่ระดับสีน้ำเงิน</li>
                <li>• ปุ่ม dropdown เดือน/ปี</li>
                <li>• ปุ่มเวลาในหัวปฏิทิน</li>
                <li>• เอฟเฟกต์ hover สวยงาม</li>
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
                <h3 className="font-medium text-gray-900">ฟีเจอร์</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ปุ่มลูกศรเลื่อนเดือน</li>
                <li>• เลือกเวลาได้ทุก 15 นาที</li>
                <li>• ไฮไลท์วันปัจจุบัน</li>
                <li>• ภาษาไทยสมบูรณ์</li>
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
                <h3 className="font-medium text-gray-900">ประสบการณ์</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Animation ที่ลื่นไหล</li>
                <li>• สีสันสวยงาม</li>
                <li>• เงาและมุมโค้งสวย</li>
                <li>• ตอบสนองบนมือถือ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
