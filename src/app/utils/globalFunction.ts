import {
  auctionsService,
  type AuctionParticipant,
  type AuctionBid,
  getBidStatusColor,
} from '@/app/services/auctionsService';

import {
  type UserCompany,
  userCompanyService,
} from '@/app/services/userCompanyService';
import { userService } from '@/app/services/userService';
import { companyService } from '@/app/services/companyService';

// =============================================================================
// USER COMPANY UTILITIES (NEW VERSIONS WITH userCompanyService)
// =============================================================================

/**
 * หาบริษัทหลักของผู้ใช้จาก UserCompany array
 * @param userId - ID ของผู้ใช้
 * @param userCompanies - Array ของ UserCompany จาก userCompanyService
 * @returns number | null - ID ของบริษัทหลักหรือ null
 */
export const getCompanyByUserIdFromArray = (
  userId: number,
  userCompanies: UserCompany[]
): number | null => {
  const primaryCompany = userCompanies.find(
    (uc) => uc.user_id === userId && uc.is_primary === true
  );

  if (primaryCompany) {
    return primaryCompany.company_id;
  }

  // Fallback: หาบริษัทแรกที่เจอ
  const firstCompany = userCompanies.find((uc) => uc.user_id === userId);
  return firstCompany ? firstCompany.company_id : null;
};

/**
 * หารหัสของบริษัทหลักของผู้ใช้
 * @param userId - ID ของผู้ใช้
 * @param userCompanies - Array ของ UserCompany จาก userCompanyService
 * @returns string | null - role ของผู้ใช้หรือ null
 */
export const getUserRoleFromArray = (
  userId: number,
  userCompanies: UserCompany[]
): string | null => {
  const primaryCompany = userCompanies.find(
    (uc) => uc.user_id === userId && uc.is_primary === true
  );

  if (primaryCompany) {
    return primaryCompany.role_in_company;
  }

  // Fallback: หาบริษัทแรกที่เจอ
  const firstCompany = userCompanies.find((uc) => uc.user_id === userId);
  return firstCompany ? firstCompany.role_in_company : null;
};

/**
 * ตรวจสอบว่าผู้ใช้สามารถประมูลได้หรือไม่
 * @param userId - ID ของผู้ใช้
 * @param userCompanies - Array ของ UserCompany จาก userCompanyService
 * @returns boolean - สามารถประมูลได้หรือไม่
 */
export const canUserBidFromArray = (
  userId: number,
  userCompanies: UserCompany[]
): boolean => {
  const userCompany = userCompanies.find(
    (uc) => uc.user_id === userId && uc.status === 1
  );
  return !!userCompany;
};

// =============================================================================
// PRICE & COLOR UTILITIES
// =============================================================================

/**
 * กำหนดสีตามราคาเปรียบเทียบกับราคาประกัน
 * @param bidAmount - ราคาที่เสนอ
 * @param reservePrice - ราคาประกัน
 * @returns string - CSS class สำหรับสี
 */
export const getPriceColor = (
  bidAmount: number,
  reservePrice: number
): string => {
  // Debug logging
  console.log('🔍 getPriceColor Debug:', {
    bidAmount,
    reservePrice,
    bidAmountType: typeof bidAmount,
    reservePriceType: typeof reservePrice,
    comparison: bidAmount < reservePrice,
    bidAmountNumber: Number(bidAmount),
    reservePriceNumber: Number(reservePrice),
    comparisonAfterConversion: Number(bidAmount) < Number(reservePrice),
  });

  // Convert to numbers to ensure proper comparison
  const bidAmountNum = Number(bidAmount);
  const reservePriceNum = Number(reservePrice);

  if (bidAmountNum < reservePriceNum) {
    return 'text-green-600'; // ราคาต่ำกว่าราคาประกัน (ประหยัด)
  } else if (bidAmountNum === reservePriceNum) {
    return 'text-gray-600'; // ราคาเท่าราคาประกัน
  } else {
    return 'text-red-600'; // ราคาสูงกว่าราคาประกัน (แพง)
  }
};

// =============================================================================
// DATE & TIME UTILITIES
// =============================================================================

export interface DateChangeHandlerConfig {
  setFormData: (updater: (prev: any) => any) => void;
  updateTimestampField?: string;
}

/**
 * แปลง Date object เป็น string format สำหรับเก็บข้อมูล (Local timezone)
 * @param date - Date object ที่ต้องการแปลง
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss" ในเวลาท้องถิ่น
 */
