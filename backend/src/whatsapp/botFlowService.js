const prisma = require("../config/prisma");
const wa = require("./whatsappService");
const strings = require("./botStrings");
const cropPriceLookup = require("./cropPriceLookupService");
// const diseaseDetection = require("./diseaseDetectionService");
// const machineBooking = require("./machineBookingService");

/**
 * Fetch or create a session for a phone number.
 */
async function getOrCreateSession(phoneNumber) {
  let session = await prisma.whatsapp_sessions.findUnique({ where: { phone_number: phoneNumber } });
  if (!session) {
    session = await prisma.whatsapp_sessions.create({ 
      data: { 
        phone_number: phoneNumber,
        current_flow: "MAIN_MENU",
        context: {}
      } 
    });
  }
  return session;
}

async function setFlow(session, flow, contextPatch = {}) {
  const currentContext = typeof session.context === 'object' && session.context !== null ? session.context : {};
  const updatedContext = { ...currentContext, ...contextPatch };
  
  await prisma.whatsapp_sessions.update({
    where: { id: session.id },
    data: {
      current_flow: flow,
      context: updatedContext,
      last_message_at: new Date()
    }
  });
  
  session.current_flow = flow;
  session.context = updatedContext;
}

async function sendLanguageMenu(session) {
  await wa.sendButtons(
    session.phone_number,
    "Welcome to Vivasayi Nanban! / விவசாயி நண்பனுக்கு வரவேற்கிறோம்!\n\nPlease select your preferred language / உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்:",
    [
      { id: "LANG_TA", title: "தமிழ்" },
      { id: "LANG_EN", title: "English" }
    ]
  );
  await setFlow(session, "LANGUAGE_SELECTION");
}

async function sendMainMenu(session) {
  const lang = session.language || "ta";
  await wa.sendButtons(
    session.phone_number,
    strings.welcome[lang],
    strings.mainMenuButtons[lang]
  );
  await setFlow(session, "MAIN_MENU");
}

/**
 * Entry point — called by the webhook controller for every inbound message.
 * message: { type: 'text'|'interactive'|'image', text, interactiveId, mediaId }
 */
async function handleIncomingMessage(phoneNumber, message) {
  const session = await getOrCreateSession(phoneNumber);
  const lang = session.language || "ta";

  // Global shortcuts — work from any flow
  const raw = (message.text || "").trim().toLowerCase();
  if (["hi", "hello", "menu", "வணக்கம்", "start"].includes(raw)) {
    // If language is not explicitly set, ask for language first
    if (!session.context?.langSet) {
      return sendLanguageMenu(session);
    }
    return sendMainMenu(session);
  }

  switch (session.current_flow) {
    case "LANGUAGE_SELECTION":
      return handleLanguageSelection(session, message);

    case "main_menu":
    case "IDLE":
    case "MAIN_MENU":
      return handleMainMenuSelection(session, message);

    case "PRICE_QUERY_CROP":
      return handlePriceQuery(session, message);

    case "DISEASE_QUERY_WAIT_IMAGE":
      // Placeholder until Stage 6
      await wa.sendText(session.phone_number, "Disease detection module is under development.");
      return sendMainMenu(session);

    case "MACHINE_BOOKING_TYPE":
      // Placeholder until Stage 7
      await wa.sendText(session.phone_number, "Machine booking module is under development.");
      return sendMainMenu(session);

    default:
      return sendMainMenu(session);
  }
}

async function handleLanguageSelection(session, message) {
  const choice = message.interactiveId;
  
  if (choice === "LANG_TA") {
    await prisma.whatsapp_sessions.update({
      where: { id: session.id },
      data: { language: "ta", context: { langSet: true } }
    });
    session.language = "ta";
    return sendMainMenu(session);
  }
  
  if (choice === "LANG_EN") {
    await prisma.whatsapp_sessions.update({
      where: { id: session.id },
      data: { language: "en", context: { langSet: true } }
    });
    session.language = "en";
    return sendMainMenu(session);
  }
  
  await wa.sendText(session.phone_number, "Please select a language using the buttons.");
  return sendLanguageMenu(session);
}

async function handleMainMenuSelection(session, message) {
  const lang = session.language || "ta";
  const choice = message.interactiveId;

  if (choice === "MENU_PRICE") {
    await wa.sendText(session.phone_number, strings.askCropForPrice[lang]);
    return setFlow(session, "PRICE_QUERY_CROP");
  }

  if (choice === "MENU_DISEASE") {
    await wa.sendText(session.phone_number, strings.askDiseaseImage[lang]);
    return setFlow(session, "DISEASE_QUERY_WAIT_IMAGE");
  }

  if (choice === "MENU_MACHINE") {
    await wa.sendList(
      session.phone_number,
      strings.machineTypeAsk[lang],
      lang === "ta" ? "தேர்வு செய்ய" : "Select",
      strings.machineTypeRows[lang]
    );
    return setFlow(session, "MACHINE_BOOKING_TYPE");
  }

  await wa.sendText(session.phone_number, strings.invalidInput[lang]);
  return sendMainMenu(session);
}

async function handlePriceQuery(session, message) {
  const lang = session.language || "ta";
  const cropName = (message.text || "").trim();

  const contextData = typeof session.context === 'object' && session.context !== null ? session.context : {};
  const priceInfo = await cropPriceLookup.getLatestPrice(cropName, contextData.district);

  if (!priceInfo) {
    await wa.sendText(session.phone_number, strings.priceNotFound[lang]);
  } else {
    const reply =
      lang === "ta"
        ? `📊 *${cropName}* விலை\nமண்டி: ${priceInfo.market}\nமொத்த விலை: ₹${priceInfo.modalPrice}/குவிண்டால்\nநாள்: ${priceInfo.date}`
        : `📊 *${cropName}* price\nMarket: ${priceInfo.market}\nModal Price: ₹${priceInfo.modalPrice}/quintal\nDate: ${priceInfo.date}`;
    await wa.sendText(session.phone_number, reply);
  }

  return sendMainMenu(session);
}

module.exports = { handleIncomingMessage, getOrCreateSession };
