const { executeQuery } = require('../config/dataconfig');

// ดึงข้อมูลภาษาทั้งหมด
async function getAllLanguages() {
  const query = `
    SELECT 
      language_code,
      language_name,
      flag,
      is_default,
      status
    FROM language 
    WHERE status = 1 
    ORDER BY is_default DESC, language_name ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อมูลภาษาตาม language_code
async function getLanguageByCode(languageCode) {
  const query = `
    SELECT 
      language_code,
      language_name,
      flag,
      is_default,
      status
    FROM language 
    WHERE language_code = ? AND status = 1
  `;

  return await executeQuery(query, [languageCode]);
}

// เพิ่มภาษาใหม่
async function createLanguage(languageData) {
  const {
    language_code,
    language_name,
    flag,
    is_default = false,
  } = languageData;

  // ถ้าเป็นภาษาเริ่มต้น ให้อัปเดตภาษาอื่นให้ไม่เป็นเริ่มต้น
  if (is_default) {
    await executeQuery('UPDATE language SET is_default = FALSE');
  }

  const query = `
    INSERT INTO language (language_code, language_name, flag, is_default, status)
    VALUES (?, ?, ?, ?, 1)
  `;

  return await executeQuery(query, [
    language_code,
    language_name,
    flag,
    is_default,
  ]);
}

// อัปเดตข้อมูลภาษา
async function updateLanguage(languageCode, languageData) {
  const { language_name, flag, is_default } = languageData;

  // ถ้าเป็นภาษาเริ่มต้น ให้อัปเดตภาษาอื่นให้ไม่เป็นเริ่มต้น
  if (is_default) {
    await executeQuery('UPDATE language SET is_default = FALSE');
  }

  const query = `
    UPDATE language 
    SET language_name = ?, flag = ?, is_default = ?
    WHERE language_code = ?
  `;

  return await executeQuery(query, [
    language_name,
    flag,
    is_default,
    languageCode,
  ]);
}

// ลบภาษา (soft delete)
async function deleteLanguage(languageCode) {
  const query = `
    UPDATE language 
    SET status = 0 
    WHERE language_code = ?
  `;

  return await executeQuery(query, [languageCode]);
}

// ดึงข้อความแปลทั้งหมด
async function getAllLanguageTexts() {
  const query = `
    SELECT 
      lt.id,
      lt.keyname,
      lt.language_code,
      lt.text,
      l.language_name
    FROM language_text lt
    INNER JOIN language l ON lt.language_code = l.language_code
    WHERE l.status = 1
    ORDER BY lt.keyname ASC, lt.language_code ASC
  `;

  return await executeQuery(query);
}

// ดึงข้อความแปลตาม keyname
async function getLanguageTextsByKey(keyname) {
  const query = `
    SELECT 
      lt.id,
      lt.keyname,
      lt.language_code,
      lt.text,
      l.language_name
    FROM language_text lt
    INNER JOIN language l ON lt.language_code = l.language_code
    WHERE lt.keyname = ? AND l.status = 1
    ORDER BY lt.language_code ASC
  `;

  return await executeQuery(query, [keyname]);
}

// ดึงข้อความแปลตามภาษา
async function getLanguageTextsByLanguage(languageCode) {
  const query = `
    SELECT 
      id,
      keyname,
      language_code,
      text
    FROM language_text
    WHERE language_code = ?
    ORDER BY keyname ASC
  `;

  return await executeQuery(query, [languageCode]);
}

// เพิ่มข้อความแปลใหม่
async function createLanguageText(textData) {
  const { keyname, language_code, text } = textData;

  const query = `
    INSERT INTO language_text (keyname, language_code, text)
    VALUES (?, ?, ?)
  `;

  return await executeQuery(query, [keyname, language_code, text]);
}

// อัปเดตข้อความแปล
async function updateLanguageText(id, textData) {
  const { keyname, language_code, text } = textData;

  const query = `
    UPDATE language_text 
    SET keyname = ?, language_code = ?, text = ?
    WHERE id = ?
  `;

  return await executeQuery(query, [keyname, language_code, text, id]);
}

// ลบข้อความแปล
async function deleteLanguageText(id) {
  const query = `
    DELETE FROM language_text 
    WHERE id = ?
  `;

  return await executeQuery(query, [id]);
}

// ดึงข้อความแปลในรูปแบบ grouped สำหรับ frontend
async function getGroupedLanguageTexts() {
  const query = `
    SELECT 
      lt.keyname,
      lt.language_code,
      lt.text
    FROM language_text lt
    INNER JOIN language l ON lt.language_code = l.language_code
    WHERE l.status = 1
    ORDER BY lt.keyname ASC, lt.language_code ASC
  `;

  const result = await executeQuery(query);

  if (result.success) {
    // จัดกลุ่มข้อมูลตาม keyname
    const grouped = {};
    result.data.forEach((item) => {
      if (!grouped[item.keyname]) {
        grouped[item.keyname] = {};
      }
      grouped[item.keyname][item.language_code] = item.text;
    });

    return { success: true, data: grouped };
  }

  return result;
}

module.exports = {
  getAllLanguages,
  getLanguageByCode,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getAllLanguageTexts,
  getLanguageTextsByKey,
  getLanguageTextsByLanguage,
  createLanguageText,
  updateLanguageText,
  deleteLanguageText,
  getGroupedLanguageTexts,
};
