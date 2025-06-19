const express = require('express');
const router = express.Router();
const {
  getAllAuctionTypes,
  getAuctionTypeById,
  getActiveAuctionTypes,
  searchAuctionTypes,
  updateAuctionType,
  createAuctionType,
  deleteAuctionType,
} = require('../helper/auctionTypeHelper');

// GET /api/auction-type - ดึงข้อมูลประเภทการประมูลทั้งหมด
router.get('/', async (req, res) => {
  try {
    // ตรวจสอบ query parameters
    const { active_only, search } = req.query;

    let result;

    if (search) {
      result = await searchAuctionTypes(search);
    } else if (active_only === 'true') {
      // ดึงเฉพาะประเภทการประมูลที่เปิดใช้งาน
      result = await getActiveAuctionTypes();
    } else {
      // ดึงประเภทการประมูลทั้งหมด
      result = await getAllAuctionTypes();
    }

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: search
          ? `พบประเภทการประมูล ${result.data.length} รายการที่ตรงกับการค้นหา "${search}"`
          : `ดึงข้อมูลประเภทการประมูลสำเร็จ ${result.data.length} รายการ`,
        total: result.data.length,
      });
    } else {
      console.error('❌ Failed to get auction types:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทการประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in getAllAuctionTypes:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/auction-type/:id - ดึงข้อมูลประเภทการประมูลตาม ID
router.get('/:id', async (req, res) => {
  try {
    const auctionTypeId = parseInt(req.params.id);

    if (isNaN(auctionTypeId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประเภทการประมูลไม่ถูกต้อง',
      });
    }

    const result = await getAuctionTypeById(auctionTypeId);

    if (result.success) {
      if (result.data.length > 0) {
        res.status(200).json({
          success: true,
          data: result.data[0],
          message: null,
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'ไม่พบข้อมูลประเภทการประมูลที่ระบุ',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทการประมูล',
        error: result.error,
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

// POST /api/auction-type/update/:id - อัพเดทข้อมูลประเภทการประมูล
router.post('/update/:id', async (req, res) => {
  try {
    const auctionTypeId = parseInt(req.params.id);

    if (isNaN(auctionTypeId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประเภทการประมูลไม่ถูกต้อง',
      });
    }

    const { name, description, status } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name) {
      return res.status(200).json({
        success: true,
        message: 'ชื่อประเภทการประมูลเป็นข้อมูลที่จำเป็น',
      });
    }

    const result = await updateAuctionType(auctionTypeId, {
      name,
      description,
      status: status !== undefined ? status : 1,
    });

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

// POST /api/auction-type - สร้างประเภทการประมูลใหม่
router.post('/', async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name) {
      return res.status(200).json({
        success: true,
        message: 'ชื่อประเภทการประมูลเป็นข้อมูลที่จำเป็น',
      });
    }

    const result = await createAuctionType({
      name,
      description,
      status: status !== undefined ? status : 1,
    });

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

// POST /api/auction-type/delete/:id - ลบประเภทการประมูล (soft delete)
router.post('/delete/:id', async (req, res) => {
  try {
    const auctionTypeId = parseInt(req.params.id);

    if (isNaN(auctionTypeId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประเภทการประมูลไม่ถูกต้อง',
      });
    }

    const result = await deleteAuctionType(auctionTypeId);

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

module.exports = router;
