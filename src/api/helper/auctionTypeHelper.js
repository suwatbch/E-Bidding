const { executeQuery } = require('../config/dataconfig');

// ดึงข้อมูลประเภทการประมูลทั้งหมด
async function getAllAuctionTypes() {
  const query = `
    SELECT 
      auction_type_id as id,
      name,
      description,
      status
    FROM auction_type 
    ORDER BY auction_type_id ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลประเภทการประมูลตาม ID
async function getAuctionTypeById(auctionTypeId) {
  const query = `
    SELECT 
      auction_type_id as id,
      name,
      description,
      status
    FROM auction_type 
    WHERE auction_type_id = ?
  `;

  return await executeQuery(query, [auctionTypeId]);
}

// ดึงข้อมูลประเภทการประมูลที่เปิดใช้งานเท่านั้น
async function getActiveAuctionTypes() {
  const query = `
    SELECT 
      auction_type_id as id,
      name,
      description,
      status
    FROM auction_type 
    WHERE status = 1
    ORDER BY auction_type_id ASC
  `;

  return await executeQuery(query);
}

// สร้างประเภทการประมูลใหม่
async function createAuctionType(auctionTypeData) {
  const { name, description, status = 1 } = auctionTypeData;

  const query = `
    INSERT INTO auction_type (name, description, status)
    VALUES (?, ?, ?)
  `;

  return await executeQuery(query, [name, description, status]);
}

// อัพเดทข้อมูลประเภทการประมูล
async function updateAuctionType(auctionTypeId, auctionTypeData) {
  const { name, description, status } = auctionTypeData;

  const query = `
    UPDATE auction_type 
    SET name = ?, description = ?, status = ?
    WHERE auction_type_id = ?
  `;

  return await executeQuery(query, [name, description, status, auctionTypeId]);
}

// ตรวจสอบว่าประเภทการประมูลมีการใช้งานหรือไม่
async function checkAuctionTypeInUse(auctionTypeId) {
  const query = `
    SELECT COUNT(*) as usage_count
    FROM auction 
    WHERE auction_type_id = ? AND status != 0
  `;

  return await executeQuery(query, [auctionTypeId]);
}

// ลบประเภทการประมูล (soft delete)
async function deleteAuctionType(auctionTypeId) {
  try {
    // เช็คก่อนว่าประเภทการประมูลมีการใช้งานหรือไม่
    const checkResult = await checkAuctionTypeInUse(auctionTypeId);

    if (!checkResult.success) {
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบการใช้งาน',
      };
    }

    const usageCount = checkResult.data[0].usage_count;

    if (usageCount > 0) {
      return {
        success: false,
        error: 'ไม่สามารถลบประเภทการประมูลได้ เนื่องจากมีการใช้งานอยู่',
      };
    }

    // ถ้าไม่มีการใช้งาน ให้ทำการลบ (soft delete)
    const query = `
      UPDATE auction_type 
      SET status = 0
      WHERE auction_type_id = ?
    `;

    return await executeQuery(query, [auctionTypeId]);
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ค้นหาประเภทการประมูล
async function searchAuctionTypes(searchTerm) {
  const query = `
    SELECT 
      auction_type_id as id,
      name,
      description,
      status
    FROM auction_type 
    WHERE (name LIKE ? OR description LIKE ?)
    ORDER BY auction_type_id ASC
  `;

  const searchPattern = `%${searchTerm}%`;
  return await executeQuery(query, [searchPattern, searchPattern]);
}

// ตรวจสอบว่า code ซ้ำหรือไม่
async function checkCodeExists(code, excludeId = null) {
  let query = `
    SELECT COUNT(*) as count
    FROM auction_type 
    WHERE code = ?
  `;

  const params = [code];

  if (excludeId) {
    query += ' AND auction_type_id != ?';
    params.push(excludeId);
  }

  return await executeQuery(query, params);
}

module.exports = {
  getAllAuctionTypes,
  getAuctionTypeById,
  getActiveAuctionTypes,
  createAuctionType,
  updateAuctionType,
  deleteAuctionType,
  searchAuctionTypes,
  checkAuctionTypeInUse,
  checkCodeExists,
};