export const formatDateForData = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDateTime = (dateTimeStr: string) => {
  return formatDateForDisplay(safeParseDate(dateTimeStr), true);
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
 * สร้าง current date/time string สำหรับ timestamp (Local timezone)
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss" ในเวลาท้องถิ่น
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
 * ดึง timezone offset ของผู้ใช้อัตโนมัติ
 * @returns number timezone offset เป็นชั่วโมง
 */
export const getUserTimezoneOffset = (): number => {
  return -new Date().getTimezoneOffset() / 60;
};

/**
 * แปลงวันที่เวลาให้เป็นรูปแบบ MySQL datetime string (YYYY-MM-DD HH:mm:ss) ในเวลาท้องถิ่น
 * รองรับหลายรูปแบบ input: UTC string, local string, Date object
 * @param dateTime - วันที่เวลาในรูปแบบต่างๆ (string, Date object)
 * @returns string ในรูปแบบ "YYYY-MM-DD HH:mm:ss" ในเวลาท้องถิ่น
 */
export const convertToLocalDateTimeString = (
  dateTime: string | Date
): string => {
  try {
    if (!dateTime) {
      return '';
    }

    let date: Date;

    if (dateTime instanceof Date) {
      // ถ้าเป็น Date object ใช้ตรงๆ
      date = dateTime;
    } else if (typeof dateTime === 'string') {
      // ถ้าเป็น string ต้องตรวจสอบรูปแบบ
      if (dateTime.includes('T') && dateTime.endsWith('Z')) {
        // รูปแบบ ISO UTC: "2025-06-27T05:00:00.000Z"
        date = new Date(dateTime);
      } else if (dateTime.includes('T') && !dateTime.endsWith('Z')) {
        // รูปแบบ ISO local: "2025-06-27T05:00:00"
        date = new Date(dateTime);
      } else if (dateTime.includes(' ')) {
        // รูปแบบ MySQL: "2025-06-27 05:00:00"
        // ใช้ safeParseDate เพื่อให้ถือว่าเป็น local time
        date = safeParseDate(dateTime);
      } else {
        // รูปแบบอื่นๆ
        date = new Date(dateTime);
      }
    } else {
      console.warn(
        'Invalid dateTime format provided to convertToLocalDateTimeString'
      );
      return '';
    }

    if (!isValidDate(date)) {
      console.warn('Invalid date provided to convertToLocalDateTimeString');
      return '';
    }

    // แปลงเป็นเวลาท้องถิ่นในรูปแบบ MySQL
    return formatDateForData(date);
  } catch (error) {
    console.error('Error converting to local datetime string:', error);
    return '';
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

/**
 * ฟอร์แมตเวลาคงเหลือ
 */
export const formatTimeRemaining = (
  timeRemaining: ReturnType<typeof calculateTimeRemaining>
): string => {
  if (timeRemaining.isExpired) {
    return 'หมดเวลา';
  }

  if (timeRemaining.days > 0) {
    return `${timeRemaining.days} วัน ${timeRemaining.hours} ชม.`;
  } else if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours} ชั่วโมง ${timeRemaining.minutes} นาที`;
  } else if (timeRemaining.minutes > 0) {
    return `${timeRemaining.minutes} นาที`;
  } else {
    return `${timeRemaining.seconds} วินาที`;
  }
};

// =============================================================================
// USER & COMPANY UTILITIES
// =============================================================================

/**
 * หาชื่อผู้ใช้จาก ID
 * @param userId - ID ของผู้ใช้
 * @param users - Array ของผู้ใช้ทั้งหมด
 * @returns string ชื่อผู้ใช้หรือ 'ไม่พบข้อมูล'
 */
export const getUserNameById = (userId: number, users: any[]): string => {
  const user = users.find((u) => u.user_id === userId);
  return user ? `${user.first_name} ${user.last_name}` : 'ไม่พบข้อมูล';
};

/**
 * หาชื่อบริษัทจาก ID
 * @param companyId - ID ของบริษัท
 * @param companies - Array ของบริษัททั้งหมด
 * @returns string ชื่อบริษัทหรือ 'ไม่พบข้อมูล'
 */
export const getCompanyNameById = (
  companyId: number,
  companies: any[]
): string => {
  const company = companies.find((c) => c.company_id === companyId);
  return company ? company.company_name : 'ไม่พบข้อมูล';
};

/**
 * หาชื่อบริษัทของผู้ใช้ (ใช้ primary company หรือบริษัทแรก)
 * @param userId - ID ของผู้ใช้
 * @param usersCompany - Array ของ user-company relationships จาก userCompanyService
 * @param companies - Array ของบริษัททั้งหมด
 * @returns string ชื่อบริษัทของผู้ใช้หรือ 'ไม่ระบุ'
 */
export const getUserCompanyNameById = (
  userId: number,
  usersCompany: UserCompany[],
  companies: any[]
): string => {
  // หา primary company ก่อน
  const primaryRelation = usersCompany.find(
    (uc) => uc.user_id === userId && uc.is_primary === true
  );

  if (primaryRelation) {
    return getCompanyNameById(primaryRelation.company_id, companies);
  }

  // ถ้าไม่มี primary ใช้บริษัทแรกที่เจอ
  const firstRelation = usersCompany.find((uc) => uc.user_id === userId);
  if (firstRelation) {
    return getCompanyNameById(firstRelation.company_id, companies);
  }

  return 'ไม่ระบุ';
};

/**
 * กรองบริษัทตามคำค้นหา
 * @param companies - Array ของบริษัททั้งหมด
 * @param searchTerm - คำค้นหา
 * @returns Array ของบริษัทที่กรองแล้ว
 */
export const filterCompaniesBySearch = (
  companies: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm.trim()) return companies;

  const searchLower = searchTerm.toLowerCase();
  return companies.filter((company) =>
    company.company_name.toLowerCase().includes(searchLower)
  );
};

/**
 * กรองผู้ใช้ตามคำค้นหา
 * @param users - Array ของผู้ใช้ทั้งหมด
 * @param searchTerm - คำค้นหา
 * @returns Array ของผู้ใช้ที่กรองแล้ว
 */
export const filterUsersBySearch = (
  users: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm.trim()) return users;

  const searchLower = searchTerm.toLowerCase();
  return users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });
};

/**
 * หาบริษัทหลักของผู้ใช้ (is_primary = true)
 * @param userId - ID ของผู้ใช้
 * @param usersCompany - Array ของ user-company relationships จาก userCompanyService
 * @returns number | null ID ของบริษัทหลักหรือ null
 */
export const getPrimaryCompanyIdByUserId = (
  userId: number,
  usersCompany: UserCompany[]
): number | null => {
  const primaryRelation = usersCompany.find(
    (uc) => uc.user_id === userId && uc.is_primary === true
  );
  return primaryRelation ? primaryRelation.company_id : null;
};

/**
 * หาบริษัททั้งหมดของผู้ใช้
 * @param userId - ID ของผู้ใช้
 * @param usersCompany - Array ของ user-company relationships จาก userCompanyService
 * @returns Array ของ company IDs
 */
export const getAllCompanyIdsByUserId = (
  userId: number,
  usersCompany: UserCompany[]
): number[] => {
  return usersCompany
    .filter((uc) => uc.user_id === userId)
    .map((uc) => uc.company_id);
};

/**
 * หาผู้ใช้ในบริษัทที่ระบุ
 * @param companyId - ID ของบริษัท
 * @param usersCompany - Array ของ user-company relationships จาก userCompanyService
 * @returns Array ของ user IDs
 */
export const getUserIdsByCompanyId = (
  companyId: number,
  usersCompany: UserCompany[]
): number[] => {
  return usersCompany
    .filter((uc) => uc.company_id === companyId)
    .map((uc) => uc.user_id);
};

// =============================================================================
// PARTICIPANT UTILITIES (NEW VERSIONS WITH auctionsService)
// =============================================================================
/*
 * การเปลี่ยนแปลงสำคัญ:
 * - เปลี่ยนจากการใช้ static data model (@/app/model/dataAuction_Participant)
 *   เป็น auctionsService ที่เป็น API service
 *
 * ฟังก์ชันใหม่ที่แนะนำให้ใช้:
 * - getActiveParticipantsFromArray() แทน getActiveParticipants()
 * - getOnlineParticipantsFromArray() แทน getOnlineParticipants()
 * - getActiveParticipantCountFromArray() แทน getActiveParticipantCount()
 * - getOnlineParticipantCountFromArray() แทน getOnlineParticipantCount()
 * - isUserParticipantFromArray() แทน isUserParticipant()
 * - isUserOnlineFromArray() แทน isUserOnline()
 * - getUserParticipationFromArray() แทน getUserParticipation()
 * - getParticipantStatsFromArray() แทน getParticipantStats()
 *
 * วิธีใช้งาน:
 * 1. เรียก auctionsService.getAuctionParticipants(auctionId)
 * 2. ส่ง data.data (AuctionParticipant[]) ไปยังฟังก์ชันต่างๆ
 *
 * ตัวอย่าง:
 * const response = await auctionsService.getAuctionParticipants(auctionId);
 * if (response.success) {
 *   const activeCount = getActiveParticipantCountFromArray(auctionId, response.data);
 *   const isOnline = isUserOnlineFromArray(auctionId, userId, response.data);
 * }
 */

/**
 * ดึงผู้เข้าร่วมประมูลที่ active ในตลาดประมูลที่ระบุ
 * @param auctionId - ID ของตลาดประมูล
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns Array ของผู้เข้าร่วมที่ active
 */
export const getActiveParticipantsFromArray = (
  auctionId: number,
  participants: AuctionParticipant[]
): AuctionParticipant[] => {
  return participants.filter(
    (p) => p.auction_id === auctionId && p.status === 1
  );
};

/**
 * ดึงผู้เข้าร่วมประมูลที่ online ในตลาดประมูลที่ระบุ
 * @param auctionId - ID ของตลาดประมูล
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns Array ของผู้เข้าร่วมที่ online
 */
export const getOnlineParticipantsFromArray = (
  auctionId: number,
  participants: AuctionParticipant[]
): AuctionParticipant[] => {
  // หมายเหตุ: ฟังก์ชันนี้จะถูกยกเลิกการใช้งาน
  // ใช้ Socket real-time data
  console.warn(
    'getOnlineParticipantsFromArray is deprecated - use Socket real-time data instead'
  );
  return participants.filter(
    (p) => p.auction_id === auctionId && p.status === 1
  );
};

/**
 * นับจำนวนผู้เข้าร่วมประมูลที่ active
 * @param auctionId - ID ของตลาดประมูล
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns จำนวนผู้เข้าร่วมที่ active
 */
export const getActiveParticipantCountFromArray = (
  auctionId: number,
  participants: AuctionParticipant[]
): number => {
  return getActiveParticipantsFromArray(auctionId, participants).length;
};

/**
 * นับจำนวนผู้เข้าร่วมประมูลที่ online
 * @param auctionId - ID ของตลาดประมูล
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns จำนวนผู้เข้าร่วมที่ online
 */
export const getOnlineParticipantCountFromArray = (
  auctionId: number,
  participants: AuctionParticipant[]
): number => {
  return getOnlineParticipantsFromArray(auctionId, participants).length;
};

/**
 * ตรวจสอบว่าผู้ใช้เข้าร่วมประมูลหรือไม่
 * @param auctionId - ID ของตลาดประมูล
 * @param userId - ID ของผู้ใช้
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns boolean - เข้าร่วมหรือไม่
 */
export const isUserParticipantFromArray = (
  auctionId: number,
  userId: number,
  participants: AuctionParticipant[]
): boolean => {
  return participants.some(
    (p) => p.auction_id === auctionId && p.user_id === userId && p.status === 1
  );
};

/**
 * ตรวจสอบว่าผู้ใช้ online หรือไม่
 * @param auctionId - ID ของตลาดประมูล
 * @param userId - ID ของผู้ใช้
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns boolean - online หรือไม่
 */
export const isUserOnlineFromArray = (
  auctionId: number,
  userId: number,
  participants: AuctionParticipant[]
): boolean => {
  // หมายเหตุ: ฟังก์ชันนี้จะถูกยกเลิกการใช้งาน
  // ใช้ Socket real-time data
  console.warn(
    'isUserOnlineFromArray is deprecated - use Socket real-time data instead'
  );
  const participant = participants.find(
    (p) => p.auction_id === auctionId && p.user_id === userId && p.status === 1
  );
  return false; // ส่งคืน false
};

/**
 * ดึงข้อมูลผู้เข้าร่วมประมูลของผู้ใช้
 * @param auctionId - ID ของตลาดประมูล
 * @param userId - ID ของผู้ใช้
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns ข้อมูลผู้เข้าร่วมหรือ null
 */
export const getUserParticipationFromArray = (
  auctionId: number,
  userId: number,
  participants: AuctionParticipant[]
): AuctionParticipant | null => {
  return (
    participants.find(
      (p) =>
        p.auction_id === auctionId && p.user_id === userId && p.status === 1
    ) || null
  );
};

// Legacy functions for backward compatibility (deprecated)
export const getActiveParticipants = (
  auctionId: number
): AuctionParticipant[] => {
  console.warn(
    'getActiveParticipants is deprecated - use getActiveParticipantsFromArray with participants array'
  );
  return [];
};

export const getOnlineParticipants = (
  auctionId: number
): AuctionParticipant[] => {
  console.warn(
    'getOnlineParticipants is deprecated - use getOnlineParticipantsFromArray with participants array'
  );
  return [];
};

export const getActiveParticipantCount = (auctionId: number): number => {
  console.warn(
    'getActiveParticipantCount is deprecated - use getActiveParticipantCountFromArray with participants array'
  );
  return 0;
};

export const getOnlineParticipantCount = (auctionId: number): number => {
  console.warn(
    'getOnlineParticipantCount is deprecated - use getOnlineParticipantCountFromArray with participants array'
  );
  return 0;
};

export const isUserParticipant = (
  auctionId: number,
  userId: number
): boolean => {
  console.warn(
    'isUserParticipant is deprecated - use isUserParticipantFromArray with participants array'
  );
  return false;
};

export const isUserOnline = (auctionId: number, userId: number): boolean => {
  console.warn(
    'isUserOnline is deprecated - use isUserOnlineFromArray with participants array'
  );
  return false;
};

export const getUserParticipation = (
  auctionId: number,
  userId: number
): AuctionParticipant | null => {
  console.warn(
    'getUserParticipation is deprecated - use getUserParticipationFromArray with participants array'
  );
  return null;
};

/**
 * ดึงสถิติผู้เข้าร่วมประมูล
 * @param auctionId - ID ของตลาดประมูล
 * @param participants - Array ของ AuctionParticipant จาก auctionsService
 * @returns สถิติผู้เข้าร่วม
 */
export const getParticipantStatsFromArray = (
  auctionId: number,
  participants: AuctionParticipant[]
) => {
  const activeParticipants = getActiveParticipantsFromArray(
    auctionId,
    participants
  );
  // หมายเหตุ: ใช้ Socket real-time data
  const onlineCount = 0; // ส่งคืน 0 เสมอเพราะใช้ Socket real-time
  const offlineCount = activeParticipants.length - onlineCount;

  return {
    total: activeParticipants.length,
    online: onlineCount,
    offline: offlineCount,
    participants: activeParticipants,
  };
};

// Legacy function for backward compatibility (deprecated)
export const getParticipantStats = (auctionId: number) => {
  console.warn(
    'getParticipantStats is deprecated - use getParticipantStatsFromArray with participants array'
  );
  return {
    total: 0,
    online: 0,
    offline: 0,
    participants: [],
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
 * ฟังก์ชันสำหรับแสดงผลราคาขณะ focus (ไม่มีคอมม่า)
 * @param value - ราคาในรูปแบบ number
 * @returns string ราคาในรูปแบบ input (ไม่มีคอมม่า)
 */
export const formatPriceForInput = (value: number): string => {
  if (value === 0) return '0.00';
  return value.toString();
};

/**
 * ฟังก์ชันสำหรับแสดงผลราคาขณะ blur (มีคอมม่า)
 * @param value - ราคาในรูปแบบ number
 * @returns string ราคาในรูปแบบ display (มีคอมม่า)
 */
export const formatPriceForDisplay = (value: number): string => {
  if (value === 0) return '0.00';
  // ตัดทศนิยมส่วนเกินทิ้งไป (ไม่ปัดเศษ) แล้วคงไว้แค่ 2 ตำแหน่ง
  const truncatedValue = Math.floor(value * 100) / 100;
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncatedValue);
};

/**
 * ฟังก์ชันจัดการ focus ราคา (ใช้ร่วมกันได้)
 * @param currentValue - ค่าปัจจุบัน (string หรือ number)
 * @param updateFunction - ฟังก์ชันสำหรับอัปเดตค่า
 */
export const handlePriceFocus = (
  currentValue: string | number,
  updateFunction: (formattedValue: string) => void
): void => {
  const numericValue =
    typeof currentValue === 'string'
      ? parseFloat(currentValue.replace(/,/g, '')) || 0
      : currentValue || 0;
  const formattedValue = formatPriceForInput(numericValue);
  updateFunction(formattedValue);
};

/**
 * ฟังก์ชันจัดการ blur ราคา (ใช้ร่วมกันได้)
 * @param currentValue - ค่าปัจจุบันในรูปแบบ string
 * @param updateFunction - ฟังก์ชันสำหรับอัปเดตค่า
 */
export const handlePriceBlur = (
  currentValue: string,
  updateFunction: (formattedValue: string) => void
): void => {
  const numericValue = parseFloat(currentValue.replace(/,/g, '')) || 0;
  const formattedValue = formatPriceForDisplay(numericValue);
  updateFunction(formattedValue);
};

/**
 * ฟังก์ชันจัดการการเปลี่ยนแปลงราคา (รองรับจำกัดทศนิยม 2 ตัว)
 * @param value - ค่าที่ผู้ใช้พิมพ์
 * @returns string ค่าที่ผ่านการจัดรูปแบบ
 */
export const handlePriceChange = (value: string): string => {
  // อนุญาตให้มีตัวเลขและจุดทศนิยมได้
  const cleanValue = value.replace(/[^\d.]/g, '');

  // ป้องกันการมีจุดทศนิยมมากกว่า 1 ตัว และจำกัดทศนิยมไม่เกิน 2 ตัว
  const parts = cleanValue.split('.');
  let finalValue = cleanValue;

  if (parts.length > 2) {
    // เอาเฉพาะส่วนที่ 1 (หลังจุดแรก) และจำกัดไม่เกิน 2 ตัว
    finalValue = parts[0] + '.' + parts[1].substring(0, 2);
  } else if (parts.length === 2 && parts[1].length > 2) {
    // จำกัดทศนิยมไม่เกิน 2 ตัว
    finalValue = parts[0] + '.' + parts[1].substring(0, 2);
  }

  return finalValue;
};

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
 * @param auction_id - ข้อมูลประมูล (ต้องมี auction_id)
 * @returns string ในรูปแบบ AUC + auction_id (เช่น AUC0001)
 */
export const formatAuctionId = (auction_id: number): string => {
  // เติม 0 ข้างหน้าให้ครบอย่างน้อย 4 หลัก หากเกินก็ยาวตามจำนวนหลักจริง
  const paddedId = auction_id.toString().padStart(4, '0');

  return `AUC${paddedId}`;
};

/**
 * ถอดรหัสชื่อตลาดประมูล (AUC0001) เป็น auction ID
 * @param auctionName - ชื่อตลาดในรูปแบบ AUC + หมายเลข (เช่น AUC0001)
 * @returns number | null - auction ID หรือ null หากรูปแบบไม่ถูกต้อง
 */
export const decodeAuctionId = (auctionName: string): number | null => {
  try {
    // ตรวจสอบว่าขึ้นต้นด้วย AUC หรือไม่
    if (!auctionName || !auctionName.startsWith('AUC')) {
      return null;
    }

    // ดึงส่วนตัวเลขออกมา
    const numberPart = auctionName.substring(3); // ตัดคำว่า 'AUC' ออก

    // ตรวจสอบว่าเป็นตัวเลขหรือไม่
    if (!/^\d+$/.test(numberPart)) {
      return null;
    }

    const auctionId = parseInt(numberPart, 10);

    // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่
    if (isNaN(auctionId) || auctionId < 0) {
      return null;
    }

    return auctionId;
  } catch (error) {
    console.error('Error decoding auction name:', error);
    return null;
  }
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
// BID UTILITIES
// =============================================================================

/**
 * ดึงการเสนอราคาทั้งหมดในประมูล (เฉพาะที่ยอมรับแล้ว)
 */
export const getAuctionBids = async (
  auctionId: number
): Promise<AuctionBid[]> => {
  try {
    const response = await auctionsService.getAcceptedBids(auctionId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching auction bids:', error);
    return [];
  }
};

/**
 * ดึงการเสนอราคาทั้งหมดในประมูล (รวมทุกสถานะ)
 */
export const getAllAuctionBids = async (
  auctionId: number
): Promise<AuctionBid[]> => {
  try {
    const response = await auctionsService.getAuctionBids(auctionId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching all auction bids:', error);
    return [];
  }
};

/**
 * ดึงราคาเสนอล่าสุดของแต่ละบริษัท
 */
export const getLatestBidByCompany = async (
  auctionId: number
): Promise<AuctionBid[]> => {
  return await auctionsService.getLatestBidByCompany(auctionId);
};

/**
 * ดึงราคาเสนอต่ำสุด
 */
export const getLowestBid = async (
  auctionId: number
): Promise<AuctionBid | null> => {
  return await auctionsService.getLowestBid(auctionId);
};

export const getWinningBid = async (
  auctionId: number
): Promise<AuctionBid | null> => {
  return await auctionsService.getWinningBid(auctionId);
};

/**
 * ดึงจำนวนการเสนอราคาในประมูล (เฉพาะที่ยอมรับ)
 */
export const getBidCount = async (auctionId: number): Promise<number> => {
  const bids = await getAuctionBids(auctionId);
  return bids.length;
};

/**
 * ดึงจำนวนการเสนอราคาในประมูล (รวมทุกสถานะ)
 */
export const getTotalBidCount = async (auctionId: number): Promise<number> => {
  const bids = await getAllAuctionBids(auctionId);
  return bids.length;
};

/**
 * ดึงการเสนอราคาของผู้ใช้คนใดคนหนึ่ง
 */
export const getUserBids = async (
  auctionId: number,
  userId: number
): Promise<AuctionBid[]> => {
  try {
    const response = await auctionsService.getUserBids(auctionId, userId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching user bids:', error);
    return [];
  }
};

/**
 * ดึงการเสนอราคาล่าสุดของผู้ใช้
 */
export const getLatestUserBid = async (
  auctionId: number,
  userId: number
): Promise<AuctionBid | null> => {
  const bids = await getUserBids(auctionId, userId);
  const acceptedBids = bids.filter((bid) => bid.status === 'accept');
  return acceptedBids.length > 0 ? acceptedBids[0] : null;
};

/**
 * ดึงการเสนอราคาของบริษัท
 */
export const getCompanyBids = async (
  auctionId: number,
  companyId: number
): Promise<AuctionBid[]> => {
  try {
    const bids = await getAuctionBids(auctionId);
    return bids.filter((bid) => {
      const bidCompanyId = getCompanyByUserIdFromArray(bid.user_id, []);
      return bidCompanyId === companyId;
    });
  } catch (error) {
    console.error('Error fetching company bids:', error);
    return [];
  }
};

/**
 * ดึงการเสนอราคาล่าสุดของบริษัท
 */
export const getLatestCompanyBid = async (
  auctionId: number,
  companyId: number
): Promise<AuctionBid | null> => {
  const bids = await getCompanyBids(auctionId, companyId);
  return bids.length > 0 ? bids[0] : null;
};

/**
 * คำนวณผลต่างราคาจากราคาประกัน
 */
export const calculatePriceDifference = (
  reservePrice: number,
  bidAmount: number
): number => {
  return reservePrice - bidAmount;
};

/**
 * คำนวณเปอร์เซ็นต์ผลต่างราคาจากราคาประกัน
 */
export const calculatePriceDifferencePercentage = (
  reservePrice: number,
  bidAmount: number
): number => {
  if (reservePrice === 0) return 0;
  return ((reservePrice - bidAmount) / reservePrice) * 100;
};

/**
 * ตรวจสอบว่าบริษัทมีการเสนอราคาหรือไม่
 */
export const hasCompanyBid = async (
  auctionId: number,
  companyId: number
): Promise<boolean> => {
  try {
    const bids = await getAuctionBids(auctionId);
    return bids.some((bid) => {
      const bidCompanyId = getCompanyByUserIdFromArray(bid.user_id, []);
      return bidCompanyId === companyId;
    });
  } catch (error) {
    console.error('Error checking company bid:', error);
    return false;
  }
};

/**
 * ตรวจสอบว่าผู้ใช้มีการเสนอราคาหรือไม่
 */
export const hasUserBid = async (
  auctionId: number,
  userId: number
): Promise<boolean> => {
  return await auctionsService.hasUserBid(auctionId, userId);
};

/**
 * ดึงจำนวนครั้งที่ผู้ใช้เสนอราคา
 */
export const getUserBidAttempts = async (
  auctionId: number,
  userId: number
): Promise<number> => {
  const bids = await getUserBids(auctionId, userId);
  return bids.length;
};

/**
 * ดึงข้อมูลบริษัทจาก ID (อัปเดตให้รับ companies array)
 * @param companyId - ID ของบริษัท
 * @param companies - Array ของบริษัททั้งหมด
 * @returns ข้อมูลบริษัทหรือ null
 */
export const getCompanyById = (companyId: number, companies: any[]) => {
  return companies.find((company) => company.id === companyId) || null;
};

/**
 * ดึงชื่อบริษัทจาก ID (อัปเดตให้รับ companies array)
 * @param companyId - ID ของบริษัท
 * @param companies - Array ของบริษัททั้งหมด
 * @returns ชื่อบริษัทหรือ fallback string
 */
export const getCompanyName = (companyId: number, companies: any[]): string => {
  const company = getCompanyById(companyId, companies);
  return company ? company.name : `บริษัท #${companyId}`;
};

/**
 * ดึงข้อมูลบริษัทจาก user_id (อัปเดตให้รับ companies array)
 * @param userId - ID ของผู้ใช้
 * @param companies - Array ของบริษัททั้งหมด
 * @returns ข้อมูลบริษัทหรือ null
 */
export const getCompanyByUser = (userId: number, companies: any[]) => {
  const companyId = getCompanyByUserIdFromArray(userId, []);
  return companyId ? getCompanyById(companyId, companies) : null;
};

/**
 * ดึงชื่อบริษัทจาก user_id (อัปเดตให้รับ companies array)
 * @param userId - ID ของผู้ใช้
 * @param companies - Array ของบริษัททั้งหมด
 * @returns ชื่อบริษัทหรือ fallback string
 */
export const getCompanyNameByUser = (
  userId: number,
  companies: any[]
): string => {
  const companyId = getCompanyByUserIdFromArray(userId, []);
  return companyId ? getCompanyName(companyId, companies) : `ผู้ใช้ #${userId}`;
};

/**
 * ดึงสถิติการเสนอราคาตามสถานะ
 */
export const getBidStatsByStatus = async (auctionId: number) => {
  return await auctionsService.getBidStatsByStatus(auctionId);
};

/**
 * ดึงการเสนอราคาตามสถานะ
 */
export const getBidsByStatus = async (
  auctionId: number,
  status: string
): Promise<AuctionBid[]> => {
  try {
    const allBids = await getAllAuctionBids(auctionId);
    return allBids.filter((bid) => bid.status === status);
  } catch (error) {
    console.error('Error getting bids by status:', error);
    return [];
  }
};

/**
 * สร้างข้อมูลสำหรับตารางผู้เสนอราคา (อัปเดตสำหรับโครงสร้างใหม่)
 * @param auctionId - ID ของการประมูล
 * @param reservePrice - ราคาประกัน
 * @param companies - Array ของบริษัททั้งหมด
 * @returns ข้อมูลตารางผู้เสนอราคา
 */
export const getBidTableData = async (
  auctionId: number,
  reservePrice: number,
  companies: any[] = []
) => {
  try {
    const latestBids = await getLatestBidByCompany(auctionId);

    return latestBids.map((bid, index) => {
      const companyId = getCompanyByUserIdFromArray(bid.user_id, []);
      const company = companyId ? getCompanyById(companyId, companies) : null;
      const priceDiff = calculatePriceDifference(reservePrice, bid.bid_amount);
      const percentageDiff = calculatePriceDifferencePercentage(
        reservePrice,
        bid.bid_amount
      );

      return {
        rank: index + 1,
        userId: bid.user_id,
        companyId: companyId || 0,
        companyName: company?.name || `ผู้ใช้ #${bid.user_id}`,
        companyShortName:
          company?.name?.substring(0, 20) +
            (company?.name && company.name.length > 20 ? '...' : '') ||
          `ผู้ใช้ #${bid.user_id}`,
        bidAmount: bid.bid_amount,
        priceDifference: priceDiff,
        percentageDifference: percentageDiff,
        bidTime: bid.bid_time,
        isLowest: index === 0,
        status: bid.status,
        statusText: bid.status,
        statusColor: getBidStatusColor(bid.status),
        userRole: getUserRoleFromArray(bid.user_id, []) || 'unknown',
        canBid: canUserBidFromArray(bid.user_id, []),
        isConnected: isUserOnline(auctionId, bid.user_id),
      };
    });
  } catch (error) {
    console.error('Error getting bid table data:', error);
    return [];
  }
};

/**
 * ดึงข้อมูลประวัติการเสนอราคา (รวมข้อมูล User และ Company)
 */
export const getBidHistoryData = async (
  auctionId: number,
  reservePrice: number
) => {
  try {
    // ดึงข้อมูลการเสนอราคาทั้งหมด
    const allBids = await getAllAuctionBids(auctionId);

    // ดึงข้อมูล users และ companies ทั้งหมด
    const [usersResponse, companiesResponse, userCompaniesResponse] =
      await Promise.all([
        userService.getAllUsers(),
        companyService.getAllCompanies(),
        userCompanyService.getAllUserCompanies(),
      ]);

    const users = usersResponse.success ? usersResponse.data : [];
    const companies = companiesResponse.success ? companiesResponse.data : [];
    const userCompanies = userCompaniesResponse.success
      ? userCompaniesResponse.data
      : [];

    // เรียงลำดับตามเวลาจากใหม่ไปเก่า (ใหม่สุดด้านบน)
    const sortedBids = allBids.sort((a, b) => {
      const timeA = new Date(a.bid_time).getTime();
      const timeB = new Date(b.bid_time).getTime();
      return timeB - timeA; // เรียงจากมากไปน้อย (ใหม่ไปเก่า)
    });

    return sortedBids.map((bid) => {
      // หาข้อมูล user
      const user = users.find((u: any) => u.user_id === bid.user_id);
      const userName = user
        ? user.fullname || `ผู้ใช้ #${bid.user_id}`
        : `ผู้ใช้ #${bid.user_id}`;

      // หาข้อมูล company ของ user
      const userCompany =
        userCompanies.find(
          (uc: any) => uc.user_id === bid.user_id && uc.is_primary === true
        ) || userCompanies.find((uc: any) => uc.user_id === bid.user_id);

      const company = userCompany
        ? companies.find((c: any) => c.id === userCompany.company_id)
        : null;
      const companyName = company
        ? company.name
        : `บริษัท #${bid.company_id || 'ไม่ระบุ'}`;

      // คำนวณส่วนต่าง
      const priceDiff = calculatePriceDifference(reservePrice, bid.bid_amount);
      const percentageDiff = calculatePriceDifferencePercentage(
        reservePrice,
        bid.bid_amount
      );

      return {
        bidId: bid.bid_id,
        auctionId: auctionId,
        userId: bid.user_id,
        userName: userName,
        companyId: userCompany?.company_id || bid.company_id || 0,
        companyName: companyName,
        bidAmount: bid.bid_amount,
        priceDifference: priceDiff,
        percentageDifference: percentageDiff,
        bidTime: bid.bid_time,
        status: bid.status,
        statusText: bid.status, // แสดงสถานะตรงๆ จากฐานข้อมูล
        statusColor: getBidStatusColor(bid.status),
        userRole: userCompany?.role_in_company || 'unknown',
      };
    });
  } catch (error) {
    console.error('Error getting bid history data:', error);
    return [];
  }
};

/**
 * คำนวณเวลาคงเหลือในการประมูล
 */
export const calculateTimeRemaining = (
  endTime: string
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMinutes: number;
} => {
  const now = new Date();
  const end = safeParseDate(endTime);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalMinutes: 0,
    };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalMinutes,
  };
};

