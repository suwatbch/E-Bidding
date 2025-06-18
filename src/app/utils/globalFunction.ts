/**
 * Utility Functions for E-Bidding Application
 * รวมฟังก์ชันต่างๆ ที่ใช้ในระบบประมูลออนไลน์
 */

import {
  dataAuction_Participant,
  AuctionParticipant,
} from '@/app/model/dataAuction_Participant';
import {
  dataAuction_Bid,
  AuctionBid,
  getBidStatusText,
  getBidStatusColor,
} from '@/app/model/dataAuction_Bid';
import { initialCompanies } from '@/app/model/dataCompany';
import {
  dataUser_Company,
  getCompanyByUserId,
  getUserRole,
  canUserBid,
  getPrimaryCompanyByUserId,
  getAllCompaniesByUserId,
  getUserRoleInCompany,
  canUserBidInCompany,
  isUserAdmin,
  isUserAdminInCompany,
  getUserCompanyRelations,
  hasUserCompanyRelation,
  getRoleDisplayName,
} from '@/app/model/dataUser_Company';

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
    return `${timeRemaining.hours} ชม. ${timeRemaining.minutes} นาที`;
  } else if (timeRemaining.minutes > 0) {
    return `${timeRemaining.minutes} นาที`;
  } else {
    return `${timeRemaining.seconds} วินาที`;
  }
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
 * @param auction - ข้อมูลประมูล (ต้องมี auction_id และ created_dt)
 * @returns string ในรูปแบบ AUC + auction_id (เช่น AUC0001)
 */
