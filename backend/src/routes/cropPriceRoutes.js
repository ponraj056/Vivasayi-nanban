const express = require("express");
const router = express.Router();
const cropPriceController = require("../controllers/cropPriceController");
const { protect, authorize } = require("../middleware/auth");

// Public (or user-facing) route to view prices
router.get("/", cropPriceController.getCropPrices);

// Admin route to add prices
router.post("/", protect, authorize("admin"), cropPriceController.addCropPrice);

module.exports = router;
