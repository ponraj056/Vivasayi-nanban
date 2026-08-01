const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  browseMachines,
  getMachineById,
  bookMachine,
  getMyBookings,
  createMachine,
  getMyMachines,
  updateMachine,
  getOwnerBookings,
  respondToBooking,
} = require("../controllers/machineController");

router.post("/", protect, authorize("machineOwner"), createMachine);
router.get("/owner/mine", protect, authorize("machineOwner"), getMyMachines);
router.get("/owner/bookings", protect, authorize("machineOwner"), getOwnerBookings);
router.patch("/owner/bookings/:id", protect, authorize("machineOwner"), respondToBooking);
router.patch("/:id", protect, authorize("machineOwner"), updateMachine);

router.get("/bookings/mine", protect, authorize("farmer"), getMyBookings);
router.post("/:id/book", protect, authorize("farmer"), bookMachine);

router.get("/", protect, browseMachines);
router.get("/:id", protect, getMachineById);

module.exports = router;