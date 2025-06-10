const express = require('express');
const router = express.Router();
const {
  loginUser,
  requestOtp,
  resetPassword,
} = require('../helper/authHelper');

// Constants
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 วัน (24 ชั่วโมง)

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
      httpOnly: false,
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

module.exports = router;
