const express = require('express');
const router = express.Router();
const {
  getAllAuctions,
  getAuctionById,
  getActiveAuctions,
  searchAuctions,
  updateAuction,
  createAuction,
  deleteAuction,
  getAllAuctionTypes,
  getAllAuctionParticipants,
  getAuctionParticipantsByAuctionId,
} = require('../helper/auctionsHelper');

// GET /api/auctions/types - ดึงข้อมูลประเภทประมูลทั้งหมด (ต้องอยู่ก่อน /:id)
router.get('/types', async (req, res) => {
  try {
    const result = await getAllAuctionTypes();

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: null,
        total: result.data.length,
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

// GET /api/auctions/participants - ดึงข้อมูลผู้เข้าร่วมประมูล (ต้องอยู่ก่อน /:id)
router.get('/participants', async (req, res) => {
  try {
    const { auction_id } = req.query;
    let result;

    if (auction_id) {
      const auctionIdNum = parseInt(auction_id);
      if (isNaN(auctionIdNum)) {
        return res.status(200).json({
          success: true,
          message: 'รหัสประมูลไม่ถูกต้อง',
        });
      }
      result = await getAuctionParticipantsByAuctionId(auctionIdNum);
    } else {
      result = await getAllAuctionParticipants();
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: null,
        total: result.data.length,
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

// GET /api/auctions - ดึงข้อมูลประมูลทั้งหมด
router.get('/', async (req, res) => {
  try {
    // ตรวจสอบ query parameters
    const { active_only, search } = req.query;

    let result;

    if (search) {
      result = await searchAuctions(search);
    } else if (active_only === 'true') {
      // ดึงเฉพาะประมูลที่เปิดใช้งาน
      result = await getActiveAuctions();
    } else {
      // ดึงประมูลทั้งหมด
      result = await getAllAuctions();
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: null,
        total: result.data.length,
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

// GET /api/auctions/:id - ดึงข้อมูลประมูลตาม ID
router.get('/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await getAuctionById(auctionId);

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
          message: 'ไม่พบข้อมูลประมูลที่ระบุ',
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

// POST /api/auctions/update/:id - อัพเดทข้อมูลประมูล
router.post('/update/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const {
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status,
      remark,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !name ||
      !auction_type_id ||
      !start_dt ||
      !end_dt ||
      !reserve_price ||
      !currency
    ) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
      });
    }

    const result = await updateAuction(auctionId, {
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status: status !== undefined ? status : 1,
      remark,
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

// POST /api/auctions - สร้างประมูลใหม่
router.post('/', async (req, res) => {
  try {
    const {
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status,
      remark,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !name ||
      !auction_type_id ||
      !start_dt ||
      !end_dt ||
      !reserve_price ||
      !currency
    ) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
      });
    }

    const result = await createAuction({
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status: status !== undefined ? status : 1,
      remark,
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

// POST /api/auctions/delete/:id - ลบประมูล (soft delete)
router.post('/delete/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await deleteAuction(auctionId);

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
