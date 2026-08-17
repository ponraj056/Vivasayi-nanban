const axios = require("axios");

const WA_TOKEN = process.env.WHATSAPP_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";

const BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_ID}`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${WA_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Mock interceptor for local testing without real WhatsApp credentials
client.interceptors.request.use((config) => {
  if (!WA_TOKEN || WA_TOKEN === "your_meta_system_user_token_here") {
    console.log("[Mock WhatsApp API] Request:", config.url, JSON.stringify(config.data));
    // Cancel the request to prevent actual network call
    return Promise.reject({ isMock: true, message: "Mocked WhatsApp API Call" });
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.isMock) {
      return Promise.resolve({ data: { success: true, mocked: true } });
    }
    return Promise.reject(error);
  }
);

/**
 * Send a plain text message
 */
async function sendText(to, body) {
  return client.post("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  });
}

/**
 * Send interactive button message (max 3 buttons per WhatsApp limits)
 * buttons: [{ id: "MENU_PRICE", title: "விலை பார்க்க" }, ...]
 */
async function sendButtons(to, bodyText, buttons) {
  return client.post("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  });
}

/**
 * Send interactive list message (for menus with more than 3 options,
 * e.g. crop selection, district selection)
 * rows: [{ id: "CROP_PADDY", title: "நெல்", description: "" }, ...]
 */
async function sendList(to, bodyText, buttonLabel, rows) {
  return client.post("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      action: {
        button: buttonLabel,
        sections: [{ title: "Options", rows }],
      },
    },
  });
}

/**
 * Get a temporary download URL for a media ID (used for disease-detection images)
 */
async function getMediaUrl(mediaId) {
  if (!WA_TOKEN || WA_TOKEN === "your_meta_system_user_token_here") {
    return "http://mock-media-url.com/image.jpg";
  }

  const res = await client.get(`/${mediaId}`.replace(BASE_URL, ""), {
    baseURL: `https://graph.facebook.com/${WA_API_VERSION}`,
  });
  return res.data.url;
}

async function downloadMedia(mediaUrl) {
  if (!WA_TOKEN || WA_TOKEN === "your_meta_system_user_token_here" || mediaUrl.includes("mock-media")) {
    // Return a dummy 1x1 transparent JPEG or similar small buffer
    return Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0xFF, 0xD9]);
  }

  const res = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${WA_TOKEN}` },
    responseType: "arraybuffer",
  });
  return res.data;
}

/**
 * Mark an inbound message as read (blue ticks)
 */
async function markAsRead(waMessageId) {
  return client.post("/messages", {
    messaging_product: "whatsapp",
    status: "read",
    message_id: waMessageId,
  });
}

module.exports = {
  sendText,
  sendButtons,
  sendList,
  getMediaUrl,
  downloadMedia,
  markAsRead,
};