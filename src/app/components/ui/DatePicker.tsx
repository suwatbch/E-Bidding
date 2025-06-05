'use client';

import { useState, forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';

registerLocale('th', th);

// Custom styles for DatePicker
const datePickerStyles = `
  .react-datepicker {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: inherit;
    background: white;
    display: flex;
  }
  
  .react-datepicker__header {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 6px;
    position: relative;
  }
  
  .react-datepicker__current-month {
    color: white;
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 2px;
    text-align: center;
  }
  
  .react-datepicker__time__header{
    color: white !important;
    font-weight: bold;
    font-size: 0.75rem;
    margin-top: 0;
  }
  
  .react-datepicker__header__dropdown {
    margin: 2px 0 4px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }
  
  .react-datepicker__month-dropdown-container,
  .react-datepicker__year-dropdown-container {
    position: relative;
  }
  
  .react-datepicker__month-read-view,
  .react-datepicker__year-read-view {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    padding: 2px 6px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 50px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
  }
  
  .react-datepicker__month-read-view:hover,
  .react-datepicker__year-read-view:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__year-read-view--down-arrow {
    border-top: 2px solid white;
    border-left: 1.5px solid transparent;
    border-right: 1.5px solid transparent;
    margin-left: 4px;
    transition: transform 0.2s ease;
  }
  
  .react-datepicker__month-read-view:hover .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__year-read-view:hover .react-datepicker__year-read-view--down-arrow {
    transform: translateY(-1px);
  }
  
  .react-datepicker__day-names {
    margin-bottom: 2px;
  }
  
  .react-datepicker__day-name {
    color: white;
    font-weight: 500;
    font-size: 10px;
    width: 1.75rem;
    height: 1.4rem;
    line-height: 1.4rem;
  }
  
  .react-datepicker__month-container {
    flex: 1;
  }
  
  .react-datepicker__month {
    margin: 8px;
    background: white;
  }
  
  .react-datepicker__day {
    width: 1.75rem;
    height: 1.75rem;
    line-height: 1.75rem;
    margin: 1px;
    border-radius: 6px;
    color: #374151;
    font-weight: 500;
    transition: all 0.2s ease;
    font-size: 12px;
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
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
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
  
  .react-datepicker__day--outside-month {
    color: #9ca3af !important;
    opacity: 0.6;
  }
  
  .react-datepicker__day--outside-month:hover {
    background: #f3f4f6;
    color: #6b7280 !important;
    transform: none;
  }
  
  .react-datepicker__navigation {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
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
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .react-datepicker__navigation--previous {
    left: 8px;
  }
  
  .react-datepicker__navigation--next {
    right: 8px;
  }
  
  .react-datepicker__navigation-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    font-size: 12px;
    color: white;
    font-weight: bold;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: white;
    border-style: solid;
    border-width: 1.5px 1.5px 0 0;
    content: '';
    display: block;
    height: 6px;
    width: 6px;
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
    border-radius: 8px;
    width: 100px;
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
  
  .react-datepicker__time-name {
    display: none;
  }
  
  .react-datepicker__time-list {
    height: 280px !important;
    overflow-y: auto;
    padding: 4px;
    background: #f8fafc;
  }
  
  .react-datepicker__time-list-item {
    height: auto !important;
    padding: 6px 8px;
    color: #374151;
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 4px;
    margin: 1px 0;
    text-align: center;
    background: white;
    border: 1px solid #e5e7eb;
    font-size: 11px;
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
    box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
  }
  
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 100px;
    max-height: 160px;
    overflow-y: auto;
  }
  
  .react-datepicker__year-option,
  .react-datepicker__month-option {
    padding: 6px 10px;
    color: #374151;
    transition: all 0.2s ease;
    cursor: pointer;
    font-size: 12px;
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
  icon?: React.ReactNode;
}

interface ThaiDatePickerProps {
  selected: Date;
  onChange: (date: Date | null) => void;
  label: string;
  placeholder?: string;
  showTimeSelect?: boolean;
  timeCaption?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

// ฟังก์ชันสำหรับแสดงผลในหน้าจอ (ค.ศ. วัน/เดือน/ปี)
const formatDateTimeForDisplay = (date: Date) => {
  try {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear(); // ใช้ ค.ศ. แทน พ.ศ.
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return 'วันที่ไม่ถูกต้อง';
  }
};

// ฟังก์ชันสำหรับแสดงเฉพาะวันที่ (ค.ศ. วัน/เดือน/ปี)
const formatDateOnlyForDisplay = (date: Date) => {
  try {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear(); // ใช้ ค.ศ. แทน พ.ศ.

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

const CustomDateInput = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ value, onClick, label, placeholder, icon }, ref) => {
    const defaultIcon = (
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
    );

    return (
      <div className="space-y-2" ref={ref}>
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2 mb-1.5">
            {icon || defaultIcon}
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
  }
);

CustomDateInput.displayName = 'CustomDateInput';

const ThaiDatePicker: React.FC<ThaiDatePickerProps> = ({
  selected,
  onChange,
  label,
  placeholder,
  showTimeSelect = false,
  timeCaption = 'เวลา',
  minDate,
  maxDate,
  className = '',
  disabled = false,
  required = false,
  error,
}) => {
  const currentYear = new Date().getFullYear();
  const defaultMinDate = minDate || new Date(currentYear - 10, 0, 1);
  const defaultMaxDate = maxDate || new Date(currentYear + 10, 11, 31);

  const formatValue = showTimeSelect
    ? formatDateTimeForDisplay(selected)
    : formatDateOnlyForDisplay(selected);

  const timeIcon = (
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
  );

  return (
    <div className={className}>
      <style jsx global>
        {datePickerStyles}
      </style>

      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat={showTimeSelect ? 'HH:mm' : undefined}
        timeIntervals={showTimeSelect ? 15 : undefined}
        timeCaption={showTimeSelect ? timeCaption : undefined}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={20}
        showMonthDropdown
        dateFormat={showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
        locale="th"
        dropdownMode="select"
        calendarStartDay={0}
        minDate={defaultMinDate}
        maxDate={defaultMaxDate}
        disabled={disabled}
        customInput={
          <CustomDateInput
            value={formatValue}
            onClick={() => {}}
            label={label}
            placeholder={placeholder}
            icon={showTimeSelect ? timeIcon : undefined}
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
                  className="w-4 h-4 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-white/80">ปี</span>
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
                  className="w-4 h-4 text-white"
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
                  className="w-4 h-4 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-white/80">เดือน</span>
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
                  className="w-4 h-4 text-white"
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
              {monthDate.getFullYear()}
            </span>
          </div>
        )}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Export utility functions for getting formatted data
export const getThaiDisplayDate = (date: Date) =>
  formatDateOnlyForDisplay(date);
export const getThaiDisplayDateTime = (date: Date) =>
  formatDateTimeForDisplay(date);
export const getDataDate = (date: Date) => formatDateOnlyForData(date);
export const getDataDateTime = (date: Date) => formatDateTimeForData(date);

export default ThaiDatePicker;