export const formatAuctionId = (auction: {
  auction_id: number;
  created_dt: string;
}): string => {
  // เติม 0 ข้างหน้าให้ครบอย่างน้อย 4 หลัก หากเกินก็ยาวตามจำนวนหลักจริง
  const paddedId = auction.auction_id.toString().padStart(4, '0');

  return `AUC${paddedId}`;
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
export const getAuctionBids = (auctionId: number): AuctionBid[] => {
  return dataAuction_Bid
    .filter((bid) => bid.auction_id === auctionId && bid.status === 'accept')
    .sort(
      (a, b) => new Date(b.bid_time).getTime() - new Date(a.bid_time).getTime()
    );
};

/**
 * ดึงการเสนอราคาทั้งหมดในประมูล (รวมทุกสถานะ)
 */
export const getAllAuctionBids = (auctionId: number): AuctionBid[] => {
  return dataAuction_Bid
    .filter((bid) => bid.auction_id === auctionId)
    .sort(
      (a, b) => new Date(b.bid_time).getTime() - new Date(a.bid_time).getTime()
    );
};

/**
 * ดึงการเสนอราคาล่าสุดของแต่ละบริษัท (เฉพาะที่ยอมรับ)
 */
export const getLatestBidByCompany = (auctionId: number): AuctionBid[] => {
  const bids = getAuctionBids(auctionId);
  const latestBids: { [companyId: number]: AuctionBid } = {};

  bids.forEach((bid) => {
    const companyId = getCompanyByUserId(bid.user_id);
    if (companyId) {
      if (
        !latestBids[companyId] ||
        new Date(bid.bid_time) > new Date(latestBids[companyId].bid_time)
      ) {
        latestBids[companyId] = bid;
      }
    }
  });

  return Object.values(latestBids).sort((a, b) => a.bid_amount - b.bid_amount);
};

/**
 * ดึงราคาเสนอต่ำสุดในประมูล
 */
export const getLowestBid = (auctionId: number): AuctionBid | null => {
  const latestBids = getLatestBidByCompany(auctionId);
  return latestBids.length > 0 ? latestBids[0] : null;
};

/**
 * ดึงราคาเสนอที่ชนะ (is_winning = true)
 */
export const getWinningBid = (auctionId: number): AuctionBid | null => {
  const bids = dataAuction_Bid.filter(
    (bid) => bid.auction_id === auctionId && bid.is_winning
  );
  return bids.length > 0 ? bids[0] : null;
};

/**
 * ดึงจำนวนการเสนอราคาในประมูล (เฉพาะที่ยอมรับ)
 */
export const getBidCount = (auctionId: number): number => {
  return getAuctionBids(auctionId).length;
};

/**
 * ดึงจำนวนการเสนอราคาทั้งหมด (รวมทุกสถานะ)
 */
export const getTotalBidCount = (auctionId: number): number => {
  return getAllAuctionBids(auctionId).length;
};

/**
 * ดึงการเสนอราคาของผู้ใช้ในประมูล
 */
export const getUserBids = (
  auctionId: number,
  userId: number
): AuctionBid[] => {
  return dataAuction_Bid
    .filter((bid) => bid.auction_id === auctionId && bid.user_id === userId)
    .sort(
      (a, b) => new Date(b.bid_time).getTime() - new Date(a.bid_time).getTime()
    );
};

/**
 * ดึงการเสนอราคาล่าสุดของผู้ใช้
 */
export const getLatestUserBid = (
  auctionId: number,
  userId: number
): AuctionBid | null => {
  const bids = getUserBids(auctionId, userId);
  const acceptedBids = bids.filter((bid) => bid.status === 'accept');
  return acceptedBids.length > 0 ? acceptedBids[0] : null;
};

/**
 * ดึงการเสนอราคาของบริษัทในประมูล
 */
export const getCompanyBids = (
  auctionId: number,
  companyId: number
): AuctionBid[] => {
  return dataAuction_Bid
    .filter((bid) => {
      const bidCompanyId = getCompanyByUserId(bid.user_id);
      return (
        bid.auction_id === auctionId &&
        bidCompanyId === companyId &&
        bid.status === 'accept'
      );
    })
    .sort(
      (a, b) => new Date(b.bid_time).getTime() - new Date(a.bid_time).getTime()
    );
};

/**
 * ดึงการเสนอราคาล่าสุดของบริษัท
 */
export const getLatestCompanyBid = (
  auctionId: number,
  companyId: number
): AuctionBid | null => {
  const bids = getCompanyBids(auctionId, companyId);
  return bids.length > 0 ? bids[0] : null;
};

/**
 * คำนวณความต่างจากราคาตั้งต้น
 */
export const calculatePriceDifference = (
  reservePrice: number,
  bidAmount: number
): number => {
  return reservePrice - bidAmount;
};

/**
 * คำนวณเปอร์เซ็นต์ความต่างจากราคาตั้งต้น
 */
export const calculatePriceDifferencePercentage = (
  reservePrice: number,
  bidAmount: number
): number => {
  if (reservePrice === 0) return 0;
  return ((reservePrice - bidAmount) / reservePrice) * 100;
};

/**
 * ตรวจสอบว่าบริษัทเสนอราคาในประมูลหรือไม่
 */
export const hasCompanyBid = (
  auctionId: number,
  companyId: number
): boolean => {
  return dataAuction_Bid.some((bid) => {
    const bidCompanyId = getCompanyByUserId(bid.user_id);
    return (
      bid.auction_id === auctionId &&
      bidCompanyId === companyId &&
      bid.status === 'accept'
    );
  });
};

/**
 * ตรวจสอบว่าผู้ใช้เสนอราคาในประมูลหรือไม่
 */
export const hasUserBid = (auctionId: number, userId: number): boolean => {
  return dataAuction_Bid.some(
    (bid) =>
      bid.auction_id === auctionId &&
      bid.user_id === userId &&
      bid.status === 'accept'
  );
};

/**
 * ดึงข้อมูลบริษัทจาก ID
 */
export const getCompanyById = (companyId: number) => {
  return initialCompanies.find((company) => company.id === companyId) || null;
};

/**
 * ดึงชื่อบริษัทจาก ID
 */
export const getCompanyName = (companyId: number): string => {
  const company = getCompanyById(companyId);
  return company ? company.name : `บริษัท #${companyId}`;
};

/**
 * ดึงข้อมูลบริษัทจาก user_id
 */
export const getCompanyByUser = (userId: number) => {
  const companyId = getCompanyByUserId(userId);
  return companyId ? getCompanyById(companyId) : null;
};

/**
 * ดึงชื่อบริษัทจาก user_id
 */
export const getCompanyNameByUser = (userId: number): string => {
  const companyId = getCompanyByUserId(userId);
  return companyId ? getCompanyName(companyId) : `ผู้ใช้ #${userId}`;
};

/**
 * ดึงจำนวนการพยายามเสนอราคาของผู้ใช้
 */
export const getUserBidAttempts = (
  auctionId: number,
  userId: number
): number => {
  const bids = getUserBids(auctionId, userId);
  return bids.length;
};

/**
 * ดึงสถิติการเสนอราคาตามสถานะ
 */
export const getBidStatsByStatus = (auctionId: number) => {
  const allBids = getAllAuctionBids(auctionId);

  return {
    accept: allBids.filter((bid) => bid.status === 'accept').length,
    rejected: allBids.filter((bid) => bid.status === 'rejected').length,
    canceled: allBids.filter((bid) => bid.status === 'canceled').length,
    total: allBids.length,
  };
};

/**
 * ดึงการเสนอราคาตามสถานะ
 */
export const getBidsByStatus = (
  auctionId: number,
  status: string
): AuctionBid[] => {
  return dataAuction_Bid
    .filter((bid) => bid.auction_id === auctionId && bid.status === status)
    .sort(
      (a, b) => new Date(b.bid_time).getTime() - new Date(a.bid_time).getTime()
    );
};

/**
 * สร้างข้อมูลสำหรับตารางผู้เสนอราคา (อัปเดตสำหรับโครงสร้างใหม่)
 */
export const getBidTableData = (auctionId: number, reservePrice: number) => {
  const latestBids = getLatestBidByCompany(auctionId);

  return latestBids.map((bid, index) => {
    const companyId = getCompanyByUserId(bid.user_id);
    const company = companyId ? getCompanyById(companyId) : null;
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
      isWinning: bid.is_winning,
      status: bid.status,
      attempt: bid.attempt,
      statusText: getBidStatusText(bid.status),
      statusColor: getBidStatusColor(bid.status),
      userRole: getUserRole(bid.user_id) || 'unknown',
      canBid: canUserBid(bid.user_id),
      isConnected: isUserOnline(auctionId, bid.user_id),
    };
  });
};

