const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/dataconfig');
const { getDateTimeUTCNow } = require('../globalFunction');

// JWT Secret (ในการใช้งานจริงควรเก็บใน environment variable)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// ดึงข้อมูลผู้ใช้ตาม username (helper function for loginUser)
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

// อัปเดตจำนวนการเข้าสู่ระบบ (เมื่อ login ผิด) - helper function for loginUser
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
          updated_dt = now()
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

// รีเซ็ต login count (เมื่อ login สำเร็จ) - helper function for loginUser
async function resetLoginCount(username) {
  const query = `
    UPDATE users 
    SET login_count = 0, 
        is_locked = false, 
        updated_dt = now()
    WHERE username = ?
  `;

  return await executeQuery(query, [username]);
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
        error: 'บัญชีผู้ใช้ถูกล็อค กรุณาติดต่อผู้ดูแลระบบ',
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

    // สร้าง payload สำหรับ JWT
    const payload = {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      type: user.type,
      email: user.email,
      phone: user.phone,
      language_code: user.language_code,
      image: user.image,
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        (JWT_EXPIRES_IN === '24h'
          ? 24 * 60 * 60
          : JWT_EXPIRES_IN === '5m'
          ? 5 * 60
          : JWT_EXPIRES_IN === '1m'
          ? 1 * 60
          : parseInt(JWT_EXPIRES_IN)),
    };

    // สร้าง JWT Token
    const token = jwt.sign(payload, JWT_SECRET);

    // บันทึก session ใหม่
    await saveUserSession(user.user_id, token, 'Web Browser');

    // ลบรหัสผ่านออกจากข้อมูลที่ส่งกลับและ map ฟิลด์ให้ตรงกับ frontend interface
    const { password: _, ...userData } = user;

    // Map ฟิลด์ให้ตรงกับ interface ของ frontend
    const mappedUser = {
      user_id: userData.user_id,
      username: userData.username,
      fullname: userData.fullname,
      type: userData.type,
      email: userData.email,
      phone: userData.phone,
      language_code: userData.language_code,
      tax_id: userData.tax_id,
      address: userData.address,
      login_count: userData.login_count,
      is_locked: userData.is_locked,
      image: userData.image,
      status: userData.status,
      created_dt: userData.created_dt,
      updated_dt: userData.updated_dt,
    };

    return {
      success: true,
      data: {
        user: mappedUser,
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

// ฟังก์ชันดึง OTP ที่ยังไม่ได้ใช้สำหรับแอดมิน
async function getActiveOtps() {
  try {
    const query = `
      SELECT 
        o.otp,
        o.user_id,
        o.username,
        o.start_time,
        o.end_time,
        o.is_used,
        u.phone
      FROM otp o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.is_used = 0 
        AND o.end_time > NOW()
      ORDER BY o.end_time DESC
    `;

    const result = await executeQuery(query, []);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล OTP',
        data: [],
      };
    }
  } catch (error) {
    console.error('Error in getActiveOtps:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
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

    // กำหนดเวลาเริ่มต้นและสิ้นสุด (5 นาที) ในเวลา UTC
    const startTime = getDateTimeUTCNow();
    const endTime = new Date(Date.now() + 5 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '); // เพิ่ม 5 นาที

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
        VALUES (?, ?, ?, now(), ?, FALSE)
      `;
      insertResult = await executeQuery(insertOtpQuery, [
        otp,
        user.user_id,
        user.username,
        endTime,
      ]);
    } else if (existingOtpResult.data.length === 1) {
      // ถ้ามี OTP เพียง 1 แถว → อัปเดตแถวเดิม
      const updateOtpQuery = `
        UPDATE otp 
        SET otp = ?, start_time = now(), end_time = ?, is_used = FALSE
        WHERE user_id = ?
      `;
      insertResult = await executeQuery(updateOtpQuery, [
        otp,
        endTime,
        user.user_id,
      ]);
    } else {
      // ถ้าไม่มี OTP เลย → สร้างใหม่
      const insertOtpQuery = `
        INSERT INTO otp (otp, user_id, username, start_time, end_time, is_used)
        VALUES (?, ?, ?, now(), ?, FALSE)
      `;
      insertResult = await executeQuery(insertOtpQuery, [
        otp,
        user.user_id,
        user.username,
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
          // ข้อมูลสำหรับ admin notification
          otp: otp,
          user_id: user.user_id,
          username: user.username,
          start_time: startTime,
          end_time: endTime,
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
      'UPDATE users SET password = ?, updated_dt = ? WHERE user_id = ?',
      [hashedPassword, getDateTimeUTCNow(), userId]
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

// ตรวจสอบและถอดรหัส JWT Token
async function verifyToken(token) {
  try {
    // ตรวจสอบว่า token ถูกส่งมาหรือไม่
    if (!token) {
      return {
        success: false,
        error: 'ไม่พบ Token',
      };
    }

    // ถอดรหัส Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ตรวจสอบว่า Token หมดอายุหรือยัง
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return {
        success: false,
        error: 'Token หมดอายุ',
      };
    }

    // **Session Override**: ตรวจสอบว่า session ยังอยู่ใน database หรือไม่
    const sessionValid = await isValidSession(decoded.user_id, token);
    if (!sessionValid) {
      return {
        success: false,
        error: 'Session ไม่ถูกต้องหรือถูกยกเลิกแล้ว',
      };
    }

    // ส่งข้อมูลผู้ใช้กลับ
    return {
      success: true,
      data: {
        user_id: decoded.user_id,
        username: decoded.username,
        fullname: decoded.fullname,
        type: decoded.type,
        email: decoded.email,
        phone: decoded.phone,
        language_code: decoded.language_code,
      },
    };
  } catch (error) {
    console.error('Error verifying token:', error.message);

    if (error.name === 'TokenExpiredError') {
      return {
        success: false,
        error: 'Token หมดอายุ',
      };
    } else if (error.name === 'JsonWebTokenError') {
      return {
        success: false,
        error: 'Token ไม่ถูกต้อง',
      };
    } else {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบ Token',
      };
    }
  }
}

// ฟังก์ชันจัดการ Active Sessions

async function saveUserSession(userId, token, deviceInfo = '') {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // เก็บแค่ hash ของ token เพื่อความปลอดภัย
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // ใช้ ON DUPLICATE KEY UPDATE เพื่อ reuse ID เดิม
    const upsertSessionQuery = `
      INSERT INTO user_sessions (
        user_id, 
        token_hash, 
        device_info, 
        created_at, 
        expires_at
      ) VALUES (?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
        token_hash = VALUES(token_hash),
        device_info = VALUES(device_info),
        created_at = NOW(),
        expires_at = VALUES(expires_at)
    `;

    return await executeQuery(upsertSessionQuery, [
      userId,
      tokenHash,
      deviceInfo,
      expiresAt,
    ]);
  } catch (error) {
    console.error('Error in saveUserSession:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function isValidSession(userId, token) {
  try {
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const checkSessionQuery = `
      SELECT id FROM user_sessions 
      WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()
    `;

    const result = await executeQuery(checkSessionQuery, [userId, tokenHash]);
    return result.success && result.data.length > 0;
  } catch (error) {
    console.error('Error in isValidSession:', error);
    return false;
  }
}

module.exports = {
  loginUser,
  requestOtp,
  resetPassword,
  verifyToken,
  getActiveOtps,
  saveUserSession,
  isValidSession,
};
