const axios = require("axios");

const WEBHOOK_URL = "http://localhost:5000/api/whatsapp/webhook";
const SENDER_PHONE = "919876543210";

async function sendDummyMessage(text) {
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "16505551111",
                phone_number_id: "123451234512345"
              },
              contacts: [
                {
                  profile: {
                    name: "Test User"
                  },
                  wa_id: SENDER_PHONE
                }
              ],
              messages: [
                {
                  from: SENDER_PHONE,
                  id: "wamid.HBgLOTkxMjM0NTY3ODk0FQIAEhgUM0U0RDU2N0U4OEY5QTBCQzNEMkUA",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: "text",
                  text: {
                    body: text
                  }
                }
              ]
            },
            field: "messages"
          }
        ]
      }
    ]
  };

  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log(`Sent "${text}": Status ${res.status}`);
  } catch (err) {
    console.error("Error sending dummy message:", err.message);
  }
}

async function sendDummyInteractiveReply(buttonId, buttonTitle) {
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: SENDER_PHONE,
                  id: "wamid.dummy_interactive_" + Date.now(),
                  type: "interactive",
                  interactive: {
                    type: "button_reply",
                    button_reply: {
                      id: buttonId,
                      title: buttonTitle
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  };

  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log(`Sent button reply [${buttonTitle}]: Status ${res.status}`);
  } catch (err) {
    console.error("Error sending dummy interactive reply:", err.message);
  }
}

async function testFlow() {
  console.log("--- Starting WhatsApp Webhook Test ---");
  
  // 1. Send 'hi' to trigger language menu
  await sendDummyMessage("hi");
  
  // Wait a bit for async db operations and simulated response logging (if we were logging outbound)
  await new Promise(r => setTimeout(r, 1000));
  
  // 2. Select Tamil Language
  await sendDummyInteractiveReply("LANG_TA", "தமிழ்");
  
  await new Promise(r => setTimeout(r, 1000));

  // 3. Select Crop Price from Main Menu
  await sendDummyInteractiveReply("MENU_PRICE", "விவசாயி (Crop Price)");
  await new Promise(r => setTimeout(r, 1000));

  // 4. Send crop name "தக்காளி"
  await sendDummyMessage("தக்காளி");
  
  console.log("--- Test Complete ---");
}

testFlow();
