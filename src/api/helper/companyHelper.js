const { executeQuery } = require('../config/dataconfig');

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
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  return await executeQuery(query, [
    name,
    tax_id,
    address,
    email,
    phone,
    status,
  ]);
}

// อัพเดทข้อมูลบริษัท
async function updateCompany(companyId, companyData) {
  const { name, tax_id, address, email, phone, status } = companyData;

  const query = `
    UPDATE company 
    SET name = ?, tax_id = ?, address = ?, email = ?, phone = ?, status = ?, updated_dt = NOW()
    WHERE company_id = ?
  `;

  return await executeQuery(query, [
    name,
    tax_id,
    address,
    email,
    phone,
    status,
    companyId,
  ]);
}

// ลบบริษัท (soft delete)
async function deleteCompany(companyId) {
  const query = `
    UPDATE company 
    SET status = 0, updated_dt = NOW()
    WHERE company_id = ?
  `;

  return await executeQuery(query, [companyId]);
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
};
