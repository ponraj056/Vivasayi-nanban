const Location = require("../models/Location");

// @route  GET /api/locations/districts
// @access Public
const getDistricts = async (req, res) => {
  try {
    const districts = await Location.distinct("district");
    res.status(200).json({ success: true, districts: districts.sort() });
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

    const taluks = await Location.find({ district }).distinct("taluk");
    res.status(200).json({ success: true, taluks: taluks.sort() });
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

    const locations = await Location.find({ district, taluk }).sort({ village: 1 });
    
    // Return array of objects with village and pincode
    const villages = locations.map(loc => ({
      village: loc.village,
      pincode: loc.pincode
    }));

    res.status(200).json({ success: true, villages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDistricts, getTaluks, getVillages };
