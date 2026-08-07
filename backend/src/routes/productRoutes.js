const express = require('express');
const { getProducts, searchProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.get('/search', searchProducts);
router.route('/').get(getProducts).post(protect, createProduct);
router.route('/:id').put(protect, updateProduct).delete(protect, deleteProduct);
module.exports = router;
