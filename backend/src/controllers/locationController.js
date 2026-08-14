const prisma = require("../config/prisma");

// @route  GET /api/locations/districts
// @access Public
const getDistricts = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' }
    });
    
    const districts = locations.map(l => l.district);
    res.status(200).json({ success: true, districts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/locations/taluks
// @access Public
const getTaluks = async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) return res.status(400).json({ success: false, message: "District is required" });

    const locations = await prisma.location.findMany({
      where: { district },
      select: { taluk: true },
      distinct: ['taluk'],
      orderBy: { taluk: 'asc' }
    });
    
    const taluks = locations.map(l => l.taluk);
    res.status(200).json({ success: true, taluks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/locations/villages
// @access Public
const getVillages = async (req, res) => {
  try {
    const { district, taluk } = req.query;
    if (!district || !taluk) return res.status(400).json({ success: false, message: "District and taluk are required" });

    const locations = await prisma.location.findMany({
      where: { district, taluk },
      orderBy: { village: 'asc' },
      select: {
        village: true,
        pincode: true
      }
    });

    res.status(200).json({ success: true, villages: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDistricts, getTaluks, getVillages };
