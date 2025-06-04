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
    code: 'sealed',
    name: 'ประมูลปิด',
    description: 'การประมูลแบบปิด โดยผู้ประมูลจะไม่เห็นราคาของผู้อื่น',
    status: 1,
  },
  {
    auction_type_id: 2,
    code: 'reverse',
    name: 'ประมูลย้อนกลับ',
    description: 'การประมูลแบบย้อนกลับ โดยผู้ประมูลจะเสนอราคาต่ำสุด',
    status: 1,
  },
  {
    auction_type_id: 3,
    code: 'live',
    name: 'ประมูลสด',
    description:
      'การประมูลแบบสด โดยผู้ประมูลจะเห็นราคาของผู้อื่นและสามารถเสนอราคาใหม่ได้',
    status: 1,
  },
];
