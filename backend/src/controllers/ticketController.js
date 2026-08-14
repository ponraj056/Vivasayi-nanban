const prisma = require("../config/prisma");

// Get all tickets
exports.getTickets = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    if (userRole === "farmer") {
      filter.farmerId = req.user.id;
    } else if (userRole === "agri_officer") {
      // Agri officer sees all open tickets in their district, or tickets assigned to them
      // For simplicity, returning all or filtering by district later
    }

    const tickets = await prisma.supportTicket.findMany({
      where: filter,
      include: {
        farmer: { select: { name: true, phone: true } },
        assignedOfficer: { select: { name: true, phone: true } },
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single ticket
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: { select: { name: true, phone: true } },
        assignedOfficer: { select: { name: true, phone: true } },
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new ticket (by Farmer)
exports.createTicket = async (req, res) => {
  try {
    const { initialMessage } = req.body;

    const ticket = await prisma.supportTicket.create({
      data: {
        farmerId: req.user.id,
        messages: {
          create: {
            sender: "farmer",
            text: initialMessage,
          }
        }
      },
      include: {
        messages: true
      }
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update ticket (Add reply by officer or farmer)
exports.updateTicket = async (req, res) => {
  try {
    const { replyText, status } = req.body;
    
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id }
    });

    if (!existingTicket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const data = {};
    if (status) data.status = status;

    // Auto-assign officer if first reply
    if (req.user.role === "agri_officer" && !existingTicket.assignedOfficerId) {
      data.assignedOfficerId = req.user.id;
    }

    if (replyText) {
      data.messages = {
        create: {
          sender: req.user.role === "farmer" ? "farmer" : "agri_officer",
          text: replyText
        }
      };
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data,
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        },
        farmer: { select: { name: true, phone: true } },
        assignedOfficer: { select: { name: true, phone: true } },
      }
    });

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
