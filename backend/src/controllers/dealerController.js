const Product = require('../models/Product');

// Add a new product (Dealer only)
const addProduct = async (req, res) => {
  try {
    // Assuming auth middleware sets req.user
    const dealerId = req.user._id;
    const { name, category, price, description, contactNumber } = req.body;

    const product = new Product({
      name,
      category,
      price,
      dealerId,
      description,
      contactNumber,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products by a specific dealer (For Dealer Dashboard)
const getDealerProducts = async (req, res) => {
  try {
    const dealerId = req.user._id;
    const products = await Product.find({ dealerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching dealer products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products (For Farmer Marketplace)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('dealerId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addProduct, getDealerProducts, getAllProducts };
