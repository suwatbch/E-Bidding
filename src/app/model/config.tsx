export const statusConfig = {
  1: {
    id: 1,
    code: 'open',
    description: 'เปิดประมูล',
  },
  2: {
    id: 2,
    code: 'pending',
    description: 'รอการประมูล',
  },
  3: {
    id: 3,
    code: 'bidding',
    description: 'กำลังประมูล',
  },
  4: {
    id: 4,
    code: 'endingsoon',
    description: 'ใกล้สิ้นสุด',
  },
  5: {
    id: 5,
    code: 'ended',
    description: 'สิ้นสุดประมูล',
  },
  6: {
    id: 6,
    code: 'cancelled',
    description: 'ยกเลิกประมูล',
  },
};

// Helper functions for easy access
export const getStatusById = (id: number) => {
  return statusConfig[id as keyof typeof statusConfig];
};

export const getStatusByCode = (code: string) => {
  return Object.values(statusConfig).find((status) => status.code === code);
};

export const getAllStatuses = () => {
  return Object.values(statusConfig);
};

export const getActiveStatuses = () => {
  return Object.values(statusConfig).filter((status) => status.id !== 0);
};

// Convert functions
export const getStatusDescription = (id: number): string => {
  return (
    statusConfig[id as keyof typeof statusConfig]?.description || 'ไม่ทราบสถานะ'
  );
};

export const getStatusCode = (id: number): string => {
  return statusConfig[id as keyof typeof statusConfig]?.code || 'unknown';
};

export const currencyConfig = {
  1: {
    id: 1,
    code: 'THB',
    description: 'บาท',
  },
  2: {
    id: 2,
    code: 'USD',
    description: 'ดอลลาร์',
  },
  3: {
    id: 3,
    code: 'EUR',
    description: 'ยูโร',
  },
  4: {
    id: 4,
    code: 'CNY',
    description: 'หยวน',
  },
  5: {
    id: 5,
    code: 'JPY',
    description: 'เยน',
  },
  6: {
    id: 6,
    code: 'GBP',
    description: 'ปอนด์',
  },
  7: {
    id: 7,
    code: 'AUD',
    description: 'ดอลลาร์ออสเตรเลีย',
  },
  8: {
    id: 8,
    code: 'CAD',
    description: 'ดอลลาร์แคนาดา',
  },
  9: {
    id: 9,
    code: 'SGD',
    description: 'ดอลลาร์สิงคาโปร',
  },
  10: {
    id: 10,
    code: 'HKD',
    description: 'ดอลลาร์ฮ่องกง',
  },
};
