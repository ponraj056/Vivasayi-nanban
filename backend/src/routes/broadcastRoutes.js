const express = require('express');
const { getBroadcasts, createBroadcast } = require('../controllers/broadcastController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBroadcasts)
  .post(createBroadcast);

module.exports = router;
