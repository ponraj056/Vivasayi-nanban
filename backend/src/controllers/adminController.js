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
      prisma.users.count({ where: { role: "farmer" } }),
      prisma.users.count({ where: { role: { in: ["dealer", "agri_agency"] } } }),
      prisma.users.count({ where: { role: "machine_owner" } }),
      prisma.users.count({ where: { role: "admin" } }),
      prisma.machine_bookings.count(),
      prisma.machine_bookings.count({ where: { status: "pending" } }),
      prisma.whatsapp_sessions.count({
        where: {
          last_message_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.whatsapp_message_logs.count({
        where: {
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
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

    const users = await prisma.users.findMany({
      where: filter,
      orderBy: { created_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    
    // Omit passwords
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });

    const total = await prisma.users.count({ where: filter });

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
 * body: { is_active: true|false }
 */
async function updateUserStatus(req, res) {
  try {
    const { is_active, isActive } = req.body;
    // accept both isActive and is_active for frontend compatibility
    const targetStatus = is_active !== undefined ? is_active : isActive;
    const user = await prisma.users.update({
      where: { id: req.params.id },
      data: { is_active: targetStatus },
    });

    delete user.password_hash;
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
    const user = await prisma.users.update({
      where: { id: req.params.id },
      data: { role },
    });

    delete user.password_hash;
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
    await prisma.users.delete({
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
    const sessions = await prisma.whatsapp_sessions.findMany({
      orderBy: { last_message_at: 'desc' },
      take: 100,
    });
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
    const messages = await prisma.whatsapp_message_logs.findMany({
      where: { phone_number: req.params.phoneNumber },
      orderBy: { created_at: 'asc' },
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/bookings?status=pending
 */
async function getBookings(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bookings = await prisma.machine_bookings.findMany({
      where: filter,
      orderBy: { created_at: 'desc' },
      include: {
        farmer: { select: { name: true } },
        machine_owner: { select: { name: true } }
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
    if (adminNote) data.admin_note = adminNote;

    const booking = await prisma.machine_bookings.update({
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
    // Agencies pending verification
    const pendingAgencies = await prisma.users.findMany({
      where: {
        role: "agri_agency",
        agency_profile: {
          verification_status: "pending"
        }
      },
      orderBy: { created_at: 'desc' },
      include: {
        agency_profile: true,
      }
    });
    
    // Machine owners inactive (used as pending)
    const pendingMachineOwners = await prisma.users.findMany({
      where: {
        role: "machine_owner",
        is_active: false
      },
      orderBy: { created_at: 'desc' }
    });

    const pendingUsers = [...pendingAgencies, ...pendingMachineOwners];

    const safeUsers = pendingUsers.map(user => {
      const { password_hash, ...safeUser } = user;
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
    const { isVerified } = req.body; // true = approve, false = reject
    
    const user = await prisma.users.findUnique({
      where: { id: req.params.id },
      include: { agency_profile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "agri_agency") {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          is_active: isVerified,
          agency_profile: {
            update: {
              verification_status: isVerified ? "approved" : "rejected"
            }
          }
        }
      });
    } else {
      await prisma.users.update({
        where: { id: user.id },
        data: { is_active: isVerified }
      });
    }

    res.json({ success: true, message: "User verification status updated" });
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