const { executeQuery, getConnection } = require('../config/dataconfig');
const { formatDateTimeUTCToDb } = require('../globalFunction');

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
      remark,
      created_dt,
      updated_dt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, now(), now())
  `;

  const result = await executeQuery(query, [
    name,
    auction_type_id,
    formatDateTimeUTCToDb(start_dt),
    formatDateTimeUTCToDb(end_dt),
    reserve_price,
    currency,
    status,
    remark,
  ]);

  // เพิ่ม auction_id ใน response data
  if (result.success && result.data && result.data.insertId) {
    result.data = { auction_id: result.data.insertId };
  }

  return result;
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
      remark = ?,
    WHERE auction_id = ? AND is_deleted = 0
  `;

  return await executeQuery(query, [
    name,
    auction_type_id,
    formatDateTimeUTCToDb(start_dt),
    formatDateTimeUTCToDb(end_dt),
    reserve_price,
    currency,
    status,
    remark,
    auctionId,
  ]);
}

// ลบประมูล (hard delete) - ลบจากทั้ง 3 ตาราง
async function deleteAuction(auctionId) {
  let connection;

  try {
    // สร้าง connection สำหรับ transaction
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. ลบรายการประมูล (auction_item)
    const deleteItemsQuery = `
      DELETE FROM auction_item 
      WHERE auction_id = ?
    `;
    await connection.execute(deleteItemsQuery, [auctionId]);

    // 2. ลบผู้เข้าร่วมประมูล (auction_participant)
    const deleteParticipantsQuery = `
      DELETE FROM auction_participant 
      WHERE auction_id = ?
    `;
    await connection.execute(deleteParticipantsQuery, [auctionId]);

    // 3. ลบตลาดประมูล (auction)
    const deleteAuctionQuery = `
      DELETE FROM auction 
      WHERE auction_id = ?
    `;
    await connection.execute(deleteAuctionQuery, [auctionId]);

    // Commit transaction
    await connection.commit();

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    // Rollback transaction ถ้าเกิดข้อผิดพลาด
    if (connection) {
      await connection.rollback();
    }

    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการลบประมูล',
    };
  } finally {
    // ปิด connection
    if (connection) {
      await connection.release();
    }
  }
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
      company_id,
      status,
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
      company_id,
      status,
      joined_dt
    FROM auction_participant 
    WHERE auction_id = ? AND status = 1
    ORDER BY joined_dt ASC
  `;

  return await executeQuery(query, [auctionId]);
}

// เพิ่มผู้เข้าร่วมประมูล
async function createAuctionParticipant(participantData) {
  const { auction_id, user_id, company_id = 0, status = 1 } = participantData;

  const query = `
    INSERT INTO auction_participant (
      auction_id,
      user_id,
      company_id,
      status,
      joined_dt
    )
    VALUES (?, ?, ?, ?, now())
  `;

  return await executeQuery(query, [auction_id, user_id, company_id, status]);
}

// อัพเดทข้อมูลผู้เข้าร่วมประมูล
async function updateAuctionParticipant(participantId, participantData) {
  const { company_id, status } = participantData;

  const query = `
    UPDATE auction_participant 
    SET 
      company_id = ?,
      status = ?
    WHERE id = ?
  `;

  return await executeQuery(query, [company_id, status, participantId]);
}

// ลบผู้เข้าร่วมประมูล (soft delete)
async function deleteAuctionParticipant(participantId) {
  const query = `
    UPDATE auction_participant 
    SET status = 0
    WHERE id = ?
  `;

  return await executeQuery(query, [participantId]);
}

// เพิ่มผู้เข้าร่วมประมูลหลายคนพร้อมกัน
async function createMultipleAuctionParticipants(auctionId, participants) {
  const values = participants.map((p) => [
    auctionId,
    p.user_id,
    p.company_id || 0,
    p.status || 1,
  ]);

  const placeholders = participants.map(() => '(?, ?, ?, ?, now())').join(', ');
  const flatValues = values.flat();

  const query = `
    INSERT INTO auction_participant (
      auction_id,
      user_id,
      company_id,
      status,
      joined_dt
    )
    VALUES ${placeholders}
  `;

  return await executeQuery(query, flatValues);
}

// สร้างประมูลใหม่พร้อมผู้เข้าร่วม (Transaction)
async function createAuctionWithParticipants(auctionData, participants, items) {
  let connection;

  try {
    // สร้าง connection สำหรับ transaction
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. สร้าง auction ใหม่
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

    const auctionQuery = `
      INSERT INTO auction (
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, now(), now())
    `;
    const [auctionResult] = await connection.execute(auctionQuery, [
      name,
      auction_type_id,
      formatDateTimeUTCToDb(start_dt),
      formatDateTimeUTCToDb(end_dt),
      reserve_price,
      currency,
      status,
      remark,
    ]);

    const auctionId = auctionResult.insertId;

    // 2. เพิ่มผู้เข้าร่วมประมูล (ถ้ามี)
    if (participants && participants.length > 0) {
      const values = participants.map((p) => [
        auctionId,
        p.user_id,
        p.company_id || 0,
        p.status || 1,
      ]);

      const placeholders = participants
        .map(() => '(?, ?, ?, ?, now())')
        .join(', ');
      const flatValues = values.flat();

      const participantQuery = `
        INSERT INTO auction_participant (
          auction_id,
          user_id,
          company_id,
          status,
          joined_dt
        )
        VALUES ${placeholders}
      `;

      await connection.execute(participantQuery, flatValues);
    }

    // 3. เพิ่มรายการประมูล (ถ้ามี)
    if (items && items.length > 0) {
      const itemValues = items.map((item) => [
        auctionId,
        item.item_name,
        item.description || '',
        item.quantity,
        item.unit || '',
        item.base_price,
        item.status || 1,
      ]);

      const itemPlaceholders = items
        .map(() => '(?, ?, ?, ?, ?, ?, ?)')
        .join(', ');
      const flatItemValues = itemValues.flat();

      const itemQuery = `
        INSERT INTO auction_item (
          auction_id,
          item_name,
          description,
          quantity,
          unit,
          base_price,
          status
        )
        VALUES ${itemPlaceholders}
      `;

      await connection.execute(itemQuery, flatItemValues);
    }

    // Commit transaction
    await connection.commit();

    return {
      success: true,
      data: { auction_id: auctionId },
      message: null,
    };
  } catch (error) {
    // Rollback transaction ถ้าเกิดข้อผิดพลาด
    if (connection) {
      await connection.rollback();
    }

    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการสร้างประมูลและผู้เข้าร่วม',
    };
  } finally {
    // ปิด connection
    if (connection) {
      await connection.release(); // ใช้ release() แทน end() สำหรับ pooled connection
    }
  }
}

// อัปเดตประมูลพร้อมผู้เข้าร่วม (Smart Update)
async function updateAuctionWithParticipants(
  auctionId,
  auctionData,
  participants,
  items
) {
  let connection;

  try {
    // สร้าง connection สำหรับ transaction
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. อัปเดต auction (เสมอ) - ใช้แบบเดียวกับ updateAuction
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

    const auctionQuery = `
    UPDATE auction 
    SET 
      name = ?, 
      auction_type_id = ?, 
      start_dt = ?, 
      end_dt = ?, 
      reserve_price = ?, 
      currency = ?, 
      status = ?,
      remark = ?,
      updated_dt = now()
    WHERE auction_id = ? AND is_deleted = 0
  `;

    await connection.execute(auctionQuery, [
      name,
      auction_type_id,
      formatDateTimeUTCToDb(start_dt),
      formatDateTimeUTCToDb(end_dt),
      reserve_price,
      currency,
      status,
      remark,
      auctionId,
    ]);

    // 2. Smart Update: Participants
    if (participants && participants.length > 0) {
      // เก็บ ID ของ participants ที่ส่งมา (สำหรับ UPDATE)
      const participantIdsToKeep = participants
        .filter((p) => p.id && p.id > 0)
        .map((p) => p.id);

      // ลบ participants เดิมที่ไม่อยู่ในรายการใหม่
      if (participantIdsToKeep.length > 0) {
        const deleteOldParticipantsQuery = `
          DELETE FROM auction_participant 
          WHERE auction_id = ? AND id NOT IN (${participantIdsToKeep
            .map(() => '?')
            .join(', ')})
        `;
        await connection.execute(deleteOldParticipantsQuery, [
          auctionId,
          ...participantIdsToKeep,
        ]);
      } else {
        // ถ้าไม่มี participants เดิม ให้ลบทั้งหมด
        const deleteAllParticipantsQuery = `
          DELETE FROM auction_participant 
          WHERE auction_id = ?
        `;
        await connection.execute(deleteAllParticipantsQuery, [auctionId]);
      }

      // ประมวลผล participants แต่ละคน
      for (const participant of participants) {
        if (participant.id && participant.id > 0) {
          // UPDATE existing participant
          const updateParticipantQuery = `
            UPDATE auction_participant 
            SET 
              user_id = ?,
              company_id = ?,
              status = ?
            WHERE id = ? AND auction_id = ?
          `;

          await connection.execute(updateParticipantQuery, [
            participant.user_id,
            participant.company_id || 0,
            participant.status || 1,
            participant.id,
            auctionId,
          ]);
        } else {
          // INSERT new participant
          const insertParticipantQuery = `
            INSERT INTO auction_participant (
              auction_id,
              user_id,
              company_id,
              status,
              joined_dt
            )
            VALUES (?, ?, ?, ?, now())
          `;

          await connection.execute(insertParticipantQuery, [
            auctionId,
            participant.user_id,
            participant.company_id || 0,
            participant.status || 1,
          ]);
        }
      }
    } else {
      // ถ้าไม่มี participants ส่งมา ให้ลบทั้งหมด
      const deleteAllParticipantsQuery = `
        DELETE FROM auction_participant 
        WHERE auction_id = ?
      `;
      await connection.execute(deleteAllParticipantsQuery, [auctionId]);
    }

    // 3. Smart Update: Items (เหมือนกับ Participants)
    if (items && items.length > 0) {
      // เก็บ ID ของ items ที่ส่งมา (สำหรับ UPDATE)
      const itemIdsToKeep = items
        .filter((item) => item.item_id && item.item_id > 0)
        .map((item) => item.item_id);

      // ลบ items เดิมที่ไม่อยู่ในรายการใหม่
      if (itemIdsToKeep.length > 0) {
        const deleteOldItemsQuery = `
          DELETE FROM auction_item 
          WHERE auction_id = ? AND item_id NOT IN (${itemIdsToKeep
            .map(() => '?')
            .join(', ')})
        `;
        await connection.execute(deleteOldItemsQuery, [
          auctionId,
          ...itemIdsToKeep,
        ]);
      } else {
        // ถ้าไม่มี items เดิม ให้ลบทั้งหมด
        const deleteAllItemsQuery = `
          DELETE FROM auction_item 
          WHERE auction_id = ?
        `;
        await connection.execute(deleteAllItemsQuery, [auctionId]);
      }

      // ประมวลผล items แต่ละรายการ
      for (const item of items) {
        if (item.item_id && item.item_id > 0) {
          // UPDATE existing item
          const updateItemQuery = `
            UPDATE auction_item 
            SET 
              item_name = ?,
              description = ?,
              quantity = ?,
              unit = ?,
              base_price = ?,
              status = ?
            WHERE item_id = ? AND auction_id = ?
          `;

          await connection.execute(updateItemQuery, [
            item.item_name,
            item.description || '',
            item.quantity,
            item.unit || '',
            item.base_price,
            item.status || 1,
            item.item_id,
            auctionId,
          ]);
        } else {
          // INSERT new item
          const insertItemQuery = `
            INSERT INTO auction_item (
              auction_id,
              item_name,
              description,
              quantity,
              unit,
              base_price,
              status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          await connection.execute(insertItemQuery, [
            auctionId,
            item.item_name,
            item.description || '',
            item.quantity,
            item.unit || '',
            item.base_price,
            item.status || 1,
          ]);
        }
      }
    } else {
      // ถ้าไม่มี items ส่งมา ให้ลบทั้งหมด
      const deleteAllItemsQuery = `
        DELETE FROM auction_item 
        WHERE auction_id = ?
      `;
      await connection.execute(deleteAllItemsQuery, [auctionId]);
    }

    // Commit transaction
    await connection.commit();

    return {
      success: true,
      data: { auction_id: auctionId },
      message: null,
    };
  } catch (error) {
    // Rollback transaction ถ้าเกิดข้อผิดพลาด
    if (connection) {
      await connection.rollback();
    }

    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตประมูลและผู้เข้าร่วม',
    };
  } finally {
    // ปิด connection
    if (connection) {
      await connection.release(); // ใช้ release() แทน end() สำหรับ pooled connection
    }
  }
}