/**
 * ฟอร์แมตตัวเลขเป็นรูปแบบเงิน
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'THB'
): string => {
  if (isNaN(amount)) return '0';

  const formatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

/**
 * แปลงสตริงเป็นตัวเลข
 */
export const parseNumber = (str: string): number => {
  const cleaned = str.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * คำนวณเปอร์เซ็นต์
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // 2 decimal places
};

/**
 * เพิ่มวันลงในวันที่
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * เพิ่มเดือนลงในวันที่
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * ตรวจสอบว่าปีเป็นปีอธิกสุรทินหรือไม่
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * รับจำนวนวันในเดือน
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * แปลงวันที่เป็นรูปแบบ ISO string
 */
export const toISOString = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * ตัดสตริงและเพิ่ม ...
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * แปลงสตริงเป็น Title Case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * ลบช่องว่างส่วนเกิน
 */
export const cleanString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * ตรวจสอบเลขประจำตัวผู้เสียภาษี
 */
export const isValidTaxId = (taxId: string): boolean => {
  const cleaned = taxId.replace(/[-\s]/g, '');
  return /^\d{13}$/.test(cleaned);
};

/**
 * ลบค่าซ้ำในอาร์เรย์
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * สุ่มค่าในอาร์เรย์
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * จัดกลุ่มอาร์เรย์ตาม key
 */
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// =============================================================================
// FORM HANDLING UTILITIES
// =============================================================================

