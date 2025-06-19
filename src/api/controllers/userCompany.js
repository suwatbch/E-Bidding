const express = require('express');
const router = express.Router();
const {
  getUserCompanies,
  getCompanyUsers,
  getAllUserCompanies,
  addUserToCompany,
  updateUserCompany,
  removeUserFromCompany,
  setPrimaryCompany,
  getPrimaryCompany,
} = require('../helper/userCompanyHelper');

// GET /api/user-company - ดึงข้อมูลความสัมพันธ์ผู้ใช้-บริษัททั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await getAllUserCompanies();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลความสัมพันธ์ผู้ใช้-บริษัทสำเร็จ',
        data: result.data,
        total: result.data.length,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลความสัมพันธ์ผู้ใช้-บริษัท',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getAllUserCompanies:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/user-company/user/:userId - ดึงข้อมูลบริษัทของผู้ใช้ตาม user_id
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ User ID ที่ถูกต้อง',
      });
    }

    const result = await getUserCompanies(parseInt(userId));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลบริษัทของผู้ใช้สำเร็จ',
        data: result.data,
        total: result.data.length,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัทของผู้ใช้',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getUserCompanies:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/user-company/company/:companyId - ดึงข้อมูลผู้ใช้ในบริษัทตาม company_id
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ Company ID ที่ถูกต้อง',
      });
    }

    const result = await getCompanyUsers(parseInt(companyId));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ใช้ในบริษัทสำเร็จ',
        data: result.data,
        total: result.data.length,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ในบริษัท',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getCompanyUsers:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/user-company/primary/:userId - ดึงข้อมูลบริษัทหลักของผู้ใช้
router.get('/primary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ User ID ที่ถูกต้อง',
      });
    }

    const result = await getPrimaryCompany(parseInt(userId));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลบริษัทหลักของผู้ใช้สำเร็จ',
        data: result.data.length > 0 ? result.data[0] : null,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัทหลักของผู้ใช้',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getPrimaryCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/user-company - เพิ่มผู้ใช้เข้าบริษัท
router.post('/', async (req, res) => {
  try {
    const { user_id, company_id, role_in_company, is_primary, status } =
      req.body;

    // Validation
    if (!user_id || !company_id) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ User ID และ Company ID',
      });
    }

    if (isNaN(user_id) || isNaN(company_id)) {
      return res.status(200).json({
        success: true,
        message: 'User ID และ Company ID ต้องเป็นตัวเลข',
      });
    }

    const userCompanyData = {
      user_id: parseInt(user_id),
      company_id: parseInt(company_id),
      role_in_company,
      is_primary: is_primary || false,
      status: status !== undefined ? status : 1,
    };

    const result = await addUserToCompany(userCompanyData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
        data: { id: result.insertId },
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in addUserToCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/user-company/update/:id - อัปเดตข้อมูลผู้ใช้ในบริษัท
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role_in_company, is_primary, status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID ที่ถูกต้อง',
      });
    }

    const updateData = {
      role_in_company,
      is_primary,
      status,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const result = await updateUserCompany(parseInt(id), updateData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
        data: { id: parseInt(id) },
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in updateUserCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/user-company/delete/:id - ลบผู้ใช้ออกจากบริษัท
router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID ที่ถูกต้อง',
      });
    }

    const result = await removeUserFromCompany(parseInt(id));

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
    console.error('Error in removeUserFromCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/user-company/set-primary - ตั้งบริษัทหลักของผู้ใช้
router.post('/set-primary', async (req, res) => {
  try {
    const { user_id, company_id } = req.body;

    if (!user_id || !company_id) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ User ID และ Company ID',
      });
    }

    if (isNaN(user_id) || isNaN(company_id)) {
      return res.status(200).json({
        success: true,
        message: 'User ID และ Company ID ต้องเป็นตัวเลข',
      });
    }

    const result = await setPrimaryCompany(
      parseInt(user_id),
      parseInt(company_id)
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
    console.error('Error in setPrimaryCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
