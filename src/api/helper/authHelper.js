const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/dataconfig');

// JWT Secret (ในการใช้งานจริงควรเก็บใน environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// สร้างผู้ใช้ใหม่
async function createUser(userData) {
  const {
    username,
    password,
    language_code = 'th',
    fullname,
    tax_id,
    address,
    email,
    phone,
    type = 'user',
    image,
  } = userData;

  try {
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await getUserByUsername(username);
    if (existingUser.success && existingUser.data.length > 0) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว',
      };
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (
        username, password, language_code, fullname, tax_id, 
        address, email, phone, type, image, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const result = await executeQuery(query, [
      username,
      hashedPassword,
      language_code,
      fullname,
      tax_id,
      address,
      email,
      phone,
      type,
      image,
    ]);

    if (result.success) {
      return {
        success: true,
        data: { user_id: result.data.insertId },
        message: 'สร้างผู้ใช้สำเร็จ',
      };
    }

    return result;
  } catch (error) {
    console.error('Error in createUser:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// เข้าสู่ระบบ
async function loginUser(username, password) {
  try {
    // ดึงข้อมูลผู้ใช้
    const userResult = await getUserByUsername(username);

    if (!userResult.success || userResult.data.length === 0) {
      // เพิ่ม login count สำหรับ username ที่ไม่พบ (ป้องกัน user enumeration)
      await incrementLoginCount(username);
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    const user = userResult.data[0];

    // ตรวจสอบสถานะผู้ใช้
    if (user.status !== 1) {
      return {
        success: false,
        error: 'บัญชีผู้ใช้ถูกปิดใช้งาน',
      };
    }

    // ตรวจสอบว่าบัญชีถูกล็อคหรือไม่
    if (user.is_locked) {
      return {
        success: false,
        error:
          'บัญชีผู้ใช้ถูกล็อคเนื่องจากพยายาม login ผิดเกิน 5 ครั้ง กรุณาติดต่อผู้ดูแลระบบ',
      };
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // รหัสผ่านผิด - เพิ่ม login count
      const incrementResult = await incrementLoginCount(username);

      let errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';

      if (incrementResult.success && incrementResult.data) {
        const { is_locked, attempts_remaining } = incrementResult.data;

        if (is_locked) {
          errorMessage =
            'บัญชีผู้ใช้ถูกล็อคเนื่องจากพยายาม login ผิดเกิน 5 ครั้ง กรุณาติดต่อผู้ดูแลระบบ';
        } else if (attempts_remaining > 0) {
          errorMessage = `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (เหลือ ${attempts_remaining} ครั้ง)`;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // รหัสผ่านถูกต้อง - รีเซ็ต login count และปลดล็อค
    await resetLoginCount(username);

    // สร้าง JWT Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        type: user.type,
        language_code: user.language_code,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // ลบรหัสผ่านออกจากข้อมูลที่ส่งกลับ
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'เข้าสู่ระบบสำเร็จ',
    };
  } catch (error) {
    console.error('Error in loginUser:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ดึงข้อมูลผู้ใช้ตาม username
async function getUserByUsername(username) {
  const query = `
    SELECT 
      user_id, username, password, language_code, fullname, 
      tax_id, address, email, phone, type, login_count, 
      is_locked, image, status, created_dt, updated_dt
    FROM users 
    WHERE username = ?
  `;

  return await executeQuery(query, [username]);
}

// ดึงข้อมูลผู้ใช้ตาม user_id
async function getUserById(userId) {
  const query = `
    SELECT 
      user_id, username, language_code, fullname, 
      tax_id, address, email, phone, type, login_count, 
      is_locked, image, status, created_dt, updated_dt
    FROM users 
    WHERE user_id = ? AND status = 1
  `;

  return await executeQuery(query, [userId]);
}

// ดึงข้อมูลผู้ใช้ทั้งหมด
async function getAllUsers(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      user_id, username, language_code, fullname, 
      tax_id, address, email, phone, type, login_count, 
      is_locked, image, status, created_dt, updated_dt
    FROM users 
    WHERE status = 1
    ORDER BY created_dt DESC
    LIMIT ? OFFSET ?
  `;

  return await executeQuery(query, [limit, offset]);
}

// อัปเดตจำนวนการเข้าสู่ระบบ (เมื่อ login ผิด)
async function incrementLoginCount(username) {
  try {
    // ดึงข้อมูล login_count ปัจจุบัน
    const userQuery = `
      SELECT user_id, login_count, is_locked 
      FROM users 
      WHERE username = ? AND status = 1
    `;

    const userResult = await executeQuery(userQuery, [username]);

    if (!userResult.success || userResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้',
      };
    }

    const user = userResult.data[0];
    const newLoginCount = user.login_count + 1;
    const shouldLock = newLoginCount >= 5;

    // อัปเดต login_count และ is_locked
    const updateQuery = `
      UPDATE users 
      SET login_count = ?, 
          is_locked = ?, 
          updated_dt = CURRENT_TIMESTAMP
      WHERE username = ?
    `;

    const result = await executeQuery(updateQuery, [
      newLoginCount,
      shouldLock,
      username,
    ]);

    return {
      ...result,
      data: {
        login_count: newLoginCount,
        is_locked: shouldLock,
        attempts_remaining: shouldLock ? 0 : 5 - newLoginCount,
      },
    };
  } catch (error) {
    console.error('Error in incrementLoginCount:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// รีเซ็ต login count (เมื่อ login สำเร็จ)
async function resetLoginCount(username) {
  const query = `
    UPDATE users 
    SET login_count = 0, 
        is_locked = false, 
        updated_dt = CURRENT_TIMESTAMP
    WHERE username = ?
  `;

  return await executeQuery(query, [username]);
}

// Legacy function - เก็บไว้เพื่อ backward compatibility
async function updateLoginCount(userId) {
  const query = `
    UPDATE users 
    SET login_count = login_count + 1, updated_dt = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  return await executeQuery(query, [userId]);
}

// อัปเดตข้อมูลผู้ใช้
async function updateUser(userId, userData) {
  const { language_code, fullname, tax_id, address, email, phone, image } =
    userData;

  const query = `
    UPDATE users 
    SET language_code = ?, fullname = ?, tax_id = ?, 
        address = ?, email = ?, phone = ?, image = ?,
        updated_dt = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  return await executeQuery(query, [
    language_code,
    fullname,
    tax_id,
    address,
    email,
    phone,
    image,
    userId,
  ]);
}

// เปลี่ยนรหัสผ่าน
async function changePassword(userId, oldPassword, newPassword) {
  try {
    // ดึงข้อมูลผู้ใช้
    const userResult = await getUserById(userId);

    if (!userResult.success || userResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้',
      };
    }

    // ดึงรหัสผ่านเดิม
    const passwordQuery = 'SELECT password FROM users WHERE user_id = ?';
    const passwordResult = await executeQuery(passwordQuery, [userId]);

    if (!passwordResult.success) {
      return passwordResult;
    }

    const currentPassword = passwordResult.data[0].password;

    // ตรวจสอบรหัสผ่านเดิม
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      currentPassword
    );

    if (!isOldPasswordValid) {
      return {
        success: false,
        error: 'รหัสผ่านเดิมไม่ถูกต้อง',
      };
    }

    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateQuery = `
      UPDATE users 
      SET password = ?, updated_dt = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    return await executeQuery(updateQuery, [hashedNewPassword, userId]);
  } catch (error) {
    console.error('Error in changePassword:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ล็อค/ปลดล็อคผู้ใช้
async function toggleUserLock(userId, isLocked) {
  const query = `
    UPDATE users 
    SET is_locked = ?, updated_dt = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  return await executeQuery(query, [isLocked, userId]);
}

// ลบผู้ใช้ (soft delete)
async function deleteUser(userId) {
  const query = `
    UPDATE users 
    SET status = 0, updated_dt = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  return await executeQuery(query, [userId]);
}

// ตรวจสอบ JWT Token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Token ไม่ถูกต้องหรือหมดอายุ',
    };
  }
}

// Middleware สำหรับตรวจสอบ Authentication
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ Access Token',
    });
  }

  const tokenResult = verifyToken(token);

  if (!tokenResult.success) {
    return res.status(403).json({
      success: false,
      message: tokenResult.error,
    });
  }

  // ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบ
  const userResult = await getUserById(tokenResult.data.user_id);

  if (!userResult.success || userResult.data.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'ไม่พบข้อมูลผู้ใช้',
    });
  }

  req.user = tokenResult.data;
  next();
}

module.exports = {
  createUser,
  loginUser,
  getUserByUsername,
  getUserById,
  getAllUsers,
  incrementLoginCount,
  resetLoginCount,
  updateLoginCount,
  updateUser,
  changePassword,
  toggleUserLock,
  deleteUser,
  verifyToken,
  authenticateToken,
};
