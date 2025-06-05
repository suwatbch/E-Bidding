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
