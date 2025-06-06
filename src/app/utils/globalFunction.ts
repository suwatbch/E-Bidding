/**
 * Utility Functions for E-Bidding Application
 * รวมฟังก์ชันต่างๆ ที่ใช้ในระบบประมูลออนไลน์
 */

import {
  dataAuction_Participant,
  AuctionParticipant,
} from '@/app/model/dataAuction_Participant';

// =============================================================================
// DATE & TIME UTILITIES
// =============================================================================

export interface DateChangeHandlerConfig {
  setFormData: (updater: (prev: any) => any) => void;
  updateTimestampField?: string;
}

/**
 * แปลง Date object เป็น string format สำหรับเก็บข้อมูล
 * @param date - Date object ที่ต้องการแปลง
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss"
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
 */
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * สร้าง current date/time string สำหรับ timestamp
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss"
 */
export const getCurrentDateTime = (): string => {
  return formatDateForData(new Date());
};

/**
 * แปลง date string เป็น Date object พร้อมจัดการ timezone
 * @param dateString - string วันที่
 * @returns Date object ที่ปรับ timezone แล้ว
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

/**
 * สร้าง handler function สำหรับการเปลี่ยนแปลงวันที่
 * @param setFormData - function สำหรับอัพเดท form data
 * @param updateTimestampField - field ที่ต้องการอัพเดท timestamp (default: 'updated_dt')
 * @returns function สำหรับจัดการการเปลี่ยนแปลงวันที่
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

// =============================================================================
// PARTICIPANT UTILITIES
// =============================================================================

/**
 * ดึงผู้เข้าร่วมประมูลที่ active ในตลาดประมูลที่ระบุ
 */
export const getActiveParticipants = (
  auctionId: number
): AuctionParticipant[] => {
  return dataAuction_Participant.filter(
    (p) => p.auction_id === auctionId && p.status === 1
  );
};

/**
 * ดึงผู้เข้าร่วมประมูลที่ online ในตลาดประมูลที่ระบุ
 */
export const getOnlineParticipants = (
  auctionId: number
): AuctionParticipant[] => {
  return dataAuction_Participant.filter(
    (p) => p.auction_id === auctionId && p.status === 1 && p.is_connected
  );
};

/**
 * นับจำนวนผู้เข้าร่วมประมูลที่ active
 */
export const getActiveParticipantCount = (auctionId: number): number => {
  return getActiveParticipants(auctionId).length;
};

/**
 * นับจำนวนผู้เข้าร่วมประมูลที่ online
 */
export const getOnlineParticipantCount = (auctionId: number): number => {
  return getOnlineParticipants(auctionId).length;
};

/**
 * ตรวจสอบว่าผู้ใช้เข้าร่วมประมูลหรือไม่
 */
export const isUserParticipant = (
  auctionId: number,
  userId: number
): boolean => {
  return dataAuction_Participant.some(
    (p) => p.auction_id === auctionId && p.user_id === userId && p.status === 1
  );
};

/**
 * ตรวจสอบว่าผู้ใช้ online หรือไม่
 */
export const isUserOnline = (auctionId: number, userId: number): boolean => {
  const participant = dataAuction_Participant.find(
    (p) => p.auction_id === auctionId && p.user_id === userId && p.status === 1
  );
  return participant?.is_connected || false;
};

/**
 * ดึงข้อมูลผู้เข้าร่วมประมูลของผู้ใช้
 */
export const getUserParticipation = (
  auctionId: number,
  userId: number
): AuctionParticipant | null => {
  return (
    dataAuction_Participant.find(
      (p) =>
        p.auction_id === auctionId && p.user_id === userId && p.status === 1
    ) || null
  );
};

/**
 * ดึงสถิติผู้เข้าร่วมประมูล
 */
export const getParticipantStats = (auctionId: number) => {
  const activeParticipants = getActiveParticipants(auctionId);
  const onlineCount = activeParticipants.filter((p) => p.is_connected).length;
  const offlineCount = activeParticipants.length - onlineCount;

  return {
    total: activeParticipants.length,
    online: onlineCount,
    offline: offlineCount,
    participants: activeParticipants,
  };
};

/**
 * แปลงสถานะเป็นข้อความ
 */