/**
 * Configuration options for handleFormChange function
 */
export interface FormChangeConfig {
  /** รูปแบบการ validate โทรศัพท์ */
  phoneValidation?: 'thai' | 'numbers-dash' | 'none';
  /** รูปแบบการ format อีเมล */
  emailFormat?: 'lowercase-trim' | 'none';
  /** ฟิลด์พิเศษที่ต้องการ handle แยก */
  customHandlers?: {
    [fieldName: string]: (value: string) => string;
  };
}

/**
 * Universal form change handler ที่ใช้ได้ทั้งหน้า user และ company
 * @param e - React change event
 * @param setForm - function สำหรับอัพเดท form state
 * @param config - configuration options
 */
export const handleFormChange = <T extends Record<string, any>>(
  e: any,
  setForm: any,
  config?: FormChangeConfig
) => {
  const { name, value, type } = e.target;

  // Handle checkbox
  if (type === 'checkbox') {
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev: T) => ({ ...prev, [name]: checked }));
    return;
  }

  let processedValue = value;

  // Apply custom handlers first
  if (config?.customHandlers && config.customHandlers[name]) {
    processedValue = config.customHandlers[name](value);
  }
  // Handle phone field
  else if (name === 'phone') {
    switch (config?.phoneValidation) {
      case 'thai':
        // เฉพาะตัวเลข 0-9 สำหรับหมายเลขโทรศัพท์ไทย
        processedValue = value.replace(/[^0-9]/g, '');
        break;
      case 'numbers-dash':
        // เฉพาะตัวเลขและ dash สำหรับหมายเลขโทรศัพท์ทั่วไป
        processedValue = value.replace(/[^0-9-]/g, '');
        break;
      case 'none':
      default:
        processedValue = value;
        break;
    }
  }
  // Handle tax_id field - เฉพาะตัวเลข
  else if (name === 'tax_id') {
    processedValue = value.replace(/[^0-9]/g, '');
  }
  // Handle email field
  else if (name === 'email') {
    switch (config?.emailFormat) {
      case 'lowercase-trim':
        processedValue = value.toLowerCase().trim();
        break;
      case 'none':
      default:
        processedValue = value;
        break;
    }
  }

  setForm((prev: T) => ({ ...prev, [name]: processedValue }));
};

