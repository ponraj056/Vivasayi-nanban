const prisma = require("../config/prisma");

// Get inquiries (Agri Agency gets inquiries made to them, Farmer gets inquiries they made)
exports.getInquiries = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    if (userRole === "farmer") {
      filter.farmerId = req.user.id;
    } else if (userRole === "dealer" || userRole === "agri_agency") {
      filter.agencyId = req.user.id;
    }

    const inquiries = await prisma.inquiry.findMany({
      where: filter,
      include: {
        farmer: { select: { name: true, phone: true } },
        agency: { 
          select: { name: true, phone: true, dealerProfile: true }
        },
        product: { select: { name: true, price: true, category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new inquiry (Farmer to Agency for a Product)
exports.createInquiry = async (req, res) => {
  try {
    const { agencyId, productId, message } = req.body;

    const inquiry = await prisma.inquiry.create({
      data: {
        farmerId: req.user.id,
        agencyId,
        productId,
        message,
        status: "open",
      }
    });

    res.status(201).json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Respond/Update inquiry status (Agency responding to Farmer)
exports.respondInquiry = async (req, res) => {
  try {
    const { status } = req.body; // e.g. "responded"
    
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: req.params.id }
    });

    if (!existingInquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    const data = {};
    if (status) data.status = status;

    const inquiry = await prisma.inquiry.update({
      where: { id: existingInquiry.id },
      data
    });

    res.json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
