const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    targetDistricts: [{ type: String }],
    targetCrops: [{ type: String }],
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Broadcast", broadcastSchema);
