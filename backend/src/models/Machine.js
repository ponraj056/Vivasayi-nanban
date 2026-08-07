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
      enum: ["MACHINE_TRACTOR", "MACHINE_HARVESTER", "MACHINE_SPRAYER", "Tractor", "Tiller", "Harvester", "Sprayer", "Drone", "Other"],
      required: true,
    },
    name: { type: String, required: true },
    model: { type: String },
    description: { type: String, default: "" },
    pricePerDay: { type: Number, required: true },
    hourlyRate: { type: Number },
    dailyRate: { type: Number },
    district: { type: String, required: true },
    taluk: { type: String },
    village: { type: String },
    contactPhone: { type: String },
    location: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    availability: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    unavailableDates: [{ type: String }],
  },
  { timestamps: true }
);

machineSchema.index({ district: 1, machineType: 1 });

module.exports = mongoose.model("Machine", machineSchema);