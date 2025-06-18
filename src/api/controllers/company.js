const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  getActiveCompanies,
  searchCompanies,
  updateCompany,
  createCompany,
  deleteCompany,
} = require('../helper/companyHelper');

// GET /api/company - ดึงข้อมูลบริษัททั้งหมด
router.get('/', async (req, res) => {
  try {
    // ตรวจสอบ query parameters
    const { active_only, search } = req.query;

    let result;

    if (search) {
      result = await searchCompanies(search);
    } else if (active_only === 'true') {
      // ดึงเฉพาะบริษัทที่เปิดใช้งาน
      result = await getActiveCompanies();
    } else {
      // ดึงบริษัททั้งหมด
      result = await getAllCompanies();
    }

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: search
          ? `พบบริษัท ${result.data.length} รายการที่ตรงกับการค้นหา "${search}"`
          : `ดึงข้อมูลบริษัทสำเร็จ ${result.data.length} รายการ`,
        total: result.data.length,
      });
    } else {
      console.error('❌ Failed to get companies:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in getAllCompanies:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/company/:id - ดึงข้อมูลบริษัทตาม ID
router.get('/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'รหัสบริษัทไม่ถูกต้อง',
      });
    }

    const result = await getCompanyById(companyId);

    if (result.success) {
      if (result.data.length > 0) {
        res.json({
          success: true,
          data: result.data[0],
          message: 'ดึงข้อมูลบริษัทสำเร็จ',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลบริษัทที่ระบุ',
        });
      }
    } else {
      console.error('❌ Failed to get company:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in getCompanyById:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// PUT /api/company/:id - อัพเดทข้อมูลบริษัท
router.put('/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'รหัสบริษัทไม่ถูกต้อง',
      });
    }

    const { name, tax_id, address, email, phone, status } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อบริษัทเป็นข้อมูลที่จำเป็น',
      });
    }

    const result = await updateCompany(companyId, {
      name,
      tax_id,
      address,
      email,
      phone,
      status: status !== undefined ? status : 1,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'อัพเดทข้อมูลบริษัทสำเร็จ',
        data: { id: companyId },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'เกิดข้อผิดพลาดในการอัพเดทบริษัท',
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

// POST /api/company - สร้างบริษัทใหม่
router.post('/', async (req, res) => {
  try {
    const { name, tax_id, address, email, phone, status } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อบริษัทเป็นข้อมูลที่จำเป็น',
      });
    }

    const result = await createCompany({
      name,
      tax_id,
      address,
      email,
      phone,
      status: status !== undefined ? status : 1,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'สร้างบริษัทใหม่สำเร็จ',
        data: { id: result.insertId },
      });
    } else {
      console.error('❌ Failed to create company:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างบริษัท',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in createCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// DELETE /api/company/:id - ลบบริษัท (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'รหัสบริษัทไม่ถูกต้อง',
      });
    }

    const result = await deleteCompany(companyId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ลบบริษัทสำเร็จ',
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'เกิดข้อผิดพลาดในการลบบริษัท',
      });
    }
  } catch (error) {
    console.error('Error in deleteCompany:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
