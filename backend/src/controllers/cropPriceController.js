const prisma = require("../config/prisma");

/**
 * Get all crop prices or search by crop name and district
 * GET /api/prices?crop=Tomato&district=Madurai
 */
exports.getCropPrices = async (req, res) => {
  try {
    const { crop, district, limit = 50 } = req.query;

    const where = {};
    if (crop) {
      where.crop_name = { contains: crop, mode: "insensitive" };
    }
    if (district) {
      where.district = { contains: district, mode: "insensitive" };
    }

    const prices = await prisma.crop_prices.findMany({
      where,
      orderBy: { price_date: "desc" },
      take: parseInt(limit, 10),
    });

    res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching crop prices:", error);
    res.status(500).json({ error: "Failed to fetch crop prices" });
  }
};

/**
 * Add a new crop price record (Admin/System only)
 * POST /api/prices
 */
exports.addCropPrice = async (req, res) => {
  try {
    const { crop_name, market, district, modal_price, price_date } = req.body;

    if (!crop_name || !district || modal_price === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const price = await prisma.crop_prices.create({
      data: {
        crop_name,
        market: market || null,
        district,
        modal_price: parseFloat(modal_price),
        price_date: price_date ? new Date(price_date) : new Date(),
      }
    });

    res.status(201).json({ message: "Crop price added successfully", price });
  } catch (error) {
    console.error("Error adding crop price:", error);
    res.status(500).json({ error: "Failed to add crop price" });
  }
};
