const mongoose = require("mongoose");

/**
 * Tracks conversation state per WhatsApp number so the bot
 * knows what step a farmer is in (menu, booking, disease-query, etc.)
 */
const whatsAppSessionSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null until the number is linked to a registered account
    },
    language: {
      type: String,
      enum: ["ta", "en"],
      default: "ta",
    },
    currentFlow: {
      type: String,
      enum: [
        "IDLE",
        "MAIN_MENU",
        "REGISTER_NAME",
        "REGISTER_ROLE",
        "REGISTER_DISTRICT",
        "PRICE_QUERY_CROP",
        "DISEASE_QUERY_WAIT_IMAGE",
        "MACHINE_BOOKING_TYPE",
        "MACHINE_BOOKING_DATE",
        "MACHINE_BOOKING_CONFIRM",
      ],
      default: "IDLE",
    },
    context: {
      type: mongoose.Schema.Types.Mixed, // temp data collected mid-flow
      default: {},
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppSession", whatsAppSessionSchema);