/**
 * Default configuration for form handling
 */
export const formChangeConfig = {
  phoneValidation: 'numbers-dash' as const,
  emailFormat: 'none' as const,
} satisfies FormChangeConfig;

// =============================================================================
// URL ENCODING UTILITIES
// =============================================================================

/**
 * เข้ารหัส ID สำหรับส่งใน URL
 * @param id - ID ที่ต้องการเข้ารหัส
 * @returns string - ID ที่เข้ารหัสแล้ว
 */
export const encodeId = (id: number | string): string => {
  const numId = typeof id === 'string' ? parseInt(id) : id;

  // เข้ารหัสทุก ID รวมถึง 0 เพื่อความสม่ำเสมอ
  const timestamp = Date.now().toString();
  const combined = `${numId}_${timestamp}`;
  const encoded = btoa(combined);

  // เพิ่ม prefix และ suffix เพื่อความปลอดภัย
  return `enc_${encoded}_end`;
};

/**
 * ถอดรหัส ID จาก URL
 * @param encodedId - ID ที่เข้ารหัสแล้ว
 * @returns number | null - ID ที่ถอดรหัสแล้วหรือ null หากไม่สามารถถอดรหัสได้
 */
export const decodeId = (encodedId: string): number | null => {
  try {
    // ตรวจสอบรูปแบบ prefix และ suffix
    if (!encodedId.startsWith('enc_') || !encodedId.endsWith('_end')) {
      return null;
    }

    // ตัด prefix และ suffix ออก
    const base64Part = encodedId.slice(4, -4);

    // ถอดรหัส Base64
    const decoded = atob(base64Part);

    // แยก ID จาก timestamp
    const parts = decoded.split('_');
    if (parts.length !== 2) {
      return null;
    }

    const id = parseInt(parts[0]);
    if (isNaN(id) || id < 0) {
      return null;
    }

    return id;
  } catch (error) {
    console.error('Error decoding ID:', error);
    return null;
  }
};

