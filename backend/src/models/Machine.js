const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    machineType: {
      type: String,
      enum: ["MACHINE_TRACTOR", "MACHINE_HARVESTER", "MACHINE_SPRAYER"],
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    pricePerDay: { type: Number, required: true },
    district: { type: String, required: true },
    location: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    unavailableDates: [{ type: String }],
  },
  { timestamps: true }
);

machineSchema.index({ district: 1, machineType: 1 });

module.exports = mongoose.model("Machine", machineSchema);