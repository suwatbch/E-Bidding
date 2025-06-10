const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUser,
  changePassword,
  toggleUserLock,
  deleteUser,
  resetLoginCount,
  getLockedUsers,
  requestOtp,
  resetPassword,
} = require('../helper/authHelper');

// Constants
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 วัน (24 ชั่วโมง)

// POST /api/auth/register - สมัครสมาชิก (Public Route)
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      password,
      language_code,
      fullname,
      tax_id,
      address,
      email,
      phone,
      type,
      image,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อผู้ใช้และรหัสผ่าน',
      });
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      });
    }

    const result = await createUser({
      username,
      password,
      language_code,
      fullname,
      tax_id,
      address,
      email,
      phone,
      type,
      image,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/login - เข้าสู่ระบบ (Public Route)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อผู้ใช้และรหัสผ่านให้ถูกต้อง',
      });
    }

    const result = await loginUser(username, password);

    if (result.success) {
      res.cookie('auth_token', result.data.token, {
        httpOnly: true, // ป้องกัน XSS
        maxAge: COOKIE_MAX_AGE,
        path: '/', // ใช้ได้ทั้งเว็บไซต์
        sameSite: 'strict', // ป้องกัน CSRF
        secure: process.env.NODE_ENV === 'production', // HTTPS ใน production
      });
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/logout - ออกจากระบบ (Public Route)
router.post('/logout', async (req, res) => {
  try {
    // ลบ cookie auth_token
    res.clearCookie('auth_token', {
      path: '/',
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการออกจากระบบ',
      error: error.message,
    });
  }
});

// GET /api/auth/profile - ดึงข้อมูลโปรไฟล์ผู้ใช้ (ต้อง login)
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await getUserById(userId);

    if (result.success && result.data.length > 0) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
        data: result.data[0],
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
    }
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/profile - อัปเดตข้อมูลโปรไฟล์ (ต้อง login)
router.post('/profile', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { language_code, fullname, tax_id, address, email, phone, image } =
      req.body;

    const result = await updateUser(userId, {
      language_code,
      fullname,
      tax_id,
      address,
      email,
      phone,
      image,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'อัปเดตข้อมูลโปรไฟล์สำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/change-password - เปลี่ยนรหัสผ่าน (ต้อง login)
router.post('/change-password', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสผ่านเดิมและรหัสผ่านใหม่',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      });
    }

    const result = await changePassword(userId, oldPassword, newPassword);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'เปลี่ยนรหัสผ่านสำเร็จ',
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/auth/users - ดึงข้อมูลผู้ใช้ทั้งหมด (Admin Only - จัดการโดย middleware)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllUsers(page, limit);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.data.length,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/auth/users/locked - ดึงรายการผู้ใช้ที่ถูกล็อค (Admin Only)
router.get('/users/locked', async (req, res) => {
  try {
    const result = await getLockedUsers();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ใช้ที่ถูกล็อคสำเร็จ',
        data: result.data,
        count: result.data.length,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getLockedUsers:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/auth/users/:userId - ดึงข้อมูลผู้ใช้ตาม ID (Owner หรือ Admin)
router.get('/users/:userId', async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId);
    const isOwner = req.user.user_id === requestedUserId;
    const isAdmin = req.user.type === 'admin';

    // ตรวจสอบสิทธิ์ (owner หรือ admin)
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
      });
    }

    const result = await getUserById(requestedUserId);

    if (result.success && result.data.length > 0) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
        data: result.data[0],
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/users/:userId/lock - ล็อค/ปลดล็อคผู้ใช้ (Admin Only)
router.post('/users/:userId/lock', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { isLocked } = req.body;

    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะการล็อค (true/false)',
      });
    }

    const result = await toggleUserLock(userId, isLocked);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: isLocked ? 'ล็อคผู้ใช้สำเร็จ' : 'ปลดล็อคผู้ใช้สำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะผู้ใช้',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in toggleUserLock:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/users/:userId/unlock - ปลดล็อคและรีเซ็ต login count (Admin Only)
router.post('/users/:userId/unlock', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // ดึงข้อมูลผู้ใช้เพื่อหา username
    const userResult = await getUserById(userId);

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
    }

    const user = userResult.data[0];

    // รีเซ็ต login count และปลดล็อค
    const result = await resetLoginCount(user.username);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `ปลดล็อคและรีเซ็ต login count สำหรับผู้ใช้ ${user.username} สำเร็จ`,
        data: {
          username: user.username,
          fullname: user.fullname,
          reset_time: new Date().toISOString(),
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการปลดล็อคผู้ใช้',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in unlockUser:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// DELETE /api/auth/users/:userId - ลบผู้ใช้ (Admin Only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // ป้องกันการลบตัวเอง
    if (req.user.user_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบบัญชีของตัวเองได้',
      });
    }

    const result = await deleteUser(userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ลบผู้ใช้สำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/otp - ขอรหัส OTP สำหรับรีเซ็ตรหัสผ่าน (Public Route)
router.post('/otp', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อผู้ใช้',
      });
    }

    const result = await requestOtp(username);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getOtp:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auth/reset-password - รีเซ็ตรหัสผ่าน
router.post('/reset-password', async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    const result = await resetPassword(username, otp, newPassword);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/auth/verify - ตรวจสอบ Token (ต้อง login)
router.get('/verify', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token ถูกต้อง',
      data: {
        user_id: req.user.user_id,
        username: req.user.username,
        type: req.user.type,
        language_code: req.user.language_code,
      },
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
