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
    user_id: 101,
    company_id: 1,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },
  {
    id: 2,
    user_id: 112,
    company_id: 1,
    role_in_company: 'Admin',
    is_primary: true,
    status: 1,
  },

  // บริษัท ซีพี ออลล์ (company_id: 2)
  {
    id: 3,
    user_id: 102,
    company_id: 2,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },
  {
    id: 4,
    user_id: 104,
    company_id: 2,
    role_in_company: 'Viewer',
    is_primary: false,
    status: 1,
  },

  // บริษัท เจริญโภคภัณฑ์อาหาร (company_id: 9)
  {
    id: 5,
    user_id: 103,
    company_id: 9,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },
  {
    id: 6,
    user_id: 113,
    company_id: 9,
    role_in_company: 'Admin',
    is_primary: true,
    status: 1,
  },

  // บริษัท ทรู คอร์ปอเรชั่น (company_id: 8)
  {
    id: 7,
    user_id: 109,
    company_id: 8,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท ไทยยูเนี่ยน ฟีดมิลล์ (company_id: 39)
  {
    id: 8,
    user_id: 105,
    company_id: 39,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท ไทยยูเนี่ยน กรุ๊ป (company_id: 16)
  {
    id: 9,
    user_id: 106,
    company_id: 16,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท เซ็นทรัลพัฒนา (company_id: 32)
  {
    id: 10,
    user_id: 107,
    company_id: 32,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },
  {
    id: 11,
    user_id: 117,
    company_id: 32,
    role_in_company: 'Admin',
    is_primary: true,
    status: 1,
  },

  // บริษัท แสนสิริ (company_id: 55)
  {
    id: 12,
    user_id: 108,
    company_id: 55,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },
  {
    id: 13,
    user_id: 118,
    company_id: 55,
    role_in_company: 'Admin',
    is_primary: true,
    status: 1,
  },

  // บริษัท อินทัช โฮลดิ้งส์ (company_id: 25)
  {
    id: 14,
    user_id: 110,
    company_id: 25,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท ซีเอ็ดยูเคชั่น (company_id: 66)
  {
    id: 15,
    user_id: 111,
    company_id: 66,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท ทิปโก้ฟูดส์ (company_id: 34)
  {
    id: 16,
    user_id: 114,
    company_id: 34,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },
  {
    id: 17,
    user_id: 115,
    company_id: 34,
    role_in_company: 'Admin',
    is_primary: true,
    status: 1,
  },

  // บริษัท โออิชิ กรุ๊ป (company_id: 35)
  {
    id: 18,
    user_id: 116,
    company_id: 35,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // บริษัท เอพี (ไทยแลนด์) (company_id: 54)
  {
    id: 19,
    user_id: 119,
    company_id: 54,
    role_in_company: 'Bidder',
    is_primary: true,
    status: 1,
  },

  // ตัวอย่างผู้ใช้ที่มีหลายบริษัท
  {
    id: 20,
    user_id: 101,
    company_id: 2,
    role_in_company: 'Consultant',
    is_primary: false,
    status: 1,
  },
  {
    id: 21,
    user_id: 102,
    company_id: 9,
    role_in_company: 'Advisor',
    is_primary: false,
    status: 1,
  },
  {
    id: 22,
    user_id: 105,
    company_id: 16,
    role_in_company: 'Partner',
    is_primary: false,
    status: 0, // inactive
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
