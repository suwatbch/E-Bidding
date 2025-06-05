/**
 * Date Utilities for Thai Date Picker
 * Utility functions for handling date and time formatting
 */

// Type definitions
export interface DateChangeHandlerConfig {
  setFormData: (updater: (prev: any) => any) => void;
  updateTimestampField?: string;
}

/**
 * แปลง Date object เป็น string format สำหรับเก็บข้อมูล
 * @param date - Date object ที่ต้องการแปลง
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss"
 *
 * @example
 * const dateString = formatDateForData(new Date());
 * // Output: "2025-06-20 14:30:00"
 */
export const formatDateForData = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * แปลง Date object เป็น string format สำหรับแสดงผล
 * @param date - Date object ที่ต้องการแปลง
 * @param includeTime - ระบุว่าต้องการแสดงเวลาหรือไม่ (default: false)
 * @returns string ในรูปแบบ "DD/MM/YYYY" หรือ "DD/MM/YYYY HH:mm"
 *
 * @example
 * const displayDate = formatDateForDisplay(new Date(), false);
 * // Output: "20/06/2025"
 *
 * const displayDateTime = formatDateForDisplay(new Date(), true);
 * // Output: "20/06/2025 14:30"
 */
export const formatDateForDisplay = (
  date: Date,
  includeTime: boolean = false
): string => {
  if (!date || isNaN(date.getTime())) {
    return 'วันที่ไม่ถูกต้อง';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * แปลง string เป็น Date object
 * @param dateString - string ในรูปแบบ "YYYY-MM-DD HH:mm:ss" หรือ "YYYY-MM-DD"
 * @returns Date object
 *
 * @example
 * const date = parseStringToDate("2025-06-20 14:30:00");
 */
export const parseStringToDate = (dateString: string): Date => {
  if (!dateString || typeof dateString !== 'string') {
    return new Date();
  }

  return new Date(dateString);
};

/**
 * ตรวจสอบว่าวันที่ถูกต้องหรือไม่
 * @param date - Date object ที่ต้องการตรวจสอบ
 * @returns boolean
 *
 * @example
 * const isValid = isValidDate(new Date());
 * // Output: true
 */
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * สร้าง handler function สำหรับการเปลี่ยนแปลงวันที่
 * @param setFormData - function สำหรับอัพเดท form data
 * @param updateTimestampField - field ที่ต้องการอัพเดท timestamp (default: 'updated_dt')
 * @returns function สำหรับจัดการการเปลี่ยนแปลงวันที่
 *
 * @example
 * // ในหน้า React component
 * const [formData, setFormData] = useState(initialData);
 * const handleDateChange = createDateChangeHandler(setFormData);
 *
 * // ใช้กับ ThaiDatePicker
 * <ThaiDatePicker
 *   selected={safeParseDate(formData.start_date)}
 *   onChange={(date) => handleDateChange('start_date', date)}
 * />
 */
export const createDateChangeHandler = (
  setFormData: (updater: (prev: any) => any) => void,
  updateTimestampField: string = 'updated_dt'
) => {
  return (field: string, date: Date | null) => {
    if (date && isValidDate(date)) {
      const formattedDate = formatDateForData(date);
      setFormData((prev: any) => ({
        ...prev,
        [field]: formattedDate,
        [updateTimestampField]: formatDateForData(new Date()),
      }));
    }
  };
};

/**
 * สร้าง current date/time string สำหรับ timestamp
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss"
 *
 * @example
 * const now = getCurrentDateTime();
 * // Output: "2025-06-20 14:30:00"
 */
export const getCurrentDateTime = (): string => {
  return formatDateForData(new Date());
};

/**
 * แปลง date string เป็น Date object พร้อมจัดการ timezone
 * @param dateString - string วันที่
 * @returns Date object ที่ปรับ timezone แล้ว
 *
 * @example
 * // สำหรับใช้กับ ThaiDatePicker
 * const date = safeParseDate(formData.event_date);
 * <ThaiDatePicker selected={date} ... />
 */
export const safeParseDate = (dateString: string): Date => {
  try {
    if (!dateString) {
      return new Date();
    }

    // หากเป็นรูปแบบ "YYYY-MM-DD HH:mm:ss"
    if (dateString.includes(' ') && dateString.includes(':')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);

      return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    // หากเป็นรูปแบบอื่น ๆ ใช้ Date constructor ปกติ
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

// ตัวอย่างการใช้งานทั้งหมด
export const dateUtilsExample = {
  // ตัวอย่างการใช้ในหน้า form
  formExample: `
  import { 
    createDateChangeHandler, 
    safeParseDate, 
    getCurrentDateTime 
  } from '@/app/utils/dateUtils';

  const [formData, setFormData] = useState({
    event_name: '',
    start_date: getCurrentDateTime(),
    end_date: getCurrentDateTime(),
  });

  const handleDateChange = createDateChangeHandler(setFormData);

  return (
    <ThaiDatePicker
      selected={safeParseDate(formData.start_date)}
      onChange={(date) => handleDateChange('start_date', date)}
      showTimeSelect={true}
    />
  );
  `,

  // ตัวอย่างการแสดงผล
  displayExample: `
  import { formatDateForDisplay, safeParseDate } from '@/app/utils/dateUtils';

  const eventDate = "2025-06-20 14:30:00";
  const displayDate = formatDateForDisplay(safeParseDate(eventDate), true);
  // Output: "20/06/2025 14:30"
  `,
};