/**
 * สร้าง URL พร้อมเข้ารหัส ID parameter
 * @param basePath - path หลักของ URL (เช่น '/auctionform?id=', '/editform?userId=', '/auctionform')
 * @param id - ID ที่ต้องการเข้ารหัส
 * @param paramName - ชื่อ parameter (default: 'id') - ใช้เฉพาะเมื่อ basePath ไม่มี query parameter
 * @returns string - URL ที่มี ID เข้ารหัสแล้ว
 */
export const createSecureUrl = (
  basePath: string,
  id: number | string,
  paramName: string = 'id'
): string => {
  const encodedId = encodeId(id);

  // ตรวจสอบว่า basePath มี query parameter อยู่แล้วหรือไม่
  if (basePath.includes('?') && basePath.endsWith('=')) {
    // กรณีที่ส่งมาแบบ '/auctionform?id=' หรือ '/edituser?userId='
    return `${basePath}${encodedId}`;
  } else if (basePath.includes('?')) {
    // กรณีที่มี query parameter อยู่แล้วแต่ไม่ได้ลงท้ายด้วย =
    return `${basePath}&${paramName}=${encodedId}`;
  } else {
    // กรณีปกติที่ไม่มี query parameter
    return `${basePath}?${paramName}=${encodedId}`;
  }
};

