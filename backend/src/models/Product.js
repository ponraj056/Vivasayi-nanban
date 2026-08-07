const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    required: true,
    enum: ['Seeds', 'Fertilizer', 'Pesticide', 'Tools', 'Other'],
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ['kg', 'litre', 'packet'],
    default: 'kg'
  },
  stockStatus: {
    type: String,
    enum: ['inStock', 'lowStock', 'outOfStock'],
    default: 'inStock'
  },
  applicableCrops: [{ type: String }],
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  district: { type: String, required: true },
  taluk: { type: String, required: true },
  village: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
