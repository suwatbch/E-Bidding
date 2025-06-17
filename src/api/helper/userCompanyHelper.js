const { executeQuery } = require('../config/dataconfig');

// ดึงข้อมูลบริษัทของผู้ใช้ตาม user_id
async function getUserCompanies(userId) {
  const query = `
    SELECT 
      uc.id,
      uc.user_id,
      uc.company_id,
      uc.role_in_company,
      uc.is_primary,
      uc.status,
      c.name as company_name,
      c.tax_id as company_tax_id
    FROM users_company uc
    LEFT JOIN company c ON uc.company_id = c.company_id
    WHERE uc.user_id = ?
    ORDER BY uc.is_primary DESC, c.name ASC
  `;

  return await executeQuery(query, [userId]);
}

// ดึงข้อมูลผู้ใช้ในบริษัทตาม company_id
async function getCompanyUsers(companyId) {
  const query = `
    SELECT 
      uc.id,
      uc.user_id,
      uc.company_id,
      uc.role_in_company,
      uc.is_primary,
      uc.status,
      u.fullname,
      u.email,
      u.phone
    FROM users_company uc
    LEFT JOIN users u ON uc.user_id = u.user_id
    WHERE uc.company_id = ?
    ORDER BY uc.is_primary DESC, u.fullname ASC
  `;

  return await executeQuery(query, [companyId]);
}

// ดึงข้อมูลทั้งหมด
async function getAllUserCompanies() {
  const query = `
    SELECT 
      uc.id,
      uc.user_id,
      uc.company_id,
      uc.role_in_company,
      uc.is_primary,
      uc.status,
      c.name as company_name,
      c.tax_id as company_tax_id,
      u.fullname,
      u.email
    FROM users_company uc
    LEFT JOIN company c ON uc.company_id = c.company_id
    LEFT JOIN users u ON uc.user_id = u.user_id
    ORDER BY uc.user_id ASC, uc.is_primary DESC
  `;

  return await executeQuery(query, []);
}

// เพิ่มผู้ใช้เข้าบริษัท
async function addUserToCompany(userCompanyData) {
  const { user_id, company_id, role_in_company, is_primary, status } =
    userCompanyData;

  try {
    // ตรวจสอบว่าผู้ใช้กับบริษัทนี้มีอยู่แล้วหรือไม่
    const checkQuery = `
      SELECT id FROM users_company 
      WHERE user_id = ? AND company_id = ?
    `;
    const checkResult = await executeQuery(checkQuery, [user_id, company_id]);

    if (checkResult.success && checkResult.data.length > 0) {
      return {
        success: false,
        error: 'ผู้ใช้นี้เชื่อมโยงกับบริษัทนี้อยู่แล้ว',
      };
    }

    // ถ้าเป็น primary company ให้ยกเลิก primary ของบริษัทอื่นของผู้ใช้นี้
    if (is_primary) {
      const updatePrimaryQuery = `
        UPDATE users_company 
        SET is_primary = FALSE 
        WHERE user_id = ? AND is_primary = TRUE
      `;
      await executeQuery(updatePrimaryQuery, [user_id]);
    }

    const insertQuery = `
      INSERT INTO users_company (
        user_id,
        company_id,
        role_in_company,
        is_primary,
        status
      ) VALUES (?, ?, ?, ?, ?)
    `;

    return await executeQuery(insertQuery, [
      user_id,
      company_id,
      role_in_company || null,
      is_primary || false,
      status !== undefined ? status : 1,
    ]);
  } catch (error) {
    console.error('Error in addUserToCompany:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้เข้าบริษัท',
    };
  }
}

