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
    item_name: 'Toyota Camry 2.5G',
    description: 'รถยนต์มือสอง สภาพดี ปี 2022',
    quantity: 1,
    unit: 'คัน',
    base_price: 800000,
    status: 1,
  },
  {
    item_id: 2,
    auction_id: 1,
    item_name: 'Honda Accord 2.0 Turbo',
    description: 'รถยนต์มือสอง สภาพดี ปี 2023',
    quantity: 1,
    unit: 'คัน',
    base_price: 950000,
    status: 1,
  },
  {
    item_id: 3,
    auction_id: 2,
    item_name: 'เครื่องจักรกลโรงงาน CNC',
    description: 'เครื่องจักรกลโรงงานนำเข้า',
    quantity: 2,
    unit: 'เครื่อง',
    base_price: 1200000,
    status: 1,
  },
];
