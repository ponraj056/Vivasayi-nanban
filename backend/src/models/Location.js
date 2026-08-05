const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, index: true },
    taluk: { type: String, required: true, index: true },
    village: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
