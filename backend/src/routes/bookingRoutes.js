const express = require('express');
const { getBookings, createBooking, acceptBooking, rejectBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.route('/').get(getBookings).post(createBooking);
router.route('/:id/accept').put(acceptBooking);
router.route('/:id/reject').put(rejectBooking);
module.exports = router;
