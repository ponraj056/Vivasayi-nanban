const mongoose = require("mongoose");

const whatsAppMessageLogSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    direction: {
      type: String,
      enum: ["INBOUND", "OUTBOUND"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "interactive", "template", "location"],
      default: "text",
    },
    content: { type: String }, // text body, or caption for media
    mediaId: { type: String, default: null }, // WhatsApp media ID if image/doc
    waMessageId: { type: String, default: null }, // Meta's message id
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed", "received"],
      default: "received",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppMessageLog", whatsAppMessageLogSchema);