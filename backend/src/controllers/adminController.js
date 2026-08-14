const prisma = require("../config/prisma");

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
      prisma.user.count({ where: { role: "farmer" } }),
      prisma.user.count({ where: { role: "dealer" } }),
      prisma.user.count({ where: { role: "machine_owner" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.machineBooking.count(),
      prisma.machineBooking.count({ where: { status: "PENDING" } }),
      prisma.whatsappSession.count({
        where: {
          updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.whatsAppMessageLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
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
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    
    // Omit passwords
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    const total = await prisma.user.count({ where: filter });

    res.json({
      success: true,
      users: safeUsers,
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
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
    });

    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * body: { role: "farmer"|"dealer"|"machine_owner"|"admin" }
 */
async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/admin/users/:id
 */
async function deleteUser(req, res) {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/whatsapp/sessions
 */
async function getWhatsAppSessions(req, res) {
  try {
    const sessions = await prisma.whatsappSession.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    // If we had a direct relation to User, we'd include it. But here we join manually if needed, or schema can handle it.
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/whatsapp/messages/:phoneNumber
 */
async function getWhatsAppMessages(req, res) {
  try {
    const messages = await prisma.whatsAppMessageLog.findMany({
      where: { phoneNumber: req.params.phoneNumber },
      orderBy: { createdAt: 'asc' },
    });

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

    const bookings = await prisma.machineBooking.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: { select: { name: true } },
        machineOwner: { select: { name: true } }
      }
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/bookings/:id
 */
async function updateBookingStatus(req, res) {
  try {
    const { status, adminNote } = req.body;

    const data = { status };
    if (adminNote) data.adminNote = adminNote;

    const booking = await prisma.machineBooking.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/verifications
 */
async function getPendingVerifications(req, res) {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        role: { in: ["agri_agency", "machine_owner"] },
        isVerified: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        dealerProfile: true,
        machineOwnerProfile: true
      }
    });
    
    const safeUsers = pendingUsers.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    res.json({ success: true, pendingUsers: safeUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/verifications/:id/verify
 */
async function verifyUser(req, res) {
  try {
    const { isVerified } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified },
    });

    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
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
  verifyUser
};