/**
 * สร้าง URL สำหรับ auctionform พร้อมเข้ารหัส ID (backward compatibility)
 * @param id - ID ของ auction
 * @returns string - URL ที่มี ID เข้ารหัสแล้ว
 */
export const createAuctionFormUrl = (id: number | string): string => {
  return createSecureUrl('/auctionform', id);
};

/**
 * แปลง UTC MySQL datetime เป็น local time สำหรับแสดงผล
 * @param utcDateTime - UTC datetime string จากฐานข้อมูล เช่น "2025-06-26 08:46:49"
 * @param format - รูปแบบการแสดงผล: 'datetime', 'date', 'time' (default: 'datetime')
 * @returns string เวลาท้องถิ่นสำหรับแสดงผล
 */
export const convertUTCToLocal = (
  utcDateTime: string,
  format: 'datetime' | 'date' | 'time' = 'datetime'
): string => {
  try {
    if (!utcDateTime || typeof utcDateTime !== 'string') {
      console.warn('Invalid UTC date time provided');
      return '';
    }

    // แปลง UTC string เป็น Date object
    const utcDate = new Date(utcDateTime + 'Z'); // เพิ่ม Z เพื่อบอกว่าเป็น UTC

    if (!isValidDate(utcDate)) {
      console.warn('Invalid UTC date provided to convertUTCToLocal');
      return '';
    }

    // แปลงเป็นเวลาท้องถิ่นตามรูปแบบที่ต้องการ
    switch (format) {
      case 'date':
        return formatDateForDisplay(utcDate, false); // แค่วันที่
      case 'time':
        return utcDate.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }); // แค่เวลา
      case 'datetime':
      default:
        return formatDateForDisplay(utcDate, true); // วันที่และเวลา
    }
  } catch (error) {
    console.error('Error converting UTC to local time:', error);
    return '';
  }
};

