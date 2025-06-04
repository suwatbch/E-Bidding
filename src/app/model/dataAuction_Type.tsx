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
    description: 'วัตถุดิบสำหรับอุตสาหกรรมการผลิตและแปรรูป',
    status: 1,
  },
  {
    auction_type_id: 2,
    code: 'animal_food',
    name: 'อาหารสัตว์',
    description: 'อาหารสัตว์และผลิตภัณฑ์ที่เกี่ยวข้อง',
    status: 1,
  },
  {
    auction_type_id: 3,
    code: 'office_supplies',
    name: 'สินค้าสำนักงาน',
    description: 'อุปกรณ์และเครื่องใช้สำนักงาน',
    status: 1,
  },
  {
    auction_type_id: 4,
    code: 'electronics',
    name: 'อุปกรณ์อิเล็กทรอนิกส์',
    description: 'สินค้าอิเล็กทรอนิกส์และอุปกรณ์ไฟฟ้า',
    status: 1,
  },
  {
    auction_type_id: 5,
    code: 'machinery',
    name: 'เครื่องจักรอุตสาหกรรม',
    description: 'เครื่องจักรและอุปกรณ์สำหรับโรงงาน',
    status: 1,
  },
  {
    auction_type_id: 6,
    code: 'vehicles',
    name: 'ยานพาหนะ',
    description: 'รถยนต์และยานพาหนะทุกประเภท',
    status: 1,
  },
  {
    auction_type_id: 7,
    code: 'furniture',
    name: 'เฟอร์นิเจอร์',
    description: 'เฟอร์นิเจอร์และของตกแต่ง',
    status: 1,
  },
  {
    auction_type_id: 8,
    code: 'construction',
    name: 'วัสดุก่อสร้าง',
    description: 'วัสดุและอุปกรณ์ก่อสร้าง',
    status: 0,
  },
  {
    auction_type_id: 9,
    code: 'agriculture',
    name: 'อุปกรณ์การเกษตร',
    description: 'เครื่องมือและอุปกรณ์ทางการเกษตร',
    status: 0,
  },
  {
    auction_type_id: 10,
    code: 'medical',
    name: 'อุปกรณ์การแพทย์',
    description: 'เครื่องมือและอุปกรณ์ทางการแพทย์',
    status: 0,
  },
];