/**
 * สร้างข้อมูลประวัติการเสนอราคาทั้งหมด
 */
export const getBidHistoryData = (auctionId: number, reservePrice: number) => {
  const allBids = getAllAuctionBids(auctionId);

  // เรียงลำดับตามเวลาจากน้อยไปมาก (เก่าไปใหม่)
  const sortedBids = allBids.sort((a, b) => {
    const timeA = new Date(a.bid_time).getTime();
    const timeB = new Date(b.bid_time).getTime();
    return timeA - timeB; // เรียงจากน้อยไปมาก
  });

  return sortedBids.map((bid) => {
    const companyId = getCompanyByUserId(bid.user_id);
    const company = companyId ? getCompanyById(companyId) : null;
    const priceDiff = calculatePriceDifference(reservePrice, bid.bid_amount);
    const percentageDiff = calculatePriceDifferencePercentage(
      reservePrice,
      bid.bid_amount
    );

    return {
      bidId: bid.bid_id,
      userId: bid.user_id,
      companyId: companyId || 0,
      companyName: company?.name || `ผู้ใช้ #${bid.user_id}`,
      bidAmount: bid.bid_amount,
      priceDifference: priceDiff,
      percentageDifference: percentageDiff,
      bidTime: bid.bid_time,
      status: bid.status,
      attempt: bid.attempt,
      isWinning: bid.is_winning,
      statusText: getBidStatusText(bid.status),
      statusColor: getBidStatusColor(bid.status),
      userRole: getUserRole(bid.user_id) || 'unknown',
    };
  });
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
  return [...new Set(array)];
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
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  setForm: React.Dispatch<React.SetStateAction<T>>,
  config?: FormChangeConfig
) => {
  const { name, value, type } = e.target;

  // Handle checkbox
  if (type === 'checkbox') {
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: checked }));
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

  setForm((prev) => ({ ...prev, [name]: processedValue }));
};

/**
 * Default configuration for form handling
 */
export const formChangeConfig = {
  phoneValidation: 'numbers-dash' as const,
  emailFormat: 'none' as const,
} satisfies FormChangeConfig;

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
  getCompanyById,
  getCompanyName,
  getCompanyByUser,
  getCompanyNameByUser,
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
};
