// ข้อมูลจำลองตลาดประมูล
export interface Auction {
  auction_id: number;
  name: string;
  auction_type_id: number;
  start_dt: string;
  end_dt: string;
  reserve_price: number;
  status: number;
  created_dt: string;
  updated_dt: string;
}

export const dataAuction: Auction[] = [
  {
    auction_id: 1,
    name: 'ประมูลรถยนต์มือสอง',
    auction_type_id: 1,
    start_dt: '2024-03-25 09:00:00',
    end_dt: '2024-03-26 17:00:00',
    reserve_price: 500000,
    status: 1,
    created_dt: '2024-03-20 10:00:00',
    updated_dt: '2024-03-20 10:00:00',
  },
  {
    auction_id: 2,
    name: 'ประมูลเครื่องจักรโรงงาน',
    auction_type_id: 2,
    start_dt: '2024-03-27 09:00:00',
    end_dt: '2024-03-28 17:00:00',
    reserve_price: 1000000,
    status: 1,
    created_dt: '2024-03-21 10:00:00',
    updated_dt: '2024-03-21 10:00:00',
  },
];
