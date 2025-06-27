// =============================================================================
// API GLOBAL FUNCTIONS
// =============================================================================

/**
 * ฟังก์ชันแปลง datetime สำหรับ MySQL (Thailand timezone)
 * @param {string|Date} dateTime - วันที่เวลาที่ต้องการแปลง
 * @param {number} timezone - ระยะเวลาที่ต้องการแปลง (default: 0)
 * @returns {string|null} - datetime string ในรูปแบบ MySQL หรือ null
 */
function formatDateTimeUTCToDb(dateTime, timezone = 0) {
  if (!dateTime) return null;

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return null;

    const thailandTime = new Date(date.getTime() + timezone * 60 * 60 * 1000);

    // แปลงเป็น MySQL datetime format: YYYY-MM-DD HH:mm:ss
    const year = thailandTime.getUTCFullYear();
    const month = String(thailandTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(thailandTime.getUTCDate()).padStart(2, '0');
    const hours = String(thailandTime.getUTCHours()).padStart(2, '0');
    const minutes = String(thailandTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(thailandTime.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return null;
  }
}

/**
 * สร้าง current datetime string สำหรับ MySQL (Thailand timezone)
 * @returns {string} - datetime string ในรูปแบบ MySQL
 */
function getDateTimeUTCNow() {
  return formatDateTimeUTCToDb(new Date(), 0);
}

/**
 * แปลง datetime จากฐานข้อมูล (UTC) เป็น timezone ที่ระบุ
 * @param {string} dateTime - datetime string จากฐานข้อมูล (รูปแบบ: YYYY-MM-DD HH:mm:ss)
 * @param {number} timezone - timezone offset เป็นชั่วโมง (default: 0 สำหรับ UTC)
 * @returns {string|null} - datetime string ในรูปแบบ ISO หรือ null
 */
function formatDateTimeUTCFromDb(dateTime, timezone = 0) {
  if (!dateTime) return null;

  try {
    // แปลง MySQL datetime เป็น Date object (สมมติว่าเป็น UTC)
    let dateString = dateTime;

    // หากไม่มี timezone identifier ให้เพิ่ม 'Z' เพื่อระบุว่าเป็น UTC
    if (typeof dateString === 'string' && !dateString.includes('T')) {
      dateString = dateString.replace(' ', 'T') + 'Z';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    // ปรับเวลาตาม timezone
    const adjustedTime = new Date(date.getTime() + timezone * 60 * 60 * 1000);

    // แปลงเป็น ISO format พร้อม timezone offset
    const year = adjustedTime.getUTCFullYear();
    const month = String(adjustedTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(adjustedTime.getUTCDate()).padStart(2, '0');
    const hours = String(adjustedTime.getUTCHours()).padStart(2, '0');
    const minutes = String(adjustedTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(adjustedTime.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting datetime from DB:', error);
    return null;
  }
}

module.exports = {
  formatDateTimeUTCToDb,
  getDateTimeUTCNow,
  formatDateTimeUTCFromDb,
};
