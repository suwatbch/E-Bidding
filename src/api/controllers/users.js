const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByType,
  getUsersByStatus,
  updateUserLanguage,
} = require('../helper/usersHelper');

// Routes for Users
// GET /api/users - ดึงข้อมูลผู้ใช้งานทั้งหมด
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let result;

    if (type) {
      result = await getUsersByType(type);
    } else if (status !== undefined) {
      result = await getUsersByStatus(status === 'true');
    } else {
      result = await getAllUsers(search);
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ใช้งานสำเร็จ',
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน',
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

// GET /api/users/:userId - ดึงข้อมูลผู้ใช้งานตาม user_id
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    const result = await getUserById(parseInt(userId));

    if (result.success) {
      if (result.data.length > 0) {
        res.status(200).json({
          success: true,
          message: 'ดึงข้อมูลผู้ใช้งานสำเร็จ',
          data: result.data[0],
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งานที่ระบุ',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/users - เพิ่มผู้ใช้งานใหม่
router.post('/', async (req, res) => {
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
      status,
    } = req.body;

    // Validation
    if (!username || !password || !fullname || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      });
    }

    const userData = {
      username,
      password,
      fullname,
      email,
      phone,
      type: type || 'user',
      language_code: language_code || 'th',
      tax_id,
      address,
      status: status !== undefined ? status : true,
    };

    const result = await createUser(userData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'เพิ่มผู้ใช้งานใหม่สำเร็จ',
        data: { user_id: result.insertId },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน',
      });
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// PUT /api/users/:userId - อัปเดตข้อมูลผู้ใช้งาน
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
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
      status,
      is_locked,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    const updateData = {
      username,
      password,
      fullname,
      email,
      phone,
      type,
      language_code,
      tax_id,
      address,
      status,
      is_locked,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const result = await updateUser(parseInt(userId), updateData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จ',
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน',
      });
    }
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// DELETE /api/users/:userId - ลบผู้ใช้งาน (soft delete)
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    const result = await deleteUser(parseInt(userId));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ลบผู้ใช้งานสำเร็จ',
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน',
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

// PATCH /api/users/:userId/language - อัปเดตภาษาของผู้ใช้งาน
router.patch('/:userId/language', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language_code } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    if (!language_code) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    // ตรวจสอบรูปแบบของ language_code (ควรเป็น 2-3 ตัวอักษร)
    if (!/^[a-z]{2,3}$/.test(language_code)) {
      return res.status(400).json({
        success: false,
        message:
          'รูปแบบรหัสภาษาไม่ถูกต้อง (ควรเป็น 2-3 ตัวอักษรเล็ก เช่น th, en)',
      });
    }

    const result = await updateUserLanguage(parseInt(userId), language_code);

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
    console.error('Error in updateUserLanguage:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
