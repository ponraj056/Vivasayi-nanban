const mongoose = require("mongoose");

const whatsappSessionSchema = new mongoose.Schema(
  {
    farmerPhone: { type: String, required: true, unique: true },
    currentStep: { type: String, default: "main_menu" },
    contextData: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now, expires: 1800 }, // 30 mins TTL
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsappSession", whatsappSessionSchema);
