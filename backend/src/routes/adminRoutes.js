const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getOverviewStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getWhatsAppSessions,
  getWhatsAppMessages,
  getBookings,
  updateBookingStatus,
  getPendingVerifications,
  verifyUser,
} = require("../controllers/adminController");

// Every route here requires a valid JWT AND role === "admin"
router.use(protect, authorize("admin"));

router.get("/stats", getOverviewStats);

router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/whatsapp/sessions", getWhatsAppSessions);
router.get("/whatsapp/messages/:phoneNumber", getWhatsAppMessages);

router.get("/bookings", getBookings);
router.patch("/bookings/:id", updateBookingStatus);

router.get("/verifications", getPendingVerifications);
router.patch("/verifications/:id/verify", verifyUser);

module.exports = router;