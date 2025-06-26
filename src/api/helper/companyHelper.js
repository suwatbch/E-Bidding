const { executeQuery } = require('../config/dataconfig');
const {
  formatDateTimeForMySQL,
  getCurrentDateTimeForMySQL,
} = require('../globalFunction');

// ดึงข้อมูลบริษัททั้งหมด
async function getAllCompanies() {
  const query = `
    SELECT 
      company_id as id,
      name,
      tax_id,
      address,
      email,
      phone,
      status,
      created_dt,
      updated_dt
    FROM company 
    ORDER BY company_id ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลบริษัทตาม ID
async function getCompanyById(companyId) {
  const query = `
    SELECT 
      company_id as id,
      name,
      tax_id,
      address,
      email,
      phone,
      status,
      created_dt,
      updated_dt
    FROM company 
    WHERE company_id = ?
  `;

  return await executeQuery(query, [companyId]);
}

// ดึงข้อมูลบริษัทที่เปิดใช้งานเท่านั้น
async function getActiveCompanies() {
  const query = `
    SELECT 
      company_id as id,
      name,
      tax_id,
      address,
      email,
      phone,
      status,
      created_dt,
      updated_dt
    FROM company 
    WHERE status = 1
    ORDER BY company_id ASC
  `;

  return await executeQuery(query);
}

// สร้างบริษัทใหม่
async function createCompany(companyData) {
  const { name, tax_id, address, email, phone, status = 1 } = companyData;

  const query = `
    INSERT INTO company (name, tax_id, address, email, phone, status, created_dt, updated_dt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const currentDateTime = getCurrentDateTimeForMySQL();
  return await executeQuery(query, [
    name,
    tax_id,
    address,
    email,
    phone,
    status,
    currentDateTime,
    currentDateTime,
  ]);
}

// อัพเดทข้อมูลบริษัท
async function updateCompany(companyId, companyData) {
  const { name, tax_id, address, email, phone, status } = companyData;

  // ถ้ามีการปิดใช้งานบริษัท (status = 0) ให้ตรวจสอบ users_company ก่อน
  if (status === 0) {
    const checkResult = await checkCompanyHasUsers(companyId);

    if (!checkResult.success) {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้งาน',
      };
    }

    const userCount = checkResult.data[0].user_count;
    if (userCount > 0) {
      return {
        success: false,
        error: `ไม่สามารถปิดใช้งานบริษัทนี้ได้ เนื่องจากมีผู้ใช้งานที่เชื่อมโยงอยู่`,
      };
    }
  }

  const query = `
    UPDATE company 
    SET name = ?, tax_id = ?, address = ?, email = ?, phone = ?, status = ?, updated_dt = ?
    WHERE company_id = ?
  `;

  return await executeQuery(query, [
    name,
    tax_id,
    address,
    email,
    phone,
    status,
    getCurrentDateTimeForMySQL(),
    companyId,
  ]);
}

// ตรวจสอบว่าบริษัทมีผู้ใช้งานหรือไม่
async function checkCompanyHasUsers(companyId) {
  const query = `
    SELECT COUNT(*) as user_count
    FROM users_company 
    WHERE company_id = ? AND status = 1
  `;

  return await executeQuery(query, [companyId]);
}

// ลบบริษัท (soft delete)
async function deleteCompany(companyId) {
  try {
    // เช็คก่อนว่าบริษัทมีผู้ใช้งานหรือไม่
    const checkResult = await checkCompanyHasUsers(companyId);

    if (!checkResult.success) {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้งาน',
      };
    }

    const userCount = checkResult.data[0].user_count;

    if (userCount > 0) {
      return {
        success: false,
        error: 'ไม่สามารถลบบริษัทได้ เนื่องจากมีผู้ใช้งานที่เชื่อมโยงอยู่',
      };
    }

    // ถ้าไม่มีผู้ใช้งาน ให้ทำการลบ (soft delete)
    const query = `
      UPDATE company 
      SET status = 0, updated_dt = ?
      WHERE company_id = ?
    `;

    return await executeQuery(query, [getCurrentDateTimeForMySQL(), companyId]);
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ค้นหาบริษัท
async function searchCompanies(searchTerm) {
  const query = `
    SELECT 
      company_id as id,
      name,
      tax_id,
      address,
      email,
      phone,
      status,
      created_dt,
      updated_dt
    FROM company 
    WHERE (name LIKE ? OR address LIKE ? OR email LIKE ? OR phone LIKE ?)
    ORDER BY company_id ASC
  `;

  const searchPattern = `%${searchTerm}%`;
  return await executeQuery(query, [
    searchPattern,
    searchPattern,
    searchPattern,
    searchPattern,
  ]);
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  getActiveCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  searchCompanies,
  checkCompanyHasUsers,
};
