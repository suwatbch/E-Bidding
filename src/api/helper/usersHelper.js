const { executeQuery, getConnection } = require('../config/dataconfig');
const bcrypt = require('bcryptjs');

// ดึงข้อมูลผู้ใช้งานทั้งหมด
async function getAllUsers(search = '') {
  let query = `
    SELECT 
      user_id,
      username,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      image,
      status,
      is_locked,
      login_count,
      created_dt,
      updated_dt
    FROM users 
    WHERE 1=1
  `;

  const params = [];

  if (search) {
    query += ` AND (
      fullname LIKE ? OR 
      username LIKE ? OR 
      email LIKE ? OR 
      phone LIKE ? OR
      address LIKE ?
    )`;
    const searchParam = `%${search}%`;
    params.push(
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam
    );
  }

  query += ` ORDER BY user_id ASC`;

  return await executeQuery(query, params);
}

// ดึงข้อมูลผู้ใช้งานตาม user_id
async function getUserById(userId) {
  const query = `
    SELECT 
      user_id,
      username,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      image,
      status,
      is_locked,
      login_count,
      created_dt,
      updated_dt
    FROM users 
    WHERE user_id = ?
  `;

  return await executeQuery(query, [userId]);
}

// ดึงข้อมูลผู้ใช้งานตามประเภท
async function getUsersByType(type) {
  const query = `
    SELECT 
      user_id,
      username,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      image,
      status,
      is_locked,
      login_count,
      created_dt,
      updated_dt
    FROM users 
    WHERE type = ?
    ORDER BY user_id ASC
  `;

  return await executeQuery(query, [type]);
}

// ดึงข้อมูลผู้ใช้งานตามสถานะ
async function getUsersByStatus(status) {
  const query = `
    SELECT 
      user_id,
      username,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      image,
      status,
      is_locked,
      login_count,
      created_dt,
      updated_dt
    FROM users 
    WHERE status = ?
    ORDER BY user_id ASC
  `;

  return await executeQuery(query, [status ? 1 : 0]);
}

// เพิ่มผู้ใช้งานใหม่
async function createUser(userData) {
  const {
    username,
    password,
    fullname,
    email,
    phone,
    type,
    language_code,
    tax_id,
    address,
    image,
    status,
  } = userData;

  try {
    // ตรวจสอบว่า username หรือ email ซ้ำหรือไม่
    const checkQuery = `
      SELECT user_id FROM users 
      WHERE username = ? OR email = ?
    `;
    const checkResult = await executeQuery(checkQuery, [username, email]);

    if (checkResult.success && checkResult.data.length > 0) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว',
      };
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (
        username,
        password,
        language_code,
        fullname,
        tax_id,
        address,
        email,
        phone,
        type,
        login_count,
        is_locked,
        image,
        status,
        created_dt,
        updated_dt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, FALSE, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(query, [
      username,
      hashedPassword,
      language_code || 'th',
      fullname,
      tax_id === undefined ? null : tax_id,
      address === undefined ? null : address,
      email,
      phone,
      type || 'user',
      image === undefined ? null : image,
      status !== undefined ? (status ? 1 : 0) : 1,
    ]);

    if (result.success && result.data.insertId) {
      return {
        success: true,
        data: {
          user_id: result.data.insertId,
        },
      };
    }

    return result;
  } catch (error) {
    console.error('Error in createUser:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน',
    };
  }
}