// =============================================================================
// BID UTILITIES (ARRAY VERSIONS)
// =============================================================================

/**
 * หาการเสนอราคาต่ำสุดจาก bid array
 * @param bids - Array ของ AuctionBid
 * @returns AuctionBid | null - การเสนอราคาต่ำสุดหรือ null
 */
export const getLowestBidFromArray = (
  bids: AuctionBid[]
): AuctionBid | null => {
  if (bids.length === 0) return null;
  const acceptedBids = bids.filter((bid) => bid.status === 'accept');
  if (acceptedBids.length === 0) return null;
  return acceptedBids.reduce((lowest, current) =>
    current.bid_amount < lowest.bid_amount ? current : lowest
  );
};

/**
 * นับจำนวนการเสนอราคาที่ยอมรับจาก bid array
 * @param bids - Array ของ AuctionBid
 * @returns number - จำนวนการเสนอราคาที่ยอมรับ
 */
export const getBidCountFromArray = (bids: AuctionBid[]): number => {
  return bids.filter((bid) => bid.status === 'accept').length;
};

/**
 * หาการเสนอราคาที่ชนะจาก bid array (ราคาต่ำสุด)
 * @param bids - Array ของ AuctionBid
 * @returns AuctionBid | null - การเสนอราคาที่ชนะหรือ null
 */
export const getWinningBidFromArray = (
  bids: AuctionBid[]
): AuctionBid | null => {
  if (bids.length === 0) return null;

  // หาราคาต่ำสุดจากการเสนอราคาที่ยอมรับแล้ว
  const acceptedBids = bids.filter((bid) => bid.status === 'accept');
  if (acceptedBids.length === 0) return null;

  return acceptedBids.reduce((lowest, current) =>
    current.bid_amount < lowest.bid_amount ? current : lowest
  );
};

/**
 * กรองการเสนอราคาตามสถานะจาก bid array
 * @param bids - Array ของ AuctionBid
 * @param status - สถานะที่ต้องการกรอง
 * @returns AuctionBid[] - Array ของการเสนอราคาที่ตรงตามสถานะ
 */
export const getBidsByStatusFromArray = (
  bids: AuctionBid[],
  status: string
): AuctionBid[] => {
  return bids.filter((bid) => bid.status === status);
};

/**
 * หาการเสนอราคาล่าสุดของบริษัทจาก bid array
 * @param bids - Array ของ AuctionBid
 * @param companyId - ID ของบริษัท
 * @returns AuctionBid | null - การเสนอราคาล่าสุดของบริษัทหรือ null
 */
export const getLatestCompanyBidFromArray = (
  bids: AuctionBid[],
  companyId: number
): AuctionBid | null => {
  const companyBids = bids.filter((bid) => bid.company_id === companyId);
  if (companyBids.length === 0) return null;

  return companyBids.reduce((latest, current) => {
    const latestTime = new Date(latest.bid_time).getTime();
    const currentTime = new Date(current.bid_time).getTime();
    return currentTime > latestTime ? current : latest;
  });
};

/**
 * หาการเสนอราคาล่าสุดของผู้ใช้จาก bid array
 * @param bids - Array ของ AuctionBid
 * @param userId - ID ของผู้ใช้
 * @returns AuctionBid | null - การเสนอราคาล่าสุดของผู้ใช้หรือ null
 */
export const getLatestUserBidFromArray = (
  bids: AuctionBid[],
  userId: number
): AuctionBid | null => {
  const userBids = bids.filter((bid) => bid.user_id === userId);
  if (userBids.length === 0) return null;

  return userBids.reduce((latest, current) => {
    const latestTime = new Date(latest.bid_time).getTime();
    const currentTime = new Date(current.bid_time).getTime();
    return currentTime > latestTime ? current : latest;
  });
};

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

export default {
  // Date & Time
  formatDateForData,
  formatDateForDisplay,
  formatDateTime,
  parseStringToDate,
  isValidDate,
  getCurrentDateTime,
  safeParseDate,
  convertToLocalDateTimeString,
  createDateChangeHandler,
  calculateTimeRemaining,
  formatTimeRemaining,
  getTimeRemaining,

  // Currency & Number
  formatCurrency,
  formatNumber,
  formatPrice,
  parseNumber,
  calculatePercentage,
  formatPercentage,
  formatAuctionId,

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

  // Bid
  getAuctionBids,
  getAllAuctionBids,
  getLatestBidByCompany,
  getLowestBid,
  getWinningBid,
  getBidCount,
  getTotalBidCount,
  getUserBids,
  getLatestUserBid,
  getCompanyBids,
  getLatestCompanyBid,
  calculatePriceDifference,
  calculatePriceDifferencePercentage,
  hasCompanyBid,
  hasUserBid,
  getUserBidAttempts,
  getBidStatsByStatus,
  getBidsByStatus,
  getBidTableData,
  getBidHistoryData,

  // String
  truncateString,
  truncateText,
  toTitleCase,
  cleanString,
  slugify,

  // Validation
  isValidEmail,
  isValidThaiPhone,
  isValidTaxId,
  isValidThaiNationalId,

  // Array
  removeDuplicates,
  shuffleArray,
  groupBy,

  // Local Storage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,

  // Form Handling
  handleFormChange,
  formChangeConfig,

  // URL Encoding
  encodeId,
  decodeId,
  createSecureUrl,
  createAuctionFormUrl,
  convertUTCToLocal,
};
