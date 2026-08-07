const express = require('express');
const { getFarmers, getFarmerById, updateFarmer, deleteFarmer } = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.use(authorize('admin', 'agri_officer'));
router.route('/').get(getFarmers);
router.route('/:id').get(getFarmerById).put(updateFarmer).delete(deleteFarmer);
module.exports = router;