// อัปเดตข้อมูลผู้ใช้ในบริษัท
async function updateUserCompany(id, updateData) {
  const { role_in_company, is_primary, status } = updateData;

  try {
    // ดึงข้อมูลปัจจุบัน
    const getCurrentQuery = `SELECT user_id FROM users_company WHERE id = ?`;
    const currentResult = await executeQuery(getCurrentQuery, [id]);

    if (!currentResult.success || currentResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลที่ต้องการอัปเดต',
      };
    }

    const userId = currentResult.data[0].user_id;

    // ถ้าเป็น primary company ให้ยกเลิก primary ของบริษัทอื่นของผู้ใช้นี้
    if (is_primary) {
      const updatePrimaryQuery = `
        UPDATE users_company 
        SET is_primary = FALSE 
        WHERE user_id = ? AND is_primary = TRUE AND id != ?
      `;
      await executeQuery(updatePrimaryQuery, [userId, id]);
    }

    // สร้าง dynamic query
    const updateFields = [];
    const updateValues = [];

    if (role_in_company !== undefined) {
      updateFields.push('role_in_company = ?');
      updateValues.push(role_in_company);
    }
    if (is_primary !== undefined) {
      updateFields.push('is_primary = ?');
      updateValues.push(is_primary);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        error: 'ไม่มีข้อมูลที่ต้องการอัปเดต',
      };
    }

    updateValues.push(id);

    const updateQuery = `
      UPDATE users_company 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    return await executeQuery(updateQuery, updateValues);
  } catch (error) {
    console.error('Error in updateUserCompany:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
    };
  }
}

// ลบผู้ใช้ออกจากบริษัท
async function removeUserFromCompany(id) {
  try {
    // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่
    const checkQuery = `SELECT id FROM users_company WHERE id = ?`;
    const checkResult = await executeQuery(checkQuery, [id]);

    if (!checkResult.success || checkResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลที่ต้องการลบ',
      };
    }

    const deleteQuery = `DELETE FROM users_company WHERE id = ?`;
    return await executeQuery(deleteQuery, [id]);
  } catch (error) {
    console.error('Error in removeUserFromCompany:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบข้อมูล',
    };
  }
}

// ตั้งบริษัทหลักของผู้ใช้
async function setPrimaryCompany(userId, companyId) {
  try {
    // ตรวจสอบว่าผู้ใช้เชื่อมโยงกับบริษัทนี้หรือไม่
    const checkQuery = `
      SELECT id FROM users_company 
      WHERE user_id = ? AND company_id = ? AND status = 1
    `;
    const checkResult = await executeQuery(checkQuery, [userId, companyId]);

    if (!checkResult.success || checkResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบความเชื่อมโยงระหว่างผู้ใช้กับบริษัทนี้',
      };
    }

    // ยกเลิก primary ของบริษัทอื่นของผู้ใช้นี้
    const updateOthersQuery = `
      UPDATE users_company 
      SET is_primary = FALSE 
      WHERE user_id = ? AND is_primary = TRUE
    `;
    await executeQuery(updateOthersQuery, [userId]);

    // ตั้งบริษัทใหม่เป็น primary
    const setPrimaryQuery = `
      UPDATE users_company 
      SET is_primary = TRUE 
      WHERE user_id = ? AND company_id = ?
    `;
    return await executeQuery(setPrimaryQuery, [userId, companyId]);
  } catch (error) {
    console.error('Error in setPrimaryCompany:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการตั้งบริษัทหลัก',
    };
  }
}

// ดึงข้อมูลบริษัทหลักของผู้ใช้
async function getPrimaryCompany(userId) {
  const query = `
    SELECT 
      uc.id,
      uc.user_id,
      uc.company_id,
      uc.role_in_company,
      uc.is_primary,
      uc.status,
      c.name as company_name,
      c.tax_id as company_tax_id
    FROM users_company uc
    LEFT JOIN company c ON uc.company_id = c.company_id
    WHERE uc.user_id = ? AND uc.is_primary = TRUE AND uc.status = 1
  `;

  return await executeQuery(query, [userId]);
}

module.exports = {
  getUserCompanies,
  getCompanyUsers,
  getAllUserCompanies,
  addUserToCompany,
  updateUserCompany,
  removeUserFromCompany,
  setPrimaryCompany,
  getPrimaryCompany,
};
