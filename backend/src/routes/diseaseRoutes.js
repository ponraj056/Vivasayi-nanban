const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { detectDisease, getDiseaseReports } = require('../controllers/diseaseController');
const { protect } = require('../middleware/auth');
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

// Assuming farmer token is passed manually or via protect middleware? 
// The original code in DiseaseCheck.jsx didn't send token!
// Let's make detectDisease use token if available, but for now we'll just allow it without protect, or use a custom middleware that doesn't fail if no token.
// Actually, I'll apply `protect` to `getDiseaseReports` and let `detectDisease` check `req.user` optionally, but `protect` throws if no token. Wait, I will use `protect` for `/reports`.
router.post('/detect', upload.single('image'), protect, detectDisease);
router.get('/reports', protect, getDiseaseReports);
module.exports = router;
