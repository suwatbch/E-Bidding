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
        message: null,
        data: result.data,
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

// GET /api/languages/:languageCode - ดึงข้อมูลภาษาตาม language_code
router.get('/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;

    if (!languageCode) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    const result = await getLanguageByCode(languageCode);

    if (result.success) {
      if (result.data.length > 0) {
        res.status(200).json({
          success: true,
          message: null,
          data: result.data[0],
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'ไม่พบข้อมูลภาษาที่ระบุ',
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

// POST /api/languages/update/:languageCode - อัปเดตข้อมูลภาษา
router.post('/update/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;
    const { language_name, flag, is_default, status } = req.body;

    if (!languageCode) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    if (!language_name) {
      return res.status(200).json({
        success: true,
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

// POST /api/languages/delete/:languageCode - ลบภาษา
router.post('/delete/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;

    if (!languageCode) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุรหัสภาษา',
      });
    }

    const result = await deleteLanguage(languageCode);

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

// Routes for Language Texts
// GET /api/languages/texts/all - ดึงข้อความแปลทั้งหมด
router.get('/texts/all', async (req, res) => {
  try {
    const result = await getAllLanguageTexts();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: null,
        data: result.data,
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

// POST /api/languages/texts - เพิ่มข้อความแปลใหม่
router.post('/texts', async (req, res) => {
  try {
    const { keyname, language_code, text } = req.body;

    if (!keyname || !language_code || !text) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ keyname, language_code และ text',
      });
    }

    const result = await createLanguageText({
      keyname,
      language_code,
      text,
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

// POST /api/languages/texts/update/:id - อัปเดตข้อความแปล
router.post('/texts/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { keyname, language_code, text } = req.body;

    if (!id) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID',
      });
    }

    if (!keyname || !language_code || !text) {
      return res.status(200).json({
        success: true,
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

// POST /api/languages/texts/delete/:id - ลบข้อความแปล
router.post('/texts/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(200).json({
        success: true,
        message: 'กรุณาระบุ ID',
      });
    }

    const result = await deleteLanguageText(id);

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

module.exports = router;
