const express = require('express');
const router = express.Router();
const {
  loginUser,
  requestOtp,
  resetPassword,
} = require('../helper/authHelper');
const { getAllAuctions } = require('../helper/auctionsHelper');
const { getDateTimeUTCNow } = require('../globalFunction');

// POST /api/auth/login - เข้าสู่ระบบ (Public Route)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุชื่อผู้ใช้และรหัสผ่านให้ถูกต้อง',
      });
    }

    const result = await loginUser(username, password);

    if (result.success) {
      const userData = result.data.user;
      const userId = userData.user_id;
      const userType = userData.type;
      const dateNow = new Date();
      const startDate = dateNow.toISOString().split('T')[0] + ' 00:00:00';
      const endDate = dateNow.toISOString().split('T')[0] + ' 23:59:59';

      if (userType === 'admin') {
        res.status(200).json({
          success: true,
          message: null,
          data: result.data,
        });
      } else {
        // ดึงข้อมูลประมูลทั้งหมด (รองรับการกรองตามวันที่และ user role)
        const auctionsData = await getAllAuctions(
          startDate,
          endDate,
          userId,
          userType
        );

        if (auctionsData.success && auctionsData.data.length > 0) {
          res.status(200).json({
            success: true,
            message: null,
            data: result.data,
          });
        } else {
          res.status(200).json({
            success: true,
            message:
              auctionsData.error || 'ไม่พบตลาดประมูลที่สามารถเข้าร่วมได้',
          });
        }
      }
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
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
      message: null,
    });
  } catch (error) {
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
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุชื่อผู้ใช้',
      });
    }

    const result = await requestOtp(username);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
        data: result.data,
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
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
        message: null,
        data: result.data,
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
