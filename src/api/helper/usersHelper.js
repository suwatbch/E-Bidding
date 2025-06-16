const { executeQuery } = require('../config/dataconfig');
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

    return await executeQuery(query, [
      username,
      hashedPassword,
      language_code || 'th',
      fullname,
      tax_id,
      address,
      email,
      phone,
      type || 'user',
      image,
      status !== undefined ? (status ? 1 : 0) : 1,
    ]);
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
      params.push(tax_id);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      params.push(address);
    }
    if (image !== undefined) {
      updateFields.push('image = ?');
      params.push(image);
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
};