// อัปเดตข้อมูลผู้ใช้งาน
async function updateUser(userId, userData) {
  try {
    const {
      username,
      password,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      image,
      status,
      is_locked,
    } = userData;

    // ตรวจสอบว่า username หรือ email ซ้ำหรือไม่ (ยกเว้นตัวเอง)
    if (username || email) {
      const checkQuery = `
        SELECT user_id FROM users 
        WHERE (username = ? OR email = ?) AND user_id != ?
      `;
      const checkResult = await executeQuery(checkQuery, [
        username || '',
        email || '',
        userId,
      ]);

      if (checkResult.success && checkResult.data.length > 0) {
        return {
          success: false,
          error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว',
        };
      }
    }

    // สร้าง query และ parameters แบบ dynamic
    const updateFields = [];
    const params = [];

    if (username !== undefined) {
      updateFields.push('username = ?');
      params.push(username);
    }
    if (password !== undefined && password !== '') {
      updateFields.push('password = ?');
      const hashedPassword = await bcrypt.hash(password, 12);
      params.push(hashedPassword);
    }
    if (fullname !== undefined) {
      updateFields.push('fullname = ?');
      params.push(fullname);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(phone);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      params.push(type);
    }
    if (language_code !== undefined) {
      updateFields.push('language_code = ?');
      params.push(language_code);
    }
    if (tax_id !== undefined) {
      updateFields.push('tax_id = ?');
      params.push(tax_id || null);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      params.push(address || null);
    }
    if (image !== undefined) {
      updateFields.push('image = ?');
      params.push(image || null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status ? 1 : 0);
    }
    if (is_locked !== undefined) {
      updateFields.push('is_locked = ?');
      params.push(is_locked ? 1 : 0);

      if (!is_locked) {
        updateFields.push('login_count = ?');
        params.push(0);
      }
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        error: 'ไม่มีข้อมูลที่ต้องการอัปเดต',
      };
    }

    updateFields.push('updated_dt = NOW()');
    params.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE user_id = ?
    `;

    return await executeQuery(query, params);
  } catch (error) {
    console.error('Error in updateUser:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน',
    };
  }
}

// ลบผู้ใช้งาน (soft delete)
async function deleteUser(userId) {
  try {
    // ตรวจสอบว่าผู้ใช้งานมีอยู่หรือไม่
    const checkQuery = `SELECT user_id FROM users WHERE user_id = ?`;
    const checkResult = await executeQuery(checkQuery, [userId]);

    if (!checkResult.success || checkResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบผู้ใช้งานที่ระบุ',
      };
    }

    // Soft delete - เปลี่ยน status เป็น 0
    const query = `
      UPDATE users 
      SET status = 0, updated_dt = NOW()
      WHERE user_id = ?
    `;

    return await executeQuery(query, [userId]);
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน',
    };
  }
}

// ตรวจสอบว่า username มีอยู่หรือไม่
async function checkUsernameExists(username, excludeUserId = null) {
  let query = `SELECT user_id FROM users WHERE username = ?`;
  const params = [username];

  if (excludeUserId) {
    query += ` AND user_id != ?`;
    params.push(excludeUserId);
  }

  return await executeQuery(query, params);
}

// ตรวจสอบว่า email มีอยู่หรือไม่
async function checkEmailExists(email, excludeUserId = null) {
  let query = `SELECT user_id FROM users WHERE email = ?`;
  const params = [email];

  if (excludeUserId) {
    query += ` AND user_id != ?`;
    params.push(excludeUserId);
  }

  return await executeQuery(query, params);
}

// อัปเดตภาษาของผู้ใช้งาน (เฉพาะ language_code)
async function updateUserLanguage(userId, languageCode) {
  try {
    // ตรวจสอบว่าผู้ใช้งานมีอยู่หรือไม่
    const checkQuery = `SELECT user_id FROM users WHERE user_id = ?`;
    const checkResult = await executeQuery(checkQuery, [userId]);

    if (!checkResult.success || checkResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบผู้ใช้งานที่ระบุ',
      };
    }

    // อัปเดตเฉพาะ language_code
    const query = `
      UPDATE users 
      SET language_code = ?, updated_dt = NOW()
      WHERE user_id = ?
    `;

    const result = await executeQuery(query, [languageCode, userId]);

    if (result.success) {
      return {
        success: true,
        message: 'อัปเดตภาษาผู้ใช้งานสำเร็จ',
        data: {
          user_id: userId,
          language_code: languageCode,
          updated_dt: new Date(),
        },
      };
    } else {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัปเดตภาษาผู้ใช้งาน',
      };
    }
  } catch (error) {
    console.error('Error in updateUserLanguage:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตภาษาผู้ใช้งาน',
    };
  }
}

// สร้างผู้ใช้งานใหม่พร้อมบริษัท (Transaction)
async function createUserWithCompanies(userData, companies) {
  let connection;

  try {
    // สร้าง connection สำหรับ transaction
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. ตรวจสอบว่า username หรือ email ซ้ำหรือไม่
    const checkQuery = `
      SELECT user_id FROM users 
      WHERE username = ? OR email = ?
    `;
    const [checkResult] = await connection.execute(checkQuery, [
      userData.username,
      userData.email,
    ]);

    if (checkResult.length > 0) {
      await connection.rollback();
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว',
      };
    }

    // 2. เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // 3. สร้าง user ใหม่
    const {
      username,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      image,
      status,
    } = userData;

    const userQuery = `
      INSERT INTO users (
        username,
        password,
        language_code,
        fullname,
        tax_id,
        address,
        email,
        phone,
        type,
        login_count,
        is_locked,
        image,
        status,
        created_dt,
        updated_dt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, FALSE, ?, ?, NOW(), NOW())
    `;

    const [userResult] = await connection.execute(userQuery, [
      username,
      hashedPassword,
      language_code || 'th',
      fullname,
      tax_id === undefined ? null : tax_id,
      address === undefined ? null : address,
      email,
      phone,
      type || 'user',
      image === undefined ? null : image,
      status !== undefined ? (status ? 1 : 0) : 1,
    ]);

    const userId = userResult.insertId;

    // 4. เพิ่มบริษัทให้ผู้ใช้ (ถ้ามี)
    if (companies && companies.length > 0) {
      for (const company of companies) {
        const userCompanyQuery = `
          INSERT INTO users_company (
            user_id,
            company_id,
            role_in_company,
            is_primary,
            status
          )
          VALUES (?, ?, ?, ?, ?)
        `;

        await connection.execute(userCompanyQuery, [
          userId,
          company.company_id,
          company.role_in_company || '',
          company.is_primary ? 1 : 0,
          company.status || 1,
        ]);
      }
    }

    // Commit transaction
    await connection.commit();

    return {
      success: true,
      data: { user_id: userId },
      message: null,
    };
  } catch (error) {
    // Rollback transaction ถ้าเกิดข้อผิดพลาด
    if (connection) {
      await connection.rollback();
    }

    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน',
    };
  } finally {
    // ปิด connection
    if (connection) {
      await connection.release(); // ใช้ release() แทน end() สำหรับ pooled connection
    }
  }
}

// อัปเดตผู้ใช้งานพร้อมบริษัท (Smart Update Transaction)
async function updateUserWithCompanies(userId, userData, companies) {
  let connection;

  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. ตรวจสอบว่า username หรือ email ซ้ำหรือไม่ (ยกเว้นตัวเอง)
    if (userData.username || userData.email) {
      const checkQuery = `
        SELECT user_id FROM users 
        WHERE (username = ? OR email = ?) AND user_id != ?
      `;
      const [checkResult] = await connection.execute(checkQuery, [
        userData.username || '',
        userData.email || '',
        userId,
      ]);

      if (checkResult.length > 0) {
        await connection.rollback();
        return {
          success: false,
          error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว',
        };
      }
    }

    // 2. สร้าง query และ parameters แบบ dynamic สำหรับ user
    const updateFields = [];
    const params = [];

    if (userData.username !== undefined) {
      updateFields.push('username = ?');
      params.push(userData.username);
    }
    if (userData.password !== undefined && userData.password !== '') {
      updateFields.push('password = ?');
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      params.push(hashedPassword);
    }
    if (userData.fullname !== undefined) {
      updateFields.push('fullname = ?');
      params.push(userData.fullname);
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(userData.phone);
    }
    if (userData.type !== undefined) {
      updateFields.push('type = ?');
      params.push(userData.type);
    }
    if (userData.language_code !== undefined) {
      updateFields.push('language_code = ?');
      params.push(userData.language_code);
    }
    if (userData.tax_id !== undefined) {
      updateFields.push('tax_id = ?');
      params.push(userData.tax_id || null);
    }
    if (userData.address !== undefined) {
      updateFields.push('address = ?');
      params.push(userData.address || null);
    }
    if (userData.image !== undefined) {
      updateFields.push('image = ?');
      params.push(userData.image || null);
    }
    if (userData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(userData.status ? 1 : 0);
    }
    if (userData.is_locked !== undefined) {
      updateFields.push('is_locked = ?');
      params.push(userData.is_locked ? 1 : 0);

      if (!userData.is_locked) {
        updateFields.push('login_count = ?');
        params.push(0);
      }
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_dt = NOW()');
      params.push(userId);

      const userQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE user_id = ?
      `;

      await connection.execute(userQuery, params);
    }

    // 3. Smart Update: User Companies (เหมือนกับ auction participants)
    if (companies && companies.length > 0) {
      // เก็บ ID ของ user_company ที่ส่งมา (สำหรับ UPDATE)
      const userCompanyIdsToKeep = companies
        .filter((uc) => uc.id && uc.id > 0)
        .map((uc) => uc.id);

      // ลบ user_company เดิมที่ไม่อยู่ในรายการใหม่
      if (userCompanyIdsToKeep.length > 0) {
        const deleteOldUserCompaniesQuery = `
          DELETE FROM users_company 
          WHERE user_id = ? AND id NOT IN (${userCompanyIdsToKeep
            .map(() => '?')
            .join(', ')})
        `;
        await connection.execute(deleteOldUserCompaniesQuery, [
          userId,
          ...userCompanyIdsToKeep,
        ]);
      } else {
        // ถ้าไม่มี user_company เดิม ให้ลบทั้งหมด
        const deleteAllUserCompaniesQuery = `
          DELETE FROM users_company 
          WHERE user_id = ?
        `;
        await connection.execute(deleteAllUserCompaniesQuery, [userId]);
      }

      // ประมวลผล user_company แต่ละรายการ
      for (const userCompany of companies) {
        if (userCompany.id && userCompany.id > 0) {
          // UPDATE existing user_company
          const updateUserCompanyQuery = `
            UPDATE users_company 
            SET 
              company_id = ?,
              role_in_company = ?,
              is_primary = ?,
              status = ?
            WHERE id = ? AND user_id = ?
          `;

          await connection.execute(updateUserCompanyQuery, [
            userCompany.company_id,
            userCompany.role_in_company || '',
            userCompany.is_primary ? 1 : 0,
            userCompany.status || 1,
            userCompany.id,
            userId,
          ]);
        } else {
          // INSERT new user_company
          const insertUserCompanyQuery = `
            INSERT INTO users_company (
              user_id,
              company_id,
              role_in_company,
              is_primary,
              status
            )
            VALUES (?, ?, ?, ?, ?)
          `;

          await connection.execute(insertUserCompanyQuery, [
            userId,
            userCompany.company_id,
            userCompany.role_in_company || '',
            userCompany.is_primary ? 1 : 0,
            userCompany.status || 1,
          ]);
        }
      }
    } else {
      // ถ้าไม่มี companies ส่งมา ให้ลบทั้งหมด
      const deleteAllUserCompaniesQuery = `
        DELETE FROM users_company 
        WHERE user_id = ?
      `;
      await connection.execute(deleteAllUserCompaniesQuery, [userId]);
    }

    // Commit transaction
    await connection.commit();

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    // Rollback transaction ถ้าเกิดข้อผิดพลาด
    if (connection) {
      await connection.rollback();
    }

    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน',
    };
  } finally {
    // ปิด connection
    if (connection) {
      await connection.release(); // ใช้ release() แทน end() สำหรับ pooled connection
    }
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByType,
  getUsersByStatus,
  createUser,
  updateUser,
  deleteUser,
  checkUsernameExists,
  checkEmailExists,
  updateUserLanguage,
  createUserWithCompanies,
  updateUserWithCompanies,
};
