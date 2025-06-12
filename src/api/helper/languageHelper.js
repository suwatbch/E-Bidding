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

// อัปเดตข้อมูลภาษา
async function updateLanguage(languageCode, languageData) {
  const { language_name, flag, is_default, status } = languageData;

  const query = `
    UPDATE language 
    SET 
      language_name = ?,
      flag = ?,
      is_default = ?,
      status = ?
    WHERE language_code = ?
  `;

  return await executeQuery(query, [
    language_name,
    flag,
    is_default ? 1 : 0,
    status !== undefined ? status : 1,
    languageCode,
  ]);
}

// ลบภาษา (soft delete)
async function deleteLanguage(languageCode) {
  const query = `UPDATE language SET status = 0 WHERE language_code = ?`;
  return await executeQuery(query, [languageCode]);
}

// ดึงข้อความแปลทั้งหมด
async function getAllLanguageTexts() {
  const query = `
    SELECT 
      id,
      keyname,
      language_code,
      text
    FROM language_text
    ORDER BY keyname ASC, language_code ASC
  `;

  return await executeQuery(query);
}

// เพิ่มข้อความแปลใหม่
async function createLanguageText(textData) {
  const { keyname, language_code, text } = textData;
  const query = `INSERT INTO language_text (keyname, language_code, text) VALUES (?, ?, ?)`;

  return await executeQuery(query, [keyname, language_code, text]);
}

// อัปเดตข้อความแปล
async function updateLanguageText(id, textData) {
  const { keyname, language_code, text } = textData;
  const query = `UPDATE language_text SET keyname = ?, language_code = ?, text = ? WHERE id = ?`;

  return await executeQuery(query, [keyname, language_code, text, id]);
}

// ลบข้อความแปล
async function deleteLanguageText(id) {
  const query = `DELETE FROM language_text WHERE id = ?`;
  return await executeQuery(query, [id]);
}

module.exports = {
  getAllLanguages,
  getLanguageByCode,
  updateLanguage,
  deleteLanguage,
  getAllLanguageTexts,
  createLanguageText,
  updateLanguageText,
  deleteLanguageText,
};
