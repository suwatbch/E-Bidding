// =============================================================================
// API GLOBAL FUNCTIONS
// =============================================================================

/**
 * ฟังก์ชันแปลง datetime สำหรับ MySQL (Thailand timezone)
 * @param {string|Date} dateTime - วันที่เวลาที่ต้องการแปลง
 * @returns {string|null} - datetime string ในรูปแบบ MySQL หรือ null
 */
function formatDateTimeForMySQL(dateTime) {
  if (!dateTime) return null;

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return null;

    // ปรับเป็นเวลาไทย (UTC+7)
    const thailandTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

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
function getCurrentDateTimeForMySQL() {
  return formatDateTimeForMySQL(new Date());
}

module.exports = {
  formatDateTimeForMySQL,
  getCurrentDateTimeForMySQL,
};
