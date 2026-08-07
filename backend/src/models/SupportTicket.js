const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["farmer", "agri_officer", "system"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const supportTicketSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
