const mongoose = require("mongoose");

const machineBookingSchema = new mongoose.Schema(
  {
    farmerPhone: { type: String, default: "" },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      default: null,
    },
    machineType: {
      type: String,
      enum: ["MACHINE_TRACTOR", "MACHINE_HARVESTER", "MACHINE_SPRAYER"],
      required: true,
    },
    requestedDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "pending",
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