// ข้อมูลจำลองการเสนอราคาประมูล (Bid History)
export interface AuctionBid {
  bid_id: number; // Primary Key
  auction_id: number; // FK → Auction
  user_id: number; // FK → User (ผู้เสนอราคา)
  bid_amount: number; // ราคาที่เสนอ
  bid_time: string; // เวลาที่เสนอราคา
  status: string; // สถานะราคา (accept, rejected, canceled ฯลฯ)
  attempt: number; // ครั้งที่เท่าไรของการเสนอ
  is_winning: boolean; // เป็นราคาชนะหรือไม่
}

export const dataAuction_Bid: AuctionBid[] = [
  // ประมูล ID 1: วัตถุดิบแปรรูปอาหาร (Reserve: 500,000)
  {
    bid_id: 1,
    auction_id: 1,
    user_id: 101,
    bid_amount: 480000,
    bid_time: '2025-06-01 09:15:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 2,
    auction_id: 1,
    user_id: 102,
    bid_amount: 475000,
    bid_time: '2025-06-01 09:20:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 3,
    auction_id: 1,
    user_id: 103,
    bid_amount: 465000,
    bid_time: '2025-06-01 09:35:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 22,
    auction_id: 1,
    user_id: 115,
    bid_amount: 460000,
    bid_time: '2025-06-01 09:45:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 23,
    auction_id: 1,
    user_id: 116,
    bid_amount: 455000,
    bid_time: '2025-06-01 09:50:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 2: วัตถุดิบผลิตอาหารสัตว์ (Reserve: 750,000)
  {
    bid_id: 4,
    auction_id: 2,
    user_id: 101,
    bid_amount: 720000,
    bid_time: '2025-06-02 13:10:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 5,
    auction_id: 2,
    user_id: 104,
    bid_amount: 715000,
    bid_time: '2025-06-02 13:25:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 6: อาหารสัตว์สำเร็จรูป (Reserve: 350,000)
  {
    bid_id: 6,
    auction_id: 6,
    user_id: 105,
    bid_amount: 340000,
    bid_time: '2025-06-05 13:05:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 7,
    auction_id: 6,
    user_id: 106,
    bid_amount: 335000,
    bid_time: '2025-06-05 13:20:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 8,
    auction_id: 6,
    user_id: 107,
    bid_amount: 325000,
    bid_time: '2025-06-05 13:40:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 11: เฟอร์นิเจอร์สำนักงาน (Reserve: 280,000)
  {
    bid_id: 9,
    auction_id: 11,
    user_id: 107,
    bid_amount: 275000,
    bid_time: '2025-06-09 14:15:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 10,
    auction_id: 11,
    user_id: 108,
    bid_amount: 270000,
    bid_time: '2025-06-09 14:30:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 12: อุปกรณ์ไอทีสำนักงาน (Reserve: 950,000)
  {
    bid_id: 11,
    auction_id: 12,
    user_id: 109,
    bid_amount: 920000,
    bid_time: '2025-06-10 10:05:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 12,
    auction_id: 12,
    user_id: 110,
    bid_amount: 910000,
    bid_time: '2025-06-10 10:20:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 13: เครื่องใช้สำนักงาน (Reserve: 320,000)
  {
    bid_id: 13,
    auction_id: 13,
    user_id: 111,
    bid_amount: 315000,
    bid_time: '2025-06-03 15:10:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 14,
    auction_id: 13,
    user_id: 112,
    bid_amount: 310000,
    bid_time: '2025-06-03 15:25:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 15,
    auction_id: 13,
    user_id: 113,
    bid_amount: 305000,
    bid_time: '2025-06-03 15:40:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 16: วัตถุดิบอุตสาหกรรมอาหาร (Reserve: 890,000)
  {
    bid_id: 16,
    auction_id: 16,
    user_id: 112,
    bid_amount: 870000,
    bid_time: '2025-06-05 15:10:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 17,
    auction_id: 16,
    user_id: 113,
    bid_amount: 860000,
    bid_time: '2025-06-05 15:25:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 18,
    auction_id: 16,
    user_id: 114,
    bid_amount: 850000,
    bid_time: '2025-06-05 15:40:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // ประมูล ID 18: อุปกรณ์สำนักงานไฮเอนด์ (Reserve: 1,500,000)
  {
    bid_id: 19,
    auction_id: 18,
    user_id: 117,
    bid_amount: 1480000,
    bid_time: '2025-06-07 16:05:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 20,
    auction_id: 18,
    user_id: 118,
    bid_amount: 1470000,
    bid_time: '2025-06-07 16:20:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 21,
    auction_id: 18,
    user_id: 119,
    bid_amount: 1450000,
    bid_time: '2025-06-07 16:35:00',
    status: 'accept',
    attempt: 1,
    is_winning: true, // ราคาต่ำสุดปัจจุบัน
  },

  // เพิ่มตัวอย่างการเสนอราคาหลายครั้งและสถานะต่างๆ
  {
    bid_id: 24,
    auction_id: 1,
    user_id: 101,
    bid_amount: 485000,
    bid_time: '2025-06-01 08:30:00',
    status: 'rejected', // ราคาสูงเกินไป
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 25,
    auction_id: 1,
    user_id: 101,
    bid_amount: 470000,
    bid_time: '2025-06-01 09:10:00',
    status: 'canceled', // ผู้ใช้ยกเลิกเอง
    attempt: 2,
    is_winning: false,
  },
  {
    bid_id: 26,
    auction_id: 2,
    user_id: 105,
    bid_amount: 730000,
    bid_time: '2025-06-02 12:45:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 27,
    auction_id: 2,
    user_id: 105,
    bid_amount: 710000,
    bid_time: '2025-06-02 13:30:00',
    status: 'accept',
    attempt: 2,
    is_winning: false,
  },
  {
    bid_id: 28,
    auction_id: 6,
    user_id: 108,
    bid_amount: 330000,
    bid_time: '2025-06-05 13:50:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 29,
    auction_id: 6,
    user_id: 109,
    bid_amount: 320000,
    bid_time: '2025-06-05 14:00:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
  {
    bid_id: 30,
    auction_id: 6,
    user_id: 110,
    bid_amount: 315000,
    bid_time: '2025-06-05 14:10:00',
    status: 'accept',
    attempt: 1,
    is_winning: false,
  },
];

// ฟังก์ชันช่วยในการจัดการข้อมูล Bid
export const BidStatus = {
  ACCEPT: 'accept',
  REJECTED: 'rejected',
  CANCELED: 'canceled',
} as const;

export type BidStatusType = (typeof BidStatus)[keyof typeof BidStatus];

// ฟังก์ชันช่วยในการแปลงสถานะเป็นภาษาไทย
export const getBidStatusText = (status: string): string => {
  switch (status) {
    case BidStatus.ACCEPT:
      return 'ยอมรับ';
    case BidStatus.REJECTED:
      return 'ปฏิเสธ';
    case BidStatus.CANCELED:
      return 'ยกเลิก';
    default:
      return 'ไม่ระบุ';
  }
};

// ฟังก์ชันช่วยในการแปลงสถานะเป็นสี
export const getBidStatusColor = (status: string): string => {
  switch (status) {
    case BidStatus.ACCEPT:
      return 'bg-green-100 text-green-800';
    case BidStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case BidStatus.CANCELED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
