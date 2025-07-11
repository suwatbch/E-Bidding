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
  createAuctionParticipant,
  updateAuctionParticipant,
  deleteAuctionParticipant,
  createMultipleAuctionParticipants,
  createAuctionWithParticipants,
  updateAuctionWithParticipants,
  getAuctionParticipantsWithDetails,
  getAuctionItems,
  createAuctionBid,
  rejectBid,
  getAuctionBids,
  updateAuctionStatus,
  checkAndUpdateExpiredAuctions,
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
    const { active_only, search, start_date, end_date } = req.query;

    // ดึงข้อมูล user จาก middleware (ถ้ามี)
    const userId = req.user?.user_id || null;
    const userType = req.user?.type || null;

    let result;

    if (search) {
      result = await searchAuctions(search);
    } else if (active_only === 'true') {
      // ดึงเฉพาะประมูลที่เปิดใช้งาน
      result = await getActiveAuctions();
    } else {
      // ดึงประมูลทั้งหมด (รองรับการกรองตามวันที่และ user role)
      result = await getAllAuctions(start_date, end_date, userId, userType);
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

// GET /api/auctions/:id/bids - ดึงข้อมูลการเสนอราคา
router.get('/:id/bids', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await getAuctionBids(auctionId);

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

// POST /api/auctions/:id/bids - เสนอราคาในการประมูล
router.post('/:id/bids', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const { user_id, company_id, bid_amount } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!user_id || !bid_amount) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุข้อมูลที่จำเป็น',
      });
    }

    // ตรวจสอบว่าราคาเป็นตัวเลขและมากกว่า 0
    const bidAmountNum = parseFloat(bid_amount);
    if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
      return res.status(200).json({
        success: true,
        message: 'ราคาเสนอไม่ถูกต้อง',
      });
    }

    // เรียกใช้ helper function
    const result = await createAuctionBid({
      auction_id: auctionId,
      user_id: parseInt(user_id),
      company_id: company_id ? parseInt(company_id) : 0,
      bid_amount: bidAmountNum,
    });

    if (result.success) {
      // Broadcast ข้อมูลการเสนอราคาใหม่ผ่าน Socket.IO
      const io = req.app.get('io');
      if (io) {
        const roomName = `auction-${auctionId}`;
        io.to(roomName).emit('new-bid', {
          auctionId: auctionId,
          bidData: result.data, // ใช้ข้อมูลจาก helper ที่มี bid_id ครบถ้วน
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: null,
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auctions/bids/:bidId/reject - ปฏิเสธการเสนอราคา
router.post('/bids/:bidId/reject', async (req, res) => {
  try {
    const bidId = parseInt(req.params.bidId);

    if (isNaN(bidId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสการเสนอราคาไม่ถูกต้อง',
      });
    }

    // TODO: เพิ่มการตรวจสอบสิทธิ์ว่า user สามารถ reject bid นี้ได้หรือไม่
    // เช่น เป็นเจ้าของ bid หรือเป็น admin

    const result = await rejectBid(bidId);

    if (result.success) {
      // Broadcast ข้อมูลการอัปเดทสถานะ bid ผ่าน Socket.IO
      const io = req.app.get('io');
      if (io) {
        // ดึงข้อมูล bid ที่ถูก reject เพื่อ broadcast
        const bidData = result.data;
        if (bidData && bidData.auction_id) {
          const roomName = `auction-${bidData.auction_id}`;
          io.to(roomName).emit('bid-status-updated', {
            auctionId: bidData.auction_id,
            bidId: bidId,
            status: 'reject',
            bidData: bidData,
          });
        }
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: null,
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error rejecting bid:', error);
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
      !start_dt ||
      !end_dt ||
      reserve_price === undefined ||
      reserve_price === null ||
      !currency
    ) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
      });
    }

    const result = await updateAuction(auctionId, {
      name,
      auction_type_id: auction_type_id || 0, // ให้เป็น 0 ถ้าไม่มีการเลือก
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

// POST /api/auctions/update-with-participants/:id - อัพเดทประมูลพร้อมผู้เข้าร่วม (Transaction)
router.post('/update-with-participants/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const {
      createDataAuction,
      createDataAuction_Participant,
      createDataAuction_Item,
    } = req.body;

    // ตรวจสอบข้อมูลตลาดประมูลที่จำเป็น
    if (!createDataAuction) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลตลาดประมูลไม่ครบถ้วน',
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
    } = createDataAuction;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !name ||
      !start_dt ||
      !end_dt ||
      reserve_price === undefined ||
      reserve_price === null ||
      !currency
    ) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลตลาดประมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
      });
    }

    // เตรียมข้อมูล auction
    const auctionData = {
      name,
      auction_type_id: auction_type_id || 0,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status: status !== undefined ? status : 1,
      remark,
    };

    // เตรียมข้อมูล participants (ถ้ามี)
    let participantsData = [];
    if (
      createDataAuction_Participant &&
      Array.isArray(createDataAuction_Participant) &&
      createDataAuction_Participant.length > 0
    ) {
      // ตรวจสอบว่าทุก participant มี user_id
      const invalidParticipants = createDataAuction_Participant.filter(
        (p) => !p.user_id
      );
      if (invalidParticipants.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'ผู้เข้าร่วมบางคนไม่มี user_id',
        });
      }

      participantsData = createDataAuction_Participant.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        company_id: p.company_id || 0,
        status: p.status || 1,
      }));
    }

    // เตรียมข้อมูล auction items (ถ้ามี)
    let itemsData = [];
    if (
      createDataAuction_Item &&
      Array.isArray(createDataAuction_Item) &&
      createDataAuction_Item.length > 0
    ) {
      // ตรวจสอบข้อมูล items ที่จำเป็น
      const invalidItems = createDataAuction_Item.filter(
        (item) =>
          !item.item_name ||
          item.quantity === undefined ||
          item.base_price === undefined
      );
      if (invalidItems.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'ข้อมูลรายการประมูลไม่ครบถ้วน',
        });
      }

      itemsData = createDataAuction_Item.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit || '',
        base_price: item.base_price,
        status: item.status || 1,
      }));
    }

    // อัปเดต auction พร้อม participants และ items ด้วย transaction
    const result = await updateAuctionWithParticipants(
      auctionId,
      auctionData,
      participantsData,
      itemsData
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
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
      !start_dt ||
      !end_dt ||
      reserve_price === undefined ||
      reserve_price === null ||
      !currency
    ) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
      });
    }

    const result = await createAuction({
      name,
      auction_type_id: auction_type_id || 0, // ให้เป็น 0 ถ้าไม่มีการเลือก
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
        data: result.data,
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

// POST /api/auctions/with-participants - สร้างประมูลใหม่พร้อมผู้เข้าร่วม (Transaction)
router.post('/with-participants', async (req, res) => {
  try {
    const {
      createDataAuction,
      createDataAuction_Participant,
      createDataAuction_Item,
    } = req.body;

    // ตรวจสอบข้อมูลตลาดประมูลที่จำเป็น
    if (!createDataAuction) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลตลาดประมูลไม่ครบถ้วน',
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
    } = createDataAuction;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !name ||
      !start_dt ||
      !end_dt ||
      reserve_price === undefined ||
      reserve_price === null ||
      !currency
    ) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลตลาดประมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
      });
    }

    // เตรียมข้อมูล auction
    const auctionData = {
      name,
      auction_type_id: auction_type_id || 0,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status: status !== undefined ? status : 1,
      remark,
    };

    // เตรียมข้อมูล participants (ถ้ามี)
    let participantsData = [];
    if (
      createDataAuction_Participant &&
      Array.isArray(createDataAuction_Participant) &&
      createDataAuction_Participant.length > 0
    ) {
      // ตรวจสอบว่าทุก participant มี user_id
      const invalidParticipants = createDataAuction_Participant.filter(
        (p) => !p.user_id
      );
      if (invalidParticipants.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'ผู้เข้าร่วมบางคนไม่มี user_id',
        });
      }

      participantsData = createDataAuction_Participant.map((p) => ({
        user_id: p.user_id,
        company_id: p.company_id || 0,
        status: p.status || 1,
      }));
    }

    // เตรียมข้อมูล auction items (ถ้ามี)
    let itemsData = [];
    if (
      createDataAuction_Item &&
      Array.isArray(createDataAuction_Item) &&
      createDataAuction_Item.length > 0
    ) {
      // ตรวจสอบข้อมูล items ที่จำเป็น
      const invalidItems = createDataAuction_Item.filter(
        (item) =>
          !item.item_name ||
          item.quantity === undefined ||
          item.base_price === undefined
      );
      if (invalidItems.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'ข้อมูลรายการประมูลไม่ครบถ้วน',
        });
      }

      itemsData = createDataAuction_Item.map((item) => ({
        item_name: item.item_name,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit || '',
        base_price: item.base_price,
        status: item.status || 1,
      }));
    }

    // สร้าง auction พร้อม participants และ items ด้วย transaction
    const result = await createAuctionWithParticipants(
      auctionData,
      participantsData,
      itemsData
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
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

// POST /api/auctions/delete/:id - ลบประมูล (hard delete) - ลบทั้ง 3 ตาราง
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

// POST /api/auctions/participants - เพิ่มผู้เข้าร่วมประมูล
router.post('/participants', async (req, res) => {
  try {
    const { auction_id, user_id, company_id, status } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!auction_id || !user_id) {
      return res.status(200).json({
        success: true,
        message: 'ข้อมูลไม่ครบถ้วน กรุณาระบุ auction_id และ user_id',
      });
    }

    const result = await createAuctionParticipant({
      auction_id,
      user_id,
      company_id: company_id || 0,
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

// POST /api/auctions/participants/multiple - เพิ่มผู้เข้าร่วมประมูลหลายคน
router.post('/participants/multiple', async (req, res) => {
  try {
    const { auction_id, participants } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!auction_id || !participants || !Array.isArray(participants)) {
      return res.status(200).json({
        success: true,
        message:
          'ข้อมูลไม่ครบถ้วน กรุณาระบุ auction_id และ participants (array)',
      });
    }

    if (participants.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุผู้เข้าร่วมอย่างน้อย 1 คน',
      });
    }

    // ตรวจสอบว่าทุก participant มี user_id
    const invalidParticipants = participants.filter((p) => !p.user_id);
    if (invalidParticipants.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'ผู้เข้าร่วมบางคนไม่มี user_id',
      });
    }

    const result = await createMultipleAuctionParticipants(
      auction_id,
      participants
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
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/auctions/participants/update/:id - อัพเดทข้อมูลผู้เข้าร่วมประมูล
router.post('/participants/update/:id', async (req, res) => {
  try {
    const participantId = parseInt(req.params.id);

    if (isNaN(participantId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสผู้เข้าร่วมไม่ถูกต้อง',
      });
    }

    const { company_id, status } = req.body;

    const result = await updateAuctionParticipant(participantId, {
      company_id: company_id !== undefined ? company_id : 0,
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

// POST /api/auctions/participants/delete/:id - ลบผู้เข้าร่วมประมูล
router.post('/participants/delete/:id', async (req, res) => {
  try {
    const participantId = parseInt(req.params.id);

    if (isNaN(participantId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสผู้เข้าร่วมไม่ถูกต้อง',
      });
    }

    const result = await deleteAuctionParticipant(participantId);

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

// GET /api/auctions/:id/participants - ดึงข้อมูลผู้เข้าร่วมของตลาดประมูล
router.get('/:id/participants', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await getAuctionParticipantsWithDetails(auctionId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
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

// GET /api/auctions/:id/items - ดึงข้อมูลรายการสินค้าของตลาดประมูล
router.get('/:id/items', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const result = await getAuctionItems(auctionId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
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

// POST /api/auctions/update-status/:id - อัพเดทสถานะประมูล
router.post('/update-status/:id', async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);

    if (isNaN(auctionId)) {
      return res.status(200).json({
        success: true,
        message: 'รหัสประมูลไม่ถูกต้อง',
      });
    }

    const { status } = req.body;

    if (typeof status !== 'number' || status < 1 || status > 6) {
      return res.status(200).json({
        success: true,
        message: 'สถานะต้องเป็นตัวเลข 1-6',
      });
    }

    // ใช้ updateAuctionStatus function แทน
    const result = await updateAuctionStatus(auctionId, status);

    if (result.success) {
      // Broadcast สถานะใหม่ผ่าน Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('auctionStatusUpdate', {
          auctionId,
          status,
        });
      }

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

// POST /api/auctions/check-expired - เช็คและอัพเดทสถานะการประมูลที่หมดเวลาแล้ว
router.post('/check-expired', async (req, res) => {
  try {
    const result = await checkAndUpdateExpiredAuctions();

    if (result.success) {
      // Broadcast สถานะใหม่ผ่าน Socket.IO สำหรับการประมูลที่อัพเดท
      const io = req.app.get('io');
      if (io && result.updatedAuctions && result.updatedAuctions.length > 0) {
        result.updatedAuctions.forEach((auction) => {
          io.emit('auctionStatusUpdate', {
            auctionId: auction.auction_id,
            status: auction.status,
          });
        });
      }

      res.status(200).json({
        success: true,
        message: null,
        data: {
          updatedCount: result.updatedCount,
          updatedAuctions: result.updatedAuctions,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.message || 'เกิดข้อผิดพลาดในการเช็คสถานะ',
      });
    }
  } catch (error) {
    console.error('Error in checkExpiredAuctions:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเช็คสถานะ',
    });
  }
});

module.exports = router;
