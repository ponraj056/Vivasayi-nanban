const mongoose = require("mongoose");

const machineBookingSchema = new mongoose.Schema(
  {
    farmerPhone: { type: String, required: true, index: true },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    machineType: {
      type: String,
      enum: ["MACHINE_TRACTOR", "MACHINE_HARVESTER", "MACHINE_SPRAYER"],
      required: true,
    },
    requestedDate: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "PENDING",
    },
    machineOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNote: { type: String, default: "" },
    source: {
      type: String,
      enum: ["WHATSAPP", "WEB"],
      default: "WHATSAPP",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MachineBooking", machineBookingSchema);