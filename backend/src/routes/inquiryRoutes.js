const express = require('express');
const { getInquiries, createInquiry, respondInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.route('/').get(getInquiries).post(createInquiry);
router.route('/:id/respond').put(respondInquiry);
module.exports = router;
