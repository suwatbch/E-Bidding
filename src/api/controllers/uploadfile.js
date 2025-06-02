const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = req.body.uploadPath || 'uploads/profile';
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
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = router;
