// ข้อมูลจำลองผู้เข้าร่วมตลาดประมูล
export interface AuctionParticipant {
  id: number;
  auction_id: number;
  user_id: number;
  status: number;
  is_connected: boolean;
  joined_dt: string;
}

export const dataAuction_Participant: AuctionParticipant[] = [
  {
    id: 1,
    auction_id: 1,
    user_id: 1,
    status: 1,
    is_connected: true,
    joined_dt: '2024-03-25 08:30:00',
  },
  {
    id: 2,
    auction_id: 1,
    user_id: 2,
    status: 1,
    is_connected: false,
    joined_dt: '2024-03-25 08:45:00',
  },
  {
    id: 3,
    auction_id: 2,
    user_id: 3,
    status: 1,
    is_connected: true,
    joined_dt: '2024-03-27 08:50:00',
  },
];
