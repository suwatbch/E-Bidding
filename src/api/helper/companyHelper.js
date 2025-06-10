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
    ORDER BY name ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลบริษัทแบบ pagination
async function getCompaniesPaginated(page = 1, limit = 10, search = '') {
  const offset = (page - 1) * limit;

  let whereClause = '';
  let countWhereClause = '';
  let queryParams = [];
  let countParams = [];

  if (search && search.trim()) {
    whereClause =
      'WHERE (name LIKE ? OR address LIKE ? OR email LIKE ? OR phone LIKE ?)';
    countWhereClause = whereClause;
    const searchPattern = `%${search.trim()}%`;
    queryParams = [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      limit,
      offset,
    ];
    countParams = [searchPattern, searchPattern, searchPattern, searchPattern];
  } else {
    queryParams = [limit, offset];
  }

  // Query สำหรับดึงข้อมูล
  const dataQuery = `
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
    ${whereClause}
    ORDER BY name ASC
    LIMIT ? OFFSET ?
  `;

  // Query สำหรับนับจำนวนทั้งหมด
  const countQuery = `
    SELECT COUNT(*) as total
    FROM company 
    ${countWhereClause}
  `;

  try {
    // Execute both queries
    const [dataResult, countResult] = await Promise.all([
      executeQuery(dataQuery, queryParams),
      executeQuery(countQuery, countParams),
    ]);

    if (dataResult.success && countResult.success) {
      const total = countResult.data[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: dataResult.data,
        pagination: {
          currentPage: page,
          perPage: limit,
          total: total,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } else {
      return {
        success: false,
        error: dataResult.error || countResult.error,
        data: [],
        pagination: null,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: null,
    };
  }
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
    ORDER BY name ASC
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
    ORDER BY name ASC
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
  getCompaniesPaginated,
  getCompanyById,
  getActiveCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  searchCompanies,
};
