// ข้อมูลการเชื่อมโยงผู้ใช้กับบริษัท (อัปเดตตามโครงสร้างฐานข้อมูลใหม่)
export interface UserCompany {
  id: number; // Primary Key
  user_id: number; // FK → User
  company_id: number; // FK → Company
  role_in_company: string | null; // ตำแหน่ง/บทบาทในบริษัทนั้น
  is_primary: boolean; // บริษัทหลักหรือไม่
  status: number; // 1 = active, 0 = inactive
}

export const dataUser_Company: UserCompany[] = [
  // บริษัท ปตท. (company_id: 1)
  {
    id: 1,
    user_id: 1, // admin
    company_id: 1,
    role_in_company: 'Chief Executive Officer',
    is_primary: true,
    status: 1,
  },
  {
    id: 2,
    user_id: 4, // natthaporn
    company_id: 1,
    role_in_company: 'Procurement Manager',
    is_primary: true,
    status: 1,
  },
  {
    id: 3,
    user_id: 10, // supachai
    company_id: 1,
    role_in_company: 'Senior Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท ซีพี ออลล์ (company_id: 2)
  {
    id: 4,
    user_id: 2, // user2
    company_id: 2,
    role_in_company: 'Purchasing Director',
    is_primary: true,
    status: 1,
  },
  {
    id: 5,
    user_id: 6, // pranee
    company_id: 2,
    role_in_company: 'Procurement Specialist',
    is_primary: true,
    status: 1,
  },
  {
    id: 6,
    user_id: 12,
    company_id: 2,
    role_in_company: 'Supply Chain Manager',
    is_primary: false,
    status: 1,
  },

  // ธนาคารไทยพาณิชย์ (company_id: 3)
  {
    id: 7,
    user_id: 5, // robert_th
    company_id: 3,
    role_in_company: 'Head of Procurement',
    is_primary: true,
    status: 1,
  },
  {
    id: 8,
    user_id: 14,
    company_id: 3,
    role_in_company: 'Senior Buyer',
    is_primary: true,
    status: 1,
  },

  // บริษัท ปูนซิเมนต์ไทย (company_id: 4)
  {
    id: 9,
    user_id: 7, // emma_th
    company_id: 4,
    role_in_company: 'Procurement Officer',
    is_primary: true,
    status: 1,
  },
  {
    id: 10,
    user_id: 16,
    company_id: 4,
    role_in_company: 'Contract Manager',
    is_primary: true,
    status: 1,
  },
  {
    id: 11,
    user_id: 24,
    company_id: 4,
    role_in_company: 'Bidding Coordinator',
    is_primary: false,
    status: 1,
  },

  // บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส (company_id: 5)
  {
    id: 12,
    user_id: 8, // siriwan
    company_id: 5,
    role_in_company: 'Procurement Manager',
    is_primary: true,
    status: 1,
  },
  {
    id: 13,
    user_id: 18,
    company_id: 5,
    role_in_company: 'Technical Buyer',
    is_primary: true,
    status: 1,
  },

  // บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น (company_id: 6)
  {
    id: 14,
    user_id: 9, // william_th
    company_id: 6,
    role_in_company: 'VP Procurement',
    is_primary: true,
    status: 1,
  },
  {
    id: 15,
    user_id: 20,
    company_id: 6,
    role_in_company: 'Category Manager',
    is_primary: true,
    status: 1,
  },
  {
    id: 16,
    user_id: 28,
    company_id: 6,
    role_in_company: 'Supplier Relations Manager',
    is_primary: false,
    status: 1,
  },

  // บริษัท ไทยเบฟเวอเรจ (company_id: 7)
  {
    id: 17,
    user_id: 11,
    company_id: 7,
    role_in_company: 'Chief Procurement Officer',
    is_primary: true,
    status: 1,
  },
  {
    id: 18,
    user_id: 22,
    company_id: 7,
    role_in_company: 'Strategic Sourcing Manager',
    is_primary: true,
    status: 1,
  },

  // บริษัท ทรู คอร์ปอเรชั่น (company_id: 8)
  {
    id: 19,
    user_id: 13,
    company_id: 8,
    role_in_company: 'Head of Sourcing',
    is_primary: true,
    status: 1,
  },
  {
    id: 20,
    user_id: 26,
    company_id: 8,
    role_in_company: 'Procurement Analyst',
    is_primary: true,
    status: 1,
  },
  {
    id: 21,
    user_id: 34,
    company_id: 8,
    role_in_company: 'Vendor Manager',
    is_primary: false,
    status: 1,
  },

  // บริษัท เจริญโภคภัณฑ์อาหาร (company_id: 9)
  {
    id: 22,
    user_id: 15,
    company_id: 9,
    role_in_company: 'Global Procurement Director',
    is_primary: true,
    status: 1,
  },
  {
    id: 23,
    user_id: 30,
    company_id: 9,
    role_in_company: 'Raw Material Buyer',
    is_primary: true,
    status: 1,
  },
  {
    id: 24,
    user_id: 3,
    company_id: 9,
    role_in_company: 'Cost Analysis Specialist',
    is_primary: false,
    status: 1,
  },

  // บริษัท บ้านปู (company_id: 10)
  {
    id: 25,
    user_id: 17,
    company_id: 10,
    role_in_company: 'Procurement Executive',
    is_primary: true,
    status: 1,
  },
  {
    id: 26,
    user_id: 32,
    company_id: 10,
    role_in_company: 'Contract Specialist',
    is_primary: true,
    status: 1,
  },

  // บริษัท เบอร์ลี่ ยุคเกอร์ (company_id: 11)
  {
    id: 27,
    user_id: 19,
    company_id: 11,
    role_in_company: 'Supply Chain Director',
    is_primary: true,
    status: 1,
  },
  {
    id: 28,
    user_id: 33,
    company_id: 11,
    role_in_company: 'Purchasing Agent',
    is_primary: true,
    status: 1,
  },

  // บริษัท ไมเนอร์ อินเตอร์เนชั่นแนล (company_id: 12)
  {
    id: 29,
    user_id: 21,
    company_id: 12,
    role_in_company: 'Regional Procurement Manager',
    is_primary: true,
    status: 1,
  },
  {
    id: 30,
    user_id: 31,
    company_id: 12,
    role_in_company: 'Food & Beverage Buyer',
    is_primary: true,
    status: 1,
  },

  // บริษัท กรุงเทพดุสิตเวชการ (company_id: 13)
  {
    id: 31,
    user_id: 23,
    company_id: 13,
    role_in_company: 'Medical Equipment Procurement Manager',
    is_primary: true,
    status: 1,
  },
  {
    id: 32,
    user_id: 25,
    company_id: 13,
    role_in_company: 'Healthcare Sourcing Specialist',
    is_primary: true,
    status: 1,
  },

  // บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น (company_id: 14)
  {
    id: 33,
    user_id: 27,
    company_id: 14,
    role_in_company: 'Telecom Procurement Head',
    is_primary: true,
    status: 1,
  },
  {
    id: 34,
    user_id: 29,
    company_id: 14,
    role_in_company: 'Network Equipment Buyer',
    is_primary: true,
    status: 1,
  },

  // บริษัท 15
  {
    id: 35,
    user_id: 1, // admin
    company_id: 15,
    role_in_company: 'General Manager',
    is_primary: false,
    status: 1,
  },

  // บริษัท ไทยยูเนี่ยน กรุ๊ป (company_id: 16)
  {
    id: 36,
    user_id: 2,
    company_id: 16,
    role_in_company: 'Seafood Procurement Director',
    is_primary: false,
    status: 1,
  },

  // บริษัท 17
  {
    id: 37,
    user_id: 4,
    company_id: 17,
    role_in_company: 'Office Supplies Manager',
    is_primary: false,
    status: 1,
  },

  // บริษัท 18
  {
    id: 38,
    user_id: 5,
    company_id: 18,
    role_in_company: 'IT Procurement Specialist',
    is_primary: false,
    status: 1,
  },

  // Multi-company users (ผู้ใช้ที่ทำงานให้หลายบริษัท)
  {
    id: 39,
    user_id: 1, // admin ที่ดูแลหลายบริษัท
    company_id: 2,
    role_in_company: 'Consultant',
    is_primary: false,
    status: 1,
  },
  {
    id: 40,
    user_id: 4, // natthaporn ที่ทำงานให้หลายบริษัท
    company_id: 3,
    role_in_company: 'External Procurement Advisor',
    is_primary: false,
    status: 1,
  },
  {
    id: 41,
    user_id: 10, // supachai ที่เป็น freelance
    company_id: 7,
    role_in_company: 'Independent Bidding Specialist',
    is_primary: false,
    status: 1,
  },

  // บางรายการที่ไม่ active
  {
    id: 42,
    user_id: 6,
    company_id: 1,
    role_in_company: 'Former Procurement Officer',
    is_primary: false,
    status: 0, // ไม่ active
  },
  {
    id: 43,
    user_id: 8,
    company_id: 5,
    role_in_company: 'Interim Buyer',
    is_primary: false,
    status: 0, // ไม่ active
  },
];

// ฟังก์ชันช่วยในการหาบริษัทหลักจาก user_id
export const getPrimaryCompanyByUserId = (userId: number): number | null => {
  const userCompany = dataUser_Company.find(
    (uc) => uc.user_id === userId && uc.is_primary && uc.status === 1
  );
  return userCompany ? userCompany.company_id : null;
};

// ฟังก์ชันช่วยในการหาบริษัททั้งหมดจาก user_id (รวมบริษัทรอง)
export const getAllCompaniesByUserId = (userId: number): UserCompany[] => {
  return dataUser_Company.filter(
    (uc) => uc.user_id === userId && uc.status === 1
  );
};

// ฟังก์ชันช่วยในการหาบริษัทจาก user_id (เพื่อความเข้ากันได้กับโค้ดเดิม)
export const getCompanyByUserId = (userId: number): number | null => {
  return getPrimaryCompanyByUserId(userId);
};

// ฟังก์ชันช่วยในการหาผู้ใช้ทั้งหมดในบริษัท
export const getUsersByCompanyId = (companyId: number): UserCompany[] => {
  return dataUser_Company.filter(
    (uc) => uc.company_id === companyId && uc.status === 1
  );
};

// ฟังก์ชันช่วยในการตรวจสอบบทบาทผู้ใช้ในบริษัทหลัก
export const getUserRole = (userId: number): string | null => {
  const userCompany = dataUser_Company.find(
    (uc) => uc.user_id === userId && uc.is_primary && uc.status === 1
  );
  return userCompany ? userCompany.role_in_company : null;
};

// ฟังก์ชันช่วยในการตรวจสอบบทบาทผู้ใช้ในบริษัทเฉพาะ
export const getUserRoleInCompany = (
  userId: number,
  companyId: number
): string | null => {
  const userCompany = dataUser_Company.find(
    (uc) =>
      uc.user_id === userId && uc.company_id === companyId && uc.status === 1
  );
  return userCompany ? userCompany.role_in_company : null;
};

// ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้สามารถเสนอราคาได้หรือไม่
export const canUserBid = (userId: number): boolean => {
  const userCompany = dataUser_Company.find(
    (uc) => uc.user_id === userId && uc.is_primary && uc.status === 1
  );
  if (!userCompany || !userCompany.role_in_company) return false;

  const role = userCompany.role_in_company.toLowerCase();
  return ['bidder', 'admin'].includes(role);
};

// ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้สามารถเสนอราคาในบริษัทเฉพาะได้หรือไม่
export const canUserBidInCompany = (
  userId: number,
  companyId: number
): boolean => {
  const userCompany = dataUser_Company.find(
    (uc) =>
      uc.user_id === userId && uc.company_id === companyId && uc.status === 1
  );
  if (!userCompany || !userCompany.role_in_company) return false;

  const role = userCompany.role_in_company.toLowerCase();
  return ['bidder', 'admin'].includes(role);
};

// ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้เป็น Admin ในบริษัทหลักหรือไม่
export const isUserAdmin = (userId: number): boolean => {
  const userCompany = dataUser_Company.find(
    (uc) => uc.user_id === userId && uc.is_primary && uc.status === 1
  );
  if (!userCompany || !userCompany.role_in_company) return false;

  return userCompany.role_in_company.toLowerCase() === 'admin';
};

// ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้เป็น Admin ในบริษัทเฉพาะหรือไม่
export const isUserAdminInCompany = (
  userId: number,
  companyId: number
): boolean => {
  const userCompany = dataUser_Company.find(
    (uc) =>
      uc.user_id === userId && uc.company_id === companyId && uc.status === 1
  );
  if (!userCompany || !userCompany.role_in_company) return false;

  return userCompany.role_in_company.toLowerCase() === 'admin';
};

// ฟังก์ชันช่วยในการดึงข้อมูลความสัมพันธ์ User-Company ทั้งหมดของผู้ใช้
export const getUserCompanyRelations = (userId: number): UserCompany[] => {
  return dataUser_Company.filter((uc) => uc.user_id === userId);
};

// ฟังก์ชันช่วยในการตรวจสอบว่าผู้ใช้มีความสัมพันธ์กับบริษัทหรือไม่
export const hasUserCompanyRelation = (
  userId: number,
  companyId: number
): boolean => {
  return dataUser_Company.some(
    (uc) =>
      uc.user_id === userId && uc.company_id === companyId && uc.status === 1
  );
};

// ฟังก์ชันสำหรับการแปลงบทบาทเป็นภาษาไทย
export const getRoleDisplayName = (role: string | null): string => {
  if (!role) return 'ไม่ระบุ';

  switch (role.toLowerCase()) {
    case 'admin':
      return 'ผู้ดูแลระบบ';
    case 'bidder':
      return 'ผู้เสนอราคา';
    case 'viewer':
      return 'ผู้ดู';
    case 'consultant':
      return 'ที่ปรึกษา';
    case 'advisor':
      return 'ผู้แนะนำ';
    case 'partner':
      return 'หุ้นส่วน';
    default:
      return role;
  }
};
