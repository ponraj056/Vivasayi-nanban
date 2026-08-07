const mongoose = require("mongoose");

const diseaseReportSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    diseaseName: { type: String, required: true },
    confidence: { type: Number, required: true },
    treatmentAdvice: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiseaseReport", diseaseReportSchema);
