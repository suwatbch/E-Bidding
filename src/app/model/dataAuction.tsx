// ข้อมูลจำลองตลาดประมูล
export interface Auction {
  auction_id: number;
  name: string;
  auction_type_id: number;
  start_dt: string;
  end_dt: string;
  reserve_price: number;
  status: number; // 1 เปิดการประมูล, 2 รอการประมูล, 3 กำลังประมูล, 4 ใกล้สิ้นสุด, 5 สิ้นสุดประมูล, 6 ยกเลิกประมูล
  is_deleted: number; // 1 = active, 0 = inactive
  created_dt: string;
  updated_dt: string;
}

export const dataAuction: Auction[] = [
  {
    auction_id: 1,
    name: 'วัตถุดิบแปรรูปอาหาร',
    auction_type_id: 1,
    start_dt: '2025-06-01 09:00:00',
    end_dt: '2025-06-01 10:00:00',
    reserve_price: 500000,
    status: 1, // เปิดการประมูล
    is_deleted: 0,
    created_dt: '2025-05-25 10:00:00',
    updated_dt: '2025-05-25 10:00:00',
  },
  {
    auction_id: 2,
    name: 'วัตถุดิบผลิตอาหารสัตว์',
    auction_type_id: 1,
    start_dt: '2025-06-02 13:00:00',
    end_dt: '2025-06-02 14:00:00',
    reserve_price: 750000,
    status: 2, // รอการประมูล
    is_deleted: 0,
    created_dt: '2025-05-25 11:00:00',
    updated_dt: '2025-05-25 11:00:00',
  },
  {
    auction_id: 3,
    name: 'วัตถุดิบนำเข้าจากต่างประเทศ',
    auction_type_id: 1,
    start_dt: '2025-06-03 10:00:00',
    end_dt: '2025-06-03 11:00:00',
    reserve_price: 1200000,
    status: 3, // กำลังประมูล
    is_deleted: 0,
    created_dt: '2025-05-26 09:00:00',
    updated_dt: '2025-05-26 09:00:00',
  },
  {
    auction_id: 4,
    name: 'วัตถุดิบแปรรูปอาหารทะเล',
    auction_type_id: 1,
    start_dt: '2025-06-01 14:00:00',
    end_dt: '2025-06-01 15:00:00',
    reserve_price: 680000,
    status: 5, // สิ้นสุดประมูล
    is_deleted: 0,
    created_dt: '2025-05-25 13:00:00',
    updated_dt: '2025-06-01 15:00:00',
  },
  {
    auction_id: 5,
    name: 'วัตถุดิบสำหรับผลิตขนม',
    auction_type_id: 1,
    start_dt: '2025-06-04 09:00:00',
    end_dt: '2025-06-04 10:00:00',
    reserve_price: 450000,
    status: 6, // ยกเลิกประมูล
    is_deleted: 0,
    created_dt: '2025-05-26 10:00:00',
    updated_dt: '2025-05-26 15:00:00',
  },
  {
    auction_id: 6,
    name: 'อาหารสัตว์สำเร็จรูป',
    auction_type_id: 2,
    start_dt: '2025-06-05 13:00:00',
    end_dt: '2025-06-05 14:00:00',
    reserve_price: 350000,
    status: 1, // เปิดการประมูล
    is_deleted: 0,
    created_dt: '2025-05-27 09:00:00',
    updated_dt: '2025-05-27 09:00:00',
  },
  {
    auction_id: 7,
    name: 'อาหารสัตว์เลี้ยงพรีเมียม',
    auction_type_id: 2,
    start_dt: '2025-06-06 15:00:00',
    end_dt: '2025-06-06 16:00:00',
    reserve_price: 820000,
    status: 2, // รอการประมูล
    is_deleted: 0,
    created_dt: '2025-05-27 10:00:00',
    updated_dt: '2025-05-27 10:00:00',
  },
  {
    auction_id: 8,
    name: 'อาหารสัตว์น้ำ',
    auction_type_id: 2,
    start_dt: '2025-06-07 11:00:00',
    end_dt: '2025-06-07 12:00:00',
    reserve_price: 580000,
    status: 3, // กำลังประมูล
    is_deleted: 0,
    created_dt: '2025-05-27 11:00:00',
    updated_dt: '2025-05-27 11:00:00',
  },
  {
    auction_id: 9,
    name: 'อาหารสัตว์ปีก',
    auction_type_id: 2,
    start_dt: '2025-06-02 10:00:00',
    end_dt: '2025-06-02 11:00:00',
    reserve_price: 420000,
    status: 5, // สิ้นสุดประมูล
    is_deleted: 0,
    created_dt: '2025-05-25 14:00:00',
    updated_dt: '2025-06-02 11:00:00',
  },
  {
    auction_id: 10,
    name: 'อาหารสัตว์เคี้ยวเอื้อง',
    auction_type_id: 2,
    start_dt: '2025-06-08 13:00:00',
    end_dt: '2025-06-08 14:00:00',
    reserve_price: 650000,
    status: 6, // ยกเลิกประมูล
    is_deleted: 0,
    created_dt: '2025-05-27 13:00:00',
    updated_dt: '2025-05-27 15:00:00',
  },
  {
    auction_id: 11,
    name: 'เฟอร์นิเจอร์สำนักงาน',
    auction_type_id: 3,
    start_dt: '2025-06-09 14:00:00',
    end_dt: '2025-06-09 15:00:00',
    reserve_price: 280000,
    status: 1, // เปิดการประมูล
    is_deleted: 0,
    created_dt: '2025-05-28 09:00:00',
    updated_dt: '2025-05-28 09:00:00',
  },
  {
    auction_id: 12,
    name: 'อุปกรณ์ไอทีสำนักงาน',
    auction_type_id: 3,
    start_dt: '2025-06-10 10:00:00',
    end_dt: '2025-06-10 11:00:00',
    reserve_price: 950000,
    status: 2, // รอการประมูล
    is_deleted: 0,
    created_dt: '2025-05-28 10:00:00',
    updated_dt: '2025-05-28 10:00:00',
  },
  {
    auction_id: 13,
    name: 'เครื่องใช้สำนักงาน',
    auction_type_id: 3,
    start_dt: '2025-06-03 15:00:00',
    end_dt: '2025-06-03 16:00:00',
    reserve_price: 320000,
    status: 3, // กำลังประมูล
    is_deleted: 0,
    created_dt: '2025-05-28 11:00:00',
    updated_dt: '2025-05-28 11:00:00',
  },
  {
    auction_id: 14,
    name: 'วัสดุสิ้นเปลืองสำนักงาน',
    auction_type_id: 3,
    start_dt: '2025-06-01 11:00:00',
    end_dt: '2025-06-01 12:00:00',
    reserve_price: 150000,
    status: 5, // สิ้นสุดประมูล
    is_deleted: 0,
    created_dt: '2025-05-25 15:00:00',
    updated_dt: '2025-06-01 12:00:00',
  },
  {
    auction_id: 15,
    name: 'อุปกรณ์ตกแต่งสำนักงาน',
    auction_type_id: 3,
    start_dt: '2025-06-04 14:00:00',
    end_dt: '2025-06-04 15:00:00',
    reserve_price: 480000,
    status: 6, // ยกเลิกประมูล
    is_deleted: 0,
    created_dt: '2025-05-28 13:00:00',
    updated_dt: '2025-05-28 15:00:00',
  },
  {
    auction_id: 16,
    name: 'วัตถุดิบอุตสาหกรรมอาหาร',
    auction_type_id: 1,
    start_dt: '2025-06-05 15:00:00',
    end_dt: '2025-06-05 16:00:00',
    reserve_price: 890000,
    status: 1, // เปิดการประมูล
    is_deleted: 0,
    created_dt: '2025-05-29 09:00:00',
    updated_dt: '2025-05-29 09:00:00',
  },
  {
    auction_id: 17,
    name: 'อาหารสัตว์นำเข้า',
    auction_type_id: 2,
    start_dt: '2025-06-06 11:00:00',
    end_dt: '2025-06-06 12:00:00',
    reserve_price: 720000,
    status: 2, // รอการประมูล
    is_deleted: 0,
    created_dt: '2025-05-29 10:00:00',
    updated_dt: '2025-05-29 10:00:00',
  },
  {
    auction_id: 18,
    name: 'อุปกรณ์สำนักงานไฮเอนด์',
    auction_type_id: 3,
    start_dt: '2025-06-07 16:00:00',
    end_dt: '2025-06-07 17:00:00',
    reserve_price: 1500000,
    status: 3, // กำลังประมูล
    is_deleted: 0,
    created_dt: '2025-05-29 11:00:00',
    updated_dt: '2025-05-29 11:00:00',
  },
  {
    auction_id: 19,
    name: 'วัตถุดิบแปรรูปเกรดพรีเมียม',
    auction_type_id: 1,
    start_dt: '2025-06-08 13:00:00',
    end_dt: '2025-06-08 14:00:00',
    reserve_price: 980000,
    status: 5, // สิ้นสุดประมูล
    is_deleted: 0,
    created_dt: '2025-05-25 16:00:00',
    updated_dt: '2025-06-08 14:00:00',
  },
  {
    auction_id: 20,
    name: 'อุปกรณ์สำนักงานครบชุด',
    auction_type_id: 3,
    start_dt: '2025-06-09 15:00:00',
    end_dt: '2025-06-09 16:00:00',
    reserve_price: 750000,
    status: 6, // ยกเลิกประมูล
    is_deleted: 0,
    created_dt: '2025-05-29 13:00:00',
    updated_dt: '2025-05-29 15:00:00',
  },
];