// ดึงข้อมูลผู้เข้าร่วมของตลาดประมูลพร้อมรายละเอียด
async function getAuctionParticipantsWithDetails(auctionId) {
  const query = `
    SELECT 
      ap.*,
      u.fullname as user_name,
      u.email as user_email,
      c.name as company_name
    FROM auction_participant ap
    LEFT JOIN users u ON ap.user_id = u.user_id
    LEFT JOIN company c ON ap.company_id = c.company_id
    WHERE ap.auction_id = ? AND ap.status > 0
    ORDER BY ap.joined_dt
  `;

  return await executeQuery(query, [auctionId]);
}

// ดึงข้อมูลรายการสินค้าของตลาดประมูล
async function getAuctionItems(auctionId) {
  const query = `
    SELECT *
    FROM auction_item 
    WHERE auction_id = ? AND status > 0
    ORDER BY item_id
  `;

  return await executeQuery(query, [auctionId]);
}

// ตรวจสอบว่า user เป็น participant ของ auction หรือไม่
async function isUserAuctionParticipant(auctionId, userId, companyId = null) {
  let query = `
    SELECT COUNT(*) as count
    FROM auction_participant 
    WHERE auction_id = ? AND user_id = ? AND status > 0
  `;

  let params = [auctionId, userId];

  // ถ้ามี companyId ให้เช็คด้วย
  if (companyId !== null && companyId !== undefined) {
    query += ` AND company_id = ?`;
    params.push(companyId);
  }

  try {
    const result = await executeQuery(query, params);
    return result.success && result.data && result.data[0].count > 0;
  } catch (error) {
    console.error('Error checking if user is participant:', error);
    return false;
  }
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
  createAuctionParticipant,
  updateAuctionParticipant,
  deleteAuctionParticipant,
  createMultipleAuctionParticipants,
  createAuctionWithParticipants,
  updateAuctionWithParticipants,
  getAuctionParticipantsWithDetails,
  getAuctionItems,
  isUserAuctionParticipant,
};
