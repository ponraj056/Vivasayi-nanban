const { handleIncomingMessage } = require("./botFlowService");
const prisma = require("../config/prisma");
const wa = require("./whatsappService");

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/**
 * GET /api/whatsapp/webhook
 * Meta calls this once when you register the webhook URL in
 * the Meta App Dashboard, to confirm you own the endpoint.
 */
function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified.");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

/**
 * POST /api/whatsapp/webhook
 * Meta calls this for every inbound message, status update, etc.
 * Must always respond 200 quickly, or Meta will retry/disable the webhook.
 */
async function receiveWebhook(req, res) {
  // Ack immediately — process asynchronously
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Ignore status callbacks (sent/delivered/read receipts)
    if (!value?.messages) return;

    const waMessage = value.messages[0];
    const phoneNumber = waMessage.from; // sender's WhatsApp number

    const parsed = parseMessage(waMessage);

    await prisma.whatsapp_message_logs.create({
      data: {
        phone_number: phoneNumber,
        direction: "inbound",
        message_type: parsed.type,
        content: parsed.text || null,
        media_id: parsed.mediaId || null,
        wa_message_id: waMessage.id,
        status: "received",
      }
    });

    await wa.markAsRead(waMessage.id).catch(() => {});

    await handleIncomingMessage(phoneNumber, parsed);
  } catch (err) {
    console.error("WhatsApp webhook processing error:", err);
  }
}

/**
 * Normalize Meta's raw message payload into the simple shape
 * botFlowService expects: { type, text, interactiveId, mediaId }
 */
function parseMessage(waMessage) {
  if (waMessage.type === "text") {
    return { type: "text", text: waMessage.text.body };
  }

  if (waMessage.type === "interactive") {
    const interactive = waMessage.interactive;
    const id =
      interactive.button_reply?.id || interactive.list_reply?.id || null;
    const title =
      interactive.button_reply?.title || interactive.list_reply?.title || "";
    return { type: "interactive", interactiveId: id, text: title };
  }

  if (waMessage.type === "image") {
    return {
      type: "image",
      mediaId: waMessage.image.id,
      text: waMessage.image.caption || "",
    };
  }

  return { type: waMessage.type, text: "" };
}

module.exports = { verifyWebhook, receiveWebhook };
