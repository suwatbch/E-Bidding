const express = require('express');
const router = express.Router();
const {
  getAllLanguages,
  getLanguageByCode,
  updateLanguage,
  deleteLanguage,
  getAllLanguageTexts,
  createLanguageText,
  updateLanguageText,
  deleteLanguageText,
} = require('../helper/languageHelper');

// Routes for Languages
// GET /api/languages - ดึงข้อมูลภาษาทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await getAllLanguages();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลภาษาสำเร็จ',
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลภาษา',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getLanguages:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// GET /api/languages/:languageCode - ดึงข้อมูลภาษาตาม language_code
router.get('/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;

    if (!languageCode) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    const result = await getLanguageByCode(languageCode);

    if (result.success) {
      if (result.data.length > 0) {
        res.status(200).json({
          success: true,
          message: 'ดึงข้อมูลภาษาสำเร็จ',
          data: result.data[0],
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'ไม่พบข้อมูลภาษาที่ระบุ',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลภาษา',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getLanguage:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/languages/:languageCode - อัปเดตข้อมูลภาษา
router.post('/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;
    const { language_name, flag, is_default, status } = req.body;

    if (!languageCode) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    if (!language_name) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อภาษา',
      });
    }

    const updateData = {
      language_name,
      flag,
      is_default: is_default || false,
      status: status !== undefined ? status : 1, // รองรับ status field
    };

    const result = await updateLanguage(languageCode, updateData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'อัปเดตข้อมูลภาษาสำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลภาษา',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in editLanguage:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// DELETE /api/languages/:languageCode - ลบภาษา
router.delete('/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;

    if (!languageCode) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    const result = await deleteLanguage(languageCode);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ลบภาษาสำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบภาษา',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in removeLanguage:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// Routes for Language Texts
// GET /api/languages/texts/all - ดึงข้อความแปลทั้งหมด
router.get('/texts/all', async (req, res) => {
  try {
    const result = await getAllLanguageTexts();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลข้อความแปลสำเร็จ',
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความแปล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in getLanguageTexts:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/languages/texts - เพิ่มข้อความแปลใหม่
router.post('/texts', async (req, res) => {
  try {
    const { keyname, language_code, text } = req.body;

    if (!keyname || !language_code || !text) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ keyname, language_code และ text',
      });
    }

    const result = await createLanguageText({
      keyname,
      language_code,
      text,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'เพิ่มข้อความแปลใหม่สำเร็จ',
        data: { id: result.insertId },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการเพิ่มข้อความแปล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in addLanguageText:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// POST /api/languages/texts/:id - อัปเดตข้อความแปล
router.post('/texts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { keyname, language_code, text } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID',
      });
    }

    if (!keyname || !language_code || !text) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ keyname, language_code และ text',
      });
    }

    const result = await updateLanguageText(id, {
      keyname,
      language_code,
      text,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'อัปเดตข้อความแปลสำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อความแปล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in editLanguageText:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

// DELETE /api/languages/texts/:id - ลบข้อความแปล
router.delete('/texts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ ID',
      });
    }

    const result = await deleteLanguageText(id);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'ลบข้อความแปลสำเร็จ',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบข้อความแปล',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in removeLanguageText:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
});

module.exports = router;