export const getParticipantStatusText = (status: number): string => {
  switch (status) {
    case 1:
      return 'เข้าร่วมแล้ว';
    case 0:
      return 'ไม่ได้เข้าร่วม';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

/**
 * แปลงสถานะการเชื่อมต่อเป็นข้อความ
 */
export const getConnectionStatusText = (isConnected: boolean): string => {
  return isConnected ? 'ออนไลน์' : 'ออฟไลน์';
};

// =============================================================================
// AUCTION UTILITIES
// =============================================================================

/**
 * จัดรูปแบบราคาเป็นสกุลเงินไทย
 * @param price - ราคาที่ต้องการจัดรูปแบบ
 * @returns string ราคาในรูปแบบสกุลเงินไทย
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * จัดรูปแบบ Auction ID
 * @param id - ID ของประมูล
 * @returns string ในรูปแบบ [ปี + ID]
 */
export const formatAuctionId = (id: number): string => {
  const currentYear = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `[${currentYear}${paddedId}]`;
};

/**
 * คำนวณเวลาที่เหลือของประมูล
 * @param endTime - เวลาสิ้นสุดของประมูล
 * @returns string เวลาที่เหลือ
 */
export const getTimeRemaining = (endTime: string): string => {
  const end = safeParseDate(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return 'หมดเวลาแล้ว';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} วัน ${hours} ชั่วโมง`;
  } else if (hours > 0) {
    return `${hours} ชั่วโมง ${minutes} นาที`;
  } else {
    return `${minutes} นาที`;
  }
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * ตรวจสอบ email format
 * @param email - email ที่ต้องการตรวจสอบ
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * ตรวจสอบเบอร์โทรศัพท์ไทย
 * @param phone - เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
 * @returns boolean
 */
export const isValidThaiPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

/**
 * ตรวจสอบรหัสบัตรประชาชนไทย
 * @param id - รหัสบัตรประชาชน
 * @returns boolean
 */
export const isValidThaiNationalId = (id: string): boolean => {
  if (!/^\d{13}$/.test(id)) return false;

  const digits = id.split('').map(Number);
  const checksum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (13 - index);
  }, 0);

  const remainder = checksum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === digits[12];
};

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * ตัดข้อความให้สั้นลง
 * @param text - ข้อความที่ต้องการตัด
 * @param maxLength - ความยาวสูงสุด
 * @returns string ข้อความที่ตัดแล้ว
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * แปลงข้อความเป็น slug (URL-friendly)
 * @param text - ข้อความที่ต้องการแปลง
 * @returns string slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // ลบตัวอักษรพิเศษ
    .replace(/\s+/g, '-') // แทนที่ space ด้วย dash
    .replace(/-+/g, '-') // ลบ dash ที่ซ้ำกัน
    .trim();
};

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

/**
 * จัดรูปแบบตัวเลขด้วยคอมม่า
 * @param num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @returns string ตัวเลขที่มีคอมม่า
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('th-TH');
};

/**
 * แปลงเปอร์เซ็นต์
 * @param value - ค่าที่ต้องการแปลง
 * @param total - ค่ารวม
 * @param decimals - จำนวนทศนิยม (default: 1)
 * @returns string เปอร์เซ็นต์
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals: number = 1
): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * บันทึกข้อมูลลง localStorage
 * @param key - key สำหรับเก็บข้อมูล
 * @param value - ข้อมูลที่ต้องการเก็บ
 */
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * ดึงข้อมูลจาก localStorage
 * @param key - key ของข้อมูลที่ต้องการ
 * @param defaultValue - ค่าเริ่มต้นหากไม่พบข้อมูล
 * @returns ข้อมูลที่ดึงมา
 */
export const getLocalStorage = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * ลบข้อมูลจาก localStorage
 * @param key - key ของข้อมูลที่ต้องการลบ
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

export default {
  // Date & Time
  formatDateForData,
  formatDateForDisplay,
  parseStringToDate,
  isValidDate,
  getCurrentDateTime,
  safeParseDate,
  createDateChangeHandler,

  // Participant
  getActiveParticipants,
  getOnlineParticipants,
  getActiveParticipantCount,
  getOnlineParticipantCount,
  isUserParticipant,
  isUserOnline,
  getUserParticipation,
  getParticipantStats,
  getParticipantStatusText,
  getConnectionStatusText,

  // Auction
  formatPrice,
  formatAuctionId,
  getTimeRemaining,

  // Validation
  isValidEmail,
  isValidThaiPhone,
  isValidThaiNationalId,

  // String
  truncateText,
  slugify,

  // Number
  formatNumber,
  formatPercentage,

  // Storage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
};
