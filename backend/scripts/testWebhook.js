const axios = require("axios");

async function testWebhook() {
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "12345",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "16505551111",
                phone_number_id: "123451234512345",
              },
              contacts: [
                {
                  profile: { name: "Test User" },
                  wa_id: "919876543210",
                },
              ],
              messages: [
                {
                  from: "919876543210",
                  id: "wamid.HBgMOTE5ODc2NTQzMjEwFQIAEhgg...",
                  timestamp: Date.now().toString(),
                  type: "text",
                  text: { body: "hi" },
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };

  try {
    const res = await axios.post("http://localhost:5000/api/whatsapp/webhook", payload);
    console.log("Webhook triggered successfully:", res.status);
  } catch (err) {
    console.error("Error triggering webhook:", err.message);
  }
}

testWebhook();
