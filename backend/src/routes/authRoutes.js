const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Example Role-specific protected routes for testing authorization
router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ success: true, message: "Admin access confirmed" });
});

router.get("/farmer-dealer", protect, authorize("farmer", "dealer"), (req, res) => {
  res.json({ success: true, message: "Farmer or Dealer access confirmed" });
});

module.exports = router;
