const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "responded"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
