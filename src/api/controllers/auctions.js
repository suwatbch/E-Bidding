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
      res.json({
        success: true,
        data: result.data,
        message: `ดึงข้อมูลประเภทประมูลสำเร็จ ${result.data.length} รายการ`,
        total: result.data.length,
      });
    } else {
      console.error('❌ Failed to get auction types:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทประมูล',
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

// GET /api/auctions/participants - ดึงข้อมูลผู้เข้าร่วมประมูล (ต้องอยู่ก่อน /:id)
router.get('/participants', async (req, res) => {
  try {
    const { auction_id } = req.query;
    let result;

    if (auction_id) {
      const auctionIdNum = parseInt(auction_id);
      if (isNaN(auctionIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'รหัสประมูลไม่ถูกต้อง',
        });
      }
      result = await getAuctionParticipantsByAuctionId(auctionIdNum);
    } else {
      result = await getAllAuctionParticipants();
    }

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: auction_id
          ? `ดึงข้อมูลผู้เข้าร่วมประมูล ${auction_id} สำเร็จ ${result.data.length} รายการ`
          : `ดึงข้อมูลผู้เข้าร่วมประมูลสำเร็จ ${result.data.length} รายการ`,
        total: result.data.length,
      });
    } else {
      console.error('❌ Failed to get auction participants:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้เข้าร่วมประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in getAuctionParticipants:', error);
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
      res.json({
        success: true,
        data: result.data,
        message: search
          ? `พบประมูล ${result.data.length} รายการที่ตรงกับการค้นหา "${search}"`
          : `ดึงข้อมูลประมูลสำเร็จ ${result.data.length} รายการ`,
        total: result.data.length,
      });
    } else {
      console.error('❌ Failed to get auctions:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in getAllAuctions:', error);
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
      return res.status(400).json({
        success: false,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await getAuctionById(auctionId);

    if (result.success) {
      if (result.data.length > 0) {
        res.json({
          success: true,
          data: result.data[0],
          message: 'ดึงข้อมูลประมูลสำเร็จ',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลประมูลที่ระบุ',
        });
      }
    } else {
      console.error('❌ Failed to get auction:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in getAuctionById:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// PUT /api/auctions/:id - อัพเดทข้อมูลประมูล
router.put('/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(400).json({
        success: false,
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
      return res.status(400).json({
        success: false,
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
      res.json({
        success: true,
        message: 'อัพเดทข้อมูลประมูลสำเร็จ',
        data: { auction_id: auctionId },
      });
    } else {
      console.error('❌ Failed to update auction:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพเดทประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in updateAuction:', error);
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
      return res.status(400).json({
        success: false,
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
      res.status(201).json({
        success: true,
        message: 'สร้างประมูลใหม่สำเร็จ',
        data: { auction_id: result.insertId },
      });
    } else {
      console.error('❌ Failed to create auction:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in createAuction:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// DELETE /api/auctions/:id - ลบประมูล (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await deleteAuction(auctionId);

    if (result.success) {
      res.json({
        success: true,
        message: 'ลบประมูลสำเร็จ',
        data: { auction_id: auctionId },
      });
    } else {
      console.error('❌ Failed to delete auction:', result.error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบประมูล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in deleteAuction:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
