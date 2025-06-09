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
async function loginUser(username, password, remember_me = false) {
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

    // กำหนดระยะเวลาหมดอายุของ token ตาม remember_me
    const expiresIn = remember_me ? '30d' : '1d';

    // สร้าง JWT Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        type: user.type,
        language_code: user.language_code,
      },
      JWT_SECRET,
      { expiresIn }
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

// ดึงข้อมูลผู้ใช้ที่ถูกล็อค
async function getLockedUsers() {
  const query = `
    SELECT 
      user_id, username, fullname, login_count, 
      is_locked, updated_dt
    FROM users 
    WHERE is_locked = true AND status = 1
    ORDER BY updated_dt DESC
  `;

  return await executeQuery(query);
}

// ฟังก์ชันสำหรับการร้องขอ OTP
async function requestOtp(username) {
  try {
    // ค้นหา user_id จาก username
    const findUserQuery = `
      SELECT user_id, username, phone 
      FROM users 
      WHERE username = ? AND status = 1
    `;
    const userResult = await executeQuery(findUserQuery, [username]);

    if (!userResult.success || userResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบชื่อผู้ใช้ในระบบ',
      };
    }

    const user = userResult.data[0];

    // สร้างรหัส OTP 6 หลักแบบสุ่ม
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // กำหนดเวลาเริ่มต้นและสิ้นสุด (5 นาที)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 5 * 60 * 1000); // เพิ่ม 5 นาที

    // ตรวจสอบ OTP ที่มีอยู่แล้วของ user นี้
    const checkExistingOtpQuery = `
      SELECT id FROM otp 
      WHERE user_id = ?
    `;
    const existingOtpResult = await executeQuery(checkExistingOtpQuery, [
      user.user_id,
    ]);

    let insertResult;

    if (!existingOtpResult.success) {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP',
      };
    }

    if (existingOtpResult.data.length > 1) {
      // ถ้ามี OTP มากกว่า 1 แถว → ลบทั้งหมดแล้วสร้างใหม่
      const deleteOldOtpQuery = `
        DELETE FROM otp 
        WHERE user_id = ?
      `;
      await executeQuery(deleteOldOtpQuery, [user.user_id]);

      // สร้าง OTP ใหม่
      const insertOtpQuery = `
        INSERT INTO otp (otp, user_id, username, start_time, end_time, is_used)
        VALUES (?, ?, ?, ?, ?, FALSE)
      `;
      insertResult = await executeQuery(insertOtpQuery, [
        otp,
        user.user_id,
        user.username,
        startTime,
        endTime,
      ]);
    } else if (existingOtpResult.data.length === 1) {
      // ถ้ามี OTP เพียง 1 แถว → อัปเดตแถวเดิม
      const updateOtpQuery = `
        UPDATE otp 
        SET otp = ?, start_time = ?, end_time = ?, is_used = FALSE
        WHERE user_id = ?
      `;
      insertResult = await executeQuery(updateOtpQuery, [
        otp,
        startTime,
        endTime,
        user.user_id,
      ]);
    } else {
      // ถ้าไม่มี OTP เลย → สร้างใหม่
      const insertOtpQuery = `
        INSERT INTO otp (otp, user_id, username, start_time, end_time, is_used)
        VALUES (?, ?, ?, ?, ?, FALSE)
      `;
      insertResult = await executeQuery(insertOtpQuery, [
        otp,
        user.user_id,
        user.username,
        startTime,
        endTime,
      ]);
    }

    if (insertResult.success) {
      return {
        success: true,
        message: 'ส่งรหัส OTP สำเร็จ',
        data: {
          message: 'รหัส OTP ถูกส่งไปยังเบอร์โทรศัพท์ที่ลงทะเบียน',
          expires_in: '5 นาที',
        },
      };
    } else {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการสร้างรหัส OTP',
      };
    }
  } catch (error) {
    console.error('Error in requestOtp:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ฟังก์ชันสำหรับการรีเซ็ตรหัสผ่าน
async function resetPassword(username, otp, newPassword) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !otp || !newPassword) {
      return {
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      };
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      };
    }

    // ค้นหา user_id จาก username
    const userResult = await executeQuery(
      'SELECT user_id FROM users WHERE username = ? AND status = 1',
      [username]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return {
        success: false,
        error: 'ไม่พบผู้ใช้งานนี้ในระบบ',
      };
    }

    const userId = userResult.data[0].user_id;

    // ตรวจสอบ OTP
    const otpResult = await executeQuery(
      'SELECT * FROM otp WHERE user_id = ? AND otp = ? AND is_used = FALSE AND end_time > NOW()',
      [userId, otp]
    );

    if (!otpResult.success || otpResult.data.length === 0) {
      return {
        success: false,
        error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว',
      };
    }

    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // อัปเดตรหัสผ่าน
    const updateResult = await executeQuery(
      'UPDATE users SET password = ?, updated_dt = NOW() WHERE user_id = ?',
      [hashedPassword, userId]
    );

    if (!updateResult.success) {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัปเดตรหัสผ่าน',
      };
    }

    // ทำเครื่องหมายว่า OTP ถูกใช้แล้ว
    await executeQuery(
      'UPDATE otp SET is_used = TRUE WHERE user_id = ? AND otp = ?',
      [userId, otp]
    );

    return {
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ',
      data: {
        message: 'ระบบได้ทำการเปลี่ยนรหัสผ่านของท่านแล้ว',
      },
    };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return {
      success: false,
      error: error.message,
    };
  }
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
  getLockedUsers,
  requestOtp,
  resetPassword,
};
