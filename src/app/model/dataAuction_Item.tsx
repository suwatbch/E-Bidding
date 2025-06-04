// ข้อมูลจำลองรายการประมูล
export interface AuctionItem {
  item_id: number;
  auction_id: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  base_price: number;
  status: number;
}

export const dataAuction_Item: AuctionItem[] = [
  {
    item_id: 1,
    auction_id: 1,
    item_name: 'แป้งสาลีเกรดพรีเมียม',
    description: 'แป้งสาลีคุณภาพสูง สำหรับอุตสาหกรรมอาหาร',
    quantity: 1000,
    unit: 'กิโลกรัม',
    base_price: 500000,
    status: 1,
  },
  {
    item_id: 2,
    auction_id: 1,
    item_name: 'น้ำตาลทรายขาวบริสุทธิ์',
    description: 'น้ำตาลทรายขาวบริสุทธิ์ เกรดอุตสาหกรรม',
    quantity: 2000,
    unit: 'กิโลกรัม',
    base_price: 300000,
    status: 1,
  },
  {
    item_id: 3,
    auction_id: 2,
    item_name: 'ถั่วเหลืองอบแห้ง',
    description: 'ถั่วเหลืองอบแห้งคุณภาพสูง สำหรับผลิตอาหารสัตว์',
    quantity: 5000,
    unit: 'กิโลกรัม',
    base_price: 750000,
    status: 1,
  },
  {
    item_id: 4,
    auction_id: 6,
    item_name: 'อาหารสัตว์สำเร็จรูปสูตรพิเศษ',
    description: 'อาหารสัตว์คุณภาพสูง สูตรเพิ่มภูมิคุ้มกัน',
    quantity: 1000,
    unit: 'กิโลกรัม',
    base_price: 350000,
    status: 1,
  },
  {
    item_id: 5,
    auction_id: 11,
    item_name: 'ชุดโต๊ะทำงานผู้บริหาร',
    description: 'ชุดโต๊ะทำงานผู้บริหารพร้อมเก้าอี้ วัสดุคุณภาพสูง',
    quantity: 5,
    unit: 'ชุด',
    base_price: 280000,
    status: 1,
  },
  {
    item_id: 6,
    auction_id: 12,
    item_name: 'คอมพิวเตอร์ตั้งโต๊ะพร้อมอุปกรณ์',
    description: 'คอมพิวเตอร์ All-in-One พร้อมอุปกรณ์ต่อพ่วง',
    quantity: 20,
    unit: 'ชุด',
    base_price: 950000,
    status: 1,
  },
  {
    item_id: 7,
    auction_id: 13,
    item_name: 'เครื่องถ่ายเอกสารมัลติฟังก์ชัน',
    description: 'เครื่องถ่ายเอกสารระบบดิจิทัล พร้อมฟังก์ชันสแกนและพิมพ์',
    quantity: 2,
    unit: 'เครื่อง',
    base_price: 320000,
    status: 1,
  },
  {
    item_id: 8,
    auction_id: 16,
    item_name: 'วัตถุดิบแปรรูปอาหารนำเข้า',
    description: 'วัตถุดิบคุณภาพสูงสำหรับอุตสาหกรรมอาหาร',
    quantity: 2000,
    unit: 'กิโลกรัม',
    base_price: 890000,
    status: 1,
  },
  {
    item_id: 9,
    auction_id: 17,
    item_name: 'อาหารสัตว์นำเข้าเกรดพรีเมียม',
    description: 'อาหารสัตว์นำเข้าคุณภาพสูง สูตรพิเศษ',
    quantity: 1500,
    unit: 'กิโลกรัม',
    base_price: 720000,
    status: 1,
  },
  {
    item_id: 10,
    auction_id: 18,
    item_name: 'ชุดเฟอร์นิเจอร์สำนักงานหรู',
    description: 'ชุดเฟอร์นิเจอร์สำนักงานระดับไฮเอนด์ ครบเซ็ต',
    quantity: 3,
    unit: 'ชุด',
    base_price: 1500000,
    status: 1,
  },
  {
    item_id: 11,
    auction_id: 19,
    item_name: 'วัตถุดิบอาหารแปรรูปพรีเมียม',
    description: 'วัตถุดิบอาหารแปรรูปคุณภาพสูง เกรดส่งออก',
    quantity: 3000,
    unit: 'กิโลกรัม',
    base_price: 980000,
    status: 1,
  },
  {
    item_id: 12,
    auction_id: 20,
    item_name: 'ชุดครุภัณฑ์สำนักงานครบชุด',
    description: 'ชุดครุภัณฑ์สำนักงานครบชุด พร้อมติดตั้ง',
    quantity: 1,
    unit: 'ชุด',
    base_price: 750000,
    status: 1,
  },
];
