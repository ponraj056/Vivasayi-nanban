const express = require('express');
const { getBroadcasts, createBroadcast } = require('../controllers/broadcastController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.use(authorize('admin', 'agri_agency'));
router.route('/').get(getBroadcasts).post(createBroadcast);
module.exports = router;
