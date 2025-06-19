const { executeQuery } = require('../config/dataconfig');

// ดึงข้อมูลประมูลทั้งหมด
async function getAllAuctions() {
  const query = `
    SELECT 
      auction_id,
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status,
      is_deleted,
      remark,
      created_dt,
      updated_dt
    FROM auction 
    WHERE is_deleted = 0
    ORDER BY auction_id DESC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลประมูลตาม ID
async function getAuctionById(auctionId) {
  const query = `
    SELECT 
      auction_id,
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status,
      is_deleted,
      remark,
      created_dt,
      updated_dt
    FROM auction 
    WHERE auction_id = ? AND is_deleted = 0
  `;

  return await executeQuery(query, [auctionId]);
}

// ดึงข้อมูลประมูลที่เปิดใช้งานเท่านั้น
async function getActiveAuctions() {
  const query = `
    SELECT 
      auction_id,
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status,
      is_deleted,
      remark,
      created_dt,
      updated_dt
    FROM auction 
    WHERE is_deleted = 0 AND status IN (1, 2, 3)
    ORDER BY auction_id DESC
  `;

  return await executeQuery(query);
}

// สร้างประมูลใหม่
async function createAuction(auctionData) {
  const {
    name,
    auction_type_id,
    start_dt,
    end_dt,
    reserve_price,
    currency,
    status = 1,
    remark,
  } = auctionData;

  const query = `
    INSERT INTO auction (
      name, 
      auction_type_id, 
      start_dt, 
      end_dt, 
      reserve_price, 
      currency, 
      status, 
      is_deleted,
      remark
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `;

  return await executeQuery(query, [
    name,
    auction_type_id,
    start_dt,
    end_dt,
    reserve_price,
    currency,
    status,
    remark,
  ]);
}

// อัพเดทข้อมูลประมูล
async function updateAuction(auctionId, auctionData) {
  const {
    name,
    auction_type_id,
    start_dt,
    end_dt,
    reserve_price,
    currency,
    status,
    remark,
  } = auctionData;

  const query = `
    UPDATE auction 
    SET 
      name = ?, 
      auction_type_id = ?, 
      start_dt = ?, 
      end_dt = ?, 
      reserve_price = ?, 
      currency = ?, 
      status = ?,
      remark = ?
    WHERE auction_id = ? AND is_deleted = 0
  `;

  return await executeQuery(query, [
    name,
    auction_type_id,
    start_dt,
    end_dt,
    reserve_price,
    currency,
    status,
    remark,
    auctionId,
  ]);
}

// ลบประมูล (soft delete)
async function deleteAuction(auctionId) {
  const query = `
    UPDATE auction 
    SET is_deleted = 1
    WHERE auction_id = ?
  `;

  return await executeQuery(query, [auctionId]);
}

// ค้นหาประมูล
async function searchAuctions(searchTerm) {
  const query = `
    SELECT 
      auction_id,
      name,
      auction_type_id,
      start_dt,
      end_dt,
      reserve_price,
      currency,
      status,
      is_deleted,
      remark,
      created_dt,
      updated_dt
    FROM auction 
    WHERE is_deleted = 0 AND (
      name LIKE ? OR 
      remark LIKE ?
    )
    ORDER BY auction_id DESC
  `;

  const searchPattern = `%${searchTerm}%`;
  return await executeQuery(query, [searchPattern, searchPattern]);
}

// ดึงข้อมูลประเภทประมูลทั้งหมด
async function getAllAuctionTypes() {
  const query = `
    SELECT 
      auction_type_id,
      name,
      description,
      status
    FROM auction_type 
    WHERE status = 1
    ORDER BY auction_type_id ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลผู้เข้าร่วมประมูลทั้งหมด
async function getAllAuctionParticipants() {
  const query = `
    SELECT 
      id,
      auction_id,
      user_id,
      status,
      is_connected,
      joined_dt
    FROM auction_participant 
    WHERE status = 1
    ORDER BY auction_id ASC, joined_dt ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลผู้เข้าร่วมประมูลตาม auction_id
async function getAuctionParticipantsByAuctionId(auctionId) {
  const query = `
    SELECT 
      id,
      auction_id,
      user_id,
      status,
      is_connected,
      joined_dt
    FROM auction_participant 
    WHERE auction_id = ? AND status = 1
    ORDER BY joined_dt ASC
  `;

  return await executeQuery(query, [auctionId]);
}

module.exports = {
  getAllAuctions,
  getAuctionById,
  getActiveAuctions,
  createAuction,
  updateAuction,
  deleteAuction,
  searchAuctions,
  getAllAuctionTypes,
  getAllAuctionParticipants,
  getAuctionParticipantsByAuctionId,
};
