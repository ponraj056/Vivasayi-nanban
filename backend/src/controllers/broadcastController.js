const prisma = require("../config/prisma");

// Get all broadcasts (Farmer gets relevant ones, Officers get all they sent)
exports.getBroadcasts = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    if (userRole === "farmer") {
      // For simplicity, farmers see all broadcasts for now
      // A more complex query could check if targetDistricts contains their district
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { farmerProfile: true }
      });
      const district = user?.farmerProfile?.district;
      
      if (district) {
        filter = {
          OR: [
            { targetDistricts: { has: district } },
            { targetDistricts: { isEmpty: true } }
          ]
        };
      }
    } else if (userRole === "agri_officer" || userRole === "agri_agency") {
      filter.sentById = req.user.id;
    }

    const broadcasts = await prisma.broadcast.findMany({
      where: filter,
      include: {
        sentBy: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, broadcasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new broadcast (Agri Officer / Agency)
exports.createBroadcast = async (req, res) => {
  try {
    const { message, targetDistricts, targetCrops } = req.body;

    const data = {
      message,
      targetDistricts: targetDistricts || [],
      targetCrops: targetCrops || [],
      sentById: req.user.id,
    };

    if (req.user.role === "agri_agency") {
      data.agencyId = req.user.id;
    }

    const broadcast = await prisma.broadcast.create({ data });

    res.status(201).json({ success: true, broadcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
