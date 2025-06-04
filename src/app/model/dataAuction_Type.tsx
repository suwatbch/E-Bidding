// ข้อมูลจำลองประเภทการประมูล
export interface AuctionType {
  auction_type_id: number;
  code: string;
  name: string;
  description?: string;
  status: number;
}

export const dataAuction_Type: AuctionType[] = [
  {
    auction_type_id: 1,
    code: 'raw_material',
    name: 'วัตถุดิบ',
    description: 'วัตถุดิบ ผสมกับสินค้าอื่นๆ',
    status: 1,
  },
  {
    auction_type_id: 2,
    code: 'animal_food',
    name: 'อาหารสัตว์',
    description: 'อาหารสัตว์ สำหรับสัตว์ทั่วไป',
    status: 1,
  },
  {
    auction_type_id: 3,
    code: 'office_supplies',
    name: 'สินค้าสำนักงาน',
    description: 'สินค้าสำนักงาน สำหรับสำนักงานทั่วไป',
    status: 1,
  },
];
