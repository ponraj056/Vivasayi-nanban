const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { detectDisease } = require('../controllers/diseaseController');

const router = express.Router();

// Configure multer for local storage
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/detect', upload.single('image'), detectDisease);

module.exports = router;
