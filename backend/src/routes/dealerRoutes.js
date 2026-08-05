const express = require('express');
const { addProduct, getDealerProducts, getAllProducts } = require('../controllers/dealerController');
const authMiddleware = require('../middleware/auth');
// Assuming you have an authMiddleware that verifies JWT and sets req.user
// and maybe a roleCheck middleware. We'll use a placeholder structure.

const router = express.Router();

// Public/Farmer route to see all products in marketplace
router.get('/products', getAllProducts);

// Dealer specific routes (Require Auth)
// In a real scenario, you'd add: router.use(authMiddleware.protect);
router.post('/products', authMiddleware.protect, addProduct);
router.get('/my-products', authMiddleware.protect, getDealerProducts);

module.exports = router;
