const express = require("express");
const router = express.Router();
const { register, verifyOTP, resendOTP, forgotPassword, resetPassword, login, getMe, getDashboard } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/dashboard", protect, getDashboard);

// Role-specific protected routes (example)
router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ success: true, message: "Admin access confirmed" });
});

router.get("/farmer-dealer", protect, authorize("farmer", "dealer"), (req, res) => {
  res.json({ success: true, message: "Farmer or Dealer access confirmed" });
});

module.exports = router;
