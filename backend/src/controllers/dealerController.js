const prisma = require('../config/prisma');

// Add a new product (Dealer only)
const addProduct = async (req, res) => {
  try {
    const agency_id = req.user.id;
    const { name, category, price, description, unit, stock_quantity, district } = req.body;

    const product = await prisma.products.create({
      data: {
        name,
        category, // Must be one of ProductCategory enum e.g. "seed", "fertilizer"
        price: parseFloat(price),
        agency_id,
        description: description || "",
        unit: unit || "kg",
        stock_quantity: parseInt(stock_quantity, 10) || 0,
        district: district || "",
        is_available: true
      }
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products by a specific dealer (For Dealer Dashboard)
const getDealerProducts = async (req, res) => {
  try {
    const agency_id = req.user.id;
    const products = await prisma.products.findMany({
      where: { agency_id },
      orderBy: { created_at: 'desc' }
    });
    // Map id to be compatible with frontend if needed, but Prisma uses id by default.
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching dealer products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products (For Farmer Marketplace)
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        agency: { select: { name: true, phone: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addProduct, getDealerProducts, getAllProducts };
