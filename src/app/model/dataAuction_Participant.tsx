// ข้อมูลจำลองผู้เข้าร่วมประมูล
export interface AuctionParticipant {
  participant_id: number;
  auction_id: number;
  user_id: number;
  register_dt: string;
  status: number; // 1 = ลงทะเบียน, 2 = ยืนยันแล้ว, 3 = ยกเลิก
}

export const dataAuction_Participant: AuctionParticipant[] = [
  {
    participant_id: 1,
    auction_id: 1,
    user_id: 101,
    register_dt: '2025-05-28 10:00:00',
    status: 2,
  },
  {
    participant_id: 2,
    auction_id: 1,
    user_id: 102,
    register_dt: '2025-05-28 11:00:00',
    status: 2,
  },
  {
    participant_id: 3,
    auction_id: 1,
    user_id: 103,
    register_dt: '2025-05-28 12:00:00',
    status: 2,
  },
  {
    participant_id: 4,
    auction_id: 2,
    user_id: 101,
    register_dt: '2025-05-29 09:00:00',
    status: 2,
  },
  {
    participant_id: 5,
    auction_id: 2,
    user_id: 104,
    register_dt: '2025-05-29 10:00:00',
    status: 2,
  },
  {
    participant_id: 6,
    auction_id: 6,
    user_id: 105,
    register_dt: '2025-06-01 10:00:00',
    status: 2,
  },
  {
    participant_id: 7,
    auction_id: 6,
    user_id: 106,
    register_dt: '2025-06-01 11:00:00',
    status: 2,
  },
  {
    participant_id: 8,
    auction_id: 11,
    user_id: 107,
    register_dt: '2025-06-02 09:00:00',
    status: 2,
  },
  {
    participant_id: 9,
    auction_id: 11,
    user_id: 108,
    register_dt: '2025-06-02 10:00:00',
    status: 1,
  },
  {
    participant_id: 10,
    auction_id: 12,
    user_id: 109,
    register_dt: '2025-06-03 09:00:00',
    status: 2,
  },
  {
    participant_id: 11,
    auction_id: 12,
    user_id: 110,
    register_dt: '2025-06-03 10:00:00',
    status: 3,
  },
  {
    participant_id: 12,
    auction_id: 13,
    user_id: 111,
    register_dt: '2025-06-01 14:00:00',
    status: 2,
  },
  {
    participant_id: 13,
    auction_id: 16,
    user_id: 112,
    register_dt: '2025-06-02 13:00:00',
    status: 2,
  },
  {
    participant_id: 14,
    auction_id: 16,
    user_id: 113,
    register_dt: '2025-06-02 14:00:00',
    status: 2,
  },
  {
    participant_id: 15,
    auction_id: 17,
    user_id: 114,
    register_dt: '2025-06-03 11:00:00',
    status: 1,
  },
];
