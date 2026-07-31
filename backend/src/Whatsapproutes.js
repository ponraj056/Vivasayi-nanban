const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  receiveWebhook,
} = require("../controllers/whatsappController");

// Meta calls GET once to verify the webhook URL
router.get("/webhook", verifyWebhook);

// Meta calls POST for every inbound message / status update
router.post("/webhook", receiveWebhook);

module.exports = router;