const prisma = require('../config/prisma');

// Add a new product (Dealer only)
const addProduct = async (req, res) => {
  try {
    const dealerId = req.user.id;
    const { name, category, price, description, contactNumber, district, taluk, village } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price: parseFloat(price),
        dealerId,
        description: description || "",
        contactNumber,
        district: district || "",
        taluk: taluk || "",
        village: village || "",
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
    const dealerId = req.user.id;
    const products = await prisma.product.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching dealer products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products (For Farmer Marketplace)
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        dealer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addProduct, getDealerProducts, getAllProducts };
