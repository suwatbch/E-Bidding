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
  createUserWithCompanies,
  updateUserWithCompanies,
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
        message: null,
        data: result.data,
      });
    } else {
      res.status(200).json({
        success: false,
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

// GET /api/users/:userId - ดึงข้อมูลผู้ใช้งานตาม user_id
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    const result = await getUserById(parseInt(userId));

    if (result.success) {
      if (result.data.length > 0) {
        res.status(200).json({
          success: true,
          message: null,
          data: result.data[0],
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'ไม่พบข้อมูลผู้ใช้งานที่ระบุ',
        });
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
      return res.status(200).json({
        success: true,
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

// POST /api/users/update/:userId - อัปเดตข้อมูลผู้ใช้งาน
router.post('/update/:userId', async (req, res) => {
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
      return res.status(200).json({
        success: true,
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
        message: null,
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

// POST /api/users/delete/:userId - ลบผู้ใช้งาน (soft delete)
router.post('/delete/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    const result = await deleteUser(parseInt(userId));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
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

// POST /api/users/language/:userId - อัปเดตภาษาของผู้ใช้งาน
router.post('/language/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language_code } = req.body;

    // Validation
    if (!userId) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    if (!language_code) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    // ตรวจสอบรูปแบบของ language_code (ควรเป็น 2-3 ตัวอักษร)
    if (!/^[a-z]{2,3}$/.test(language_code)) {
      return res.status(200).json({
        success: true,
        message:
          'รูปแบบรหัสภาษาไม่ถูกต้อง (ควรเป็น 2-3 ตัวอักษรเล็ก เช่น th, en)',
      });
    }

    const result = await updateUserLanguage(parseInt(userId), language_code);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
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

// POST /api/users/with-companies - เพิ่มผู้ใช้งานใหม่พร้อมบริษัท (Transaction)
router.post('/with-companies', async (req, res) => {
  try {
    const { createDataUser, createDataUser_Company } = req.body;

    // ตรวจสอบข้อมูลผู้ใช้งาน
    if (!createDataUser) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุข้อมูลผู้ใช้งาน',
      });
    }

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
    } = createDataUser;

    // Validation ข้อมูลจำเป็น
    if (!username || !password || !fullname || !email || !phone) {
      return res.status(200).json({
        success: true,
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
      image,
      status: status !== undefined ? status : true,
    };

    // เตรียมข้อมูลบริษัท (ถ้ามี)
    let companiesData = [];
    if (
      createDataUser_Company &&
      Array.isArray(createDataUser_Company) &&
      createDataUser_Company.length > 0
    ) {
      // ตรวจสอบว่าทุก company มี company_id
      const invalidCompanies = createDataUser_Company.filter(
        (c) => !c.company_id || c.company_id <= 0
      );
      if (invalidCompanies.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'บริษัทบางรายการไม่มี company_id',
        });
      }

      companiesData = createDataUser_Company.map((c) => ({
        company_id: c.company_id,
        role_in_company: c.role_in_company || '',
        is_primary: c.is_primary || false,
        status: c.status || 1,
      }));

      // ตรวจสอบว่ามี primary company หรือไม่
      const hasPrimary = companiesData.some((c) => c.is_primary);
      if (!hasPrimary && companiesData.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'กรุณาระบุบริษัทหลัก',
        });
      }
    }

    // สร้างผู้ใช้งานพร้อมบริษัทด้วย transaction
    const result = await createUserWithCompanies(userData, companiesData);

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
    console.error('Error in /with-companies:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/users/update-with-companies/:userId - อัปเดตผู้ใช้งานพร้อมบริษัท (Smart Update Transaction)
router.post('/update-with-companies/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { createDataUser, createDataUser_Company } = req.body;

    if (!userId) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID ผู้ใช้งาน',
      });
    }

    // ตรวจสอบข้อมูลผู้ใช้งาน
    if (!createDataUser) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุข้อมูลผู้ใช้งาน',
      });
    }

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
    } = createDataUser;

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
      image,
      status,
      is_locked,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // เตรียมข้อมูลบริษัท (ถ้ามี) - รองรับ Smart Update
    let companiesData = [];
    if (
      createDataUser_Company &&
      Array.isArray(createDataUser_Company) &&
      createDataUser_Company.length > 0
    ) {
      // ตรวจสอบว่าทุก company มี company_id
      const invalidCompanies = createDataUser_Company.filter(
        (c) => !c.company_id || c.company_id <= 0
      );
      if (invalidCompanies.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'บริษัทบางรายการไม่มี company_id',
        });
      }

      companiesData = createDataUser_Company.map((c) => ({
        id: c.id || 0,
        company_id: c.company_id,
        role_in_company: c.role_in_company || '',
        is_primary: c.is_primary || false,
        status: c.status || 1,
      }));

      // ตรวจสอบว่ามี primary company หรือไม่
      const hasPrimary = companiesData.some((c) => c.is_primary);
      if (!hasPrimary && companiesData.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'กรุณาระบุบริษัทหลัก',
        });
      }
    }

    // อัปเดตผู้ใช้งานพร้อมบริษัทด้วย transaction
    const result = await updateUserWithCompanies(
      parseInt(userId),
      updateData,
      companiesData
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /update-with-companies:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
