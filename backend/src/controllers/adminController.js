const User = require("../models/User");
const WhatsAppSession = require("../models/WhatsAppSession");
const WhatsAppMessageLog = require("../models/WhatsAppMessageLog");
const MachineBooking = require("../models/MachineBooking");

/**
 * GET /api/admin/stats
 * High-level counts for the dashboard overview cards.
 */
async function getOverviewStats(req, res) {
  try {
    const [
      totalFarmers,
      totalDealers,
      totalMachineOwners,
      totalAdmins,
      totalBookings,
      pendingBookings,
      activeSessions,
      messagesLast7Days,
    ] = await Promise.all([
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "dealer" }),
      User.countDocuments({ role: "machineOwner" }),
      User.countDocuments({ role: "admin" }),
      MachineBooking.countDocuments(),
      MachineBooking.countDocuments({ status: "PENDING" }),
      WhatsAppSession.countDocuments({
        lastMessageAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      WhatsAppMessageLog.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          farmers: totalFarmers,
          dealers: totalDealers,
          machineOwners: totalMachineOwners,
          admins: totalAdmins,
          total: totalFarmers + totalDealers + totalMachineOwners + totalAdmins,
        },
        bookings: { total: totalBookings, pending: pendingBookings },
        whatsapp: {
          activeSessions24h: activeSessions,
          messagesLast7Days,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/users?role=farmer&search=ram&page=1&limit=20
 */
async function getUsers(req, res) {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/users/:id/status
 * body: { isActive: true|false }
 */
async function updateUserStatus(req, res) {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/whatsapp/sessions
 * List all active WhatsApp conversation sessions.
 */
async function getWhatsAppSessions(req, res) {
  try {
    const sessions = await WhatsAppSession.find()
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .populate("user", "name role");

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/whatsapp/messages/:phoneNumber
 * Full chat history for one farmer's number.
 */
async function getWhatsAppMessages(req, res) {
  try {
    const messages = await WhatsAppMessageLog.find({
      phoneNumber: req.params.phoneNumber,
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/bookings?status=PENDING
 */
async function getBookings(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bookings = await MachineBooking.find(filter)
      .sort({ createdAt: -1 })
      .populate("farmer", "name")
      .populate("machineOwner", "name");

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/bookings/:id
 * body: { status: "APPROVED"|"REJECTED"|"COMPLETED", adminNote }
 */
async function updateBookingStatus(req, res) {
  try {
    const { status, adminNote } = req.body;

    const booking = await MachineBooking.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNote && { adminNote }) },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getOverviewStats,
  getUsers,
  updateUserStatus,
  getWhatsAppSessions,
  getWhatsAppMessages,
  getBookings,
  updateBookingStatus,
};