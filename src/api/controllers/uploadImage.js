const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = req.body.uploadPath || 'uploads/';
    const fullPath = path.join(process.cwd(), 'public', uploadPath);
    
    try {
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // ใช้ชื่อไฟล์ที่ส่งมา หรือสร้างชื่อใหม่ถ้าไม่มี
    const fileName = req.body.fileName || `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// กำหนดการ filter ไฟล์
const fileFilter = (req, file, cb) => {
  // รับเฉพาะไฟล์รูปภาพ
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ที่ 5MB
  }
});

// Route สำหรับอัพโหลดรูปภาพ
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const uploadPath = req.body.uploadPath || 'uploads/';
    const fileName = req.file.filename;
    const fileUrl = `${uploadPath}${fileName}`;

    res.json({
      success: true,
      imageUrl: fileUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
});

// Route สำหรับลบรูปภาพ
router.delete('/', async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      throw new Error('File path is required');
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error deleting file'
    });
  }
});

module.exports = router;
