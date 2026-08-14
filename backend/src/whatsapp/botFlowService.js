const prisma = require("../config/prisma");
const wa = require("./whatsappService");
const strings = require("./botStrings");
const cropPriceLookup = require("./cropPriceLookupService");
const diseaseDetection = require("./diseaseDetectionService");
const machineBooking = require("./machineBookingService");

const { getLatestPrice } = cropPriceLookup;
const { queueDiseaseDetection } = diseaseDetection;
const { createMachineBookingRequest } = machineBooking;

/**
 * Fetch or create a session for a phone number.
 */
async function getOrCreateSession(phoneNumber) {
  let session = await prisma.whatsappSession.findUnique({ where: { farmerPhone: phoneNumber } });
  if (!session) {
    session = await prisma.whatsappSession.create({ data: { farmerPhone: phoneNumber } });
  }
  return session;
}

async function setFlow(session, flow, contextPatch = {}) {
  const currentContext = typeof session.contextData === 'object' && session.contextData !== null ? session.contextData : {};
  const updatedContext = { ...currentContext, ...contextPatch };
  
  await prisma.whatsappSession.update({
    where: { id: session.id },
    data: {
      currentStep: flow,
      contextData: updatedContext,
      updatedAt: new Date()
    }
  });
  
  session.currentStep = flow;
  session.contextData = updatedContext;
}

async function sendMainMenu(session) {
  const lang = session.language || "ta";
  await wa.sendButtons(
    session.farmerPhone,
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
    return sendMainMenu(session);
  }

  switch (session.currentStep) {
    case "main_menu":
    case "IDLE":
      return sendMainMenu(session);

    case "MAIN_MENU":
      return handleMainMenuSelection(session, message);

    case "PRICE_QUERY_CROP":
      return handlePriceQuery(session, message);

    case "DISEASE_QUERY_WAIT_IMAGE":
      return handleDiseaseImage(session, message);

    case "MACHINE_BOOKING_TYPE":
      return handleMachineTypeSelection(session, message);

    case "MACHINE_BOOKING_DATE":
      return handleMachineBookingDate(session, message);

    default:
      return sendMainMenu(session);
  }
}

async function handleMainMenuSelection(session, message) {
  const lang = session.language || "ta";
  const choice = message.interactiveId;

  if (choice === "MENU_PRICE") {
    await wa.sendText(session.farmerPhone, strings.askCropForPrice[lang]);
    return setFlow(session, "PRICE_QUERY_CROP");
  }

  if (choice === "MENU_DISEASE") {
    await wa.sendText(session.farmerPhone, strings.askDiseaseImage[lang]);
    return setFlow(session, "DISEASE_QUERY_WAIT_IMAGE");
  }

  if (choice === "MENU_MACHINE") {
    await wa.sendList(
      session.farmerPhone,
      strings.machineTypeAsk[lang],
      lang === "ta" ? "தேர்வு செய்ய" : "Select",
      strings.machineTypeRows[lang]
    );
    return setFlow(session, "MACHINE_BOOKING_TYPE");
  }

  await wa.sendText(session.farmerPhone, strings.invalidInput[lang]);
  return sendMainMenu(session);
}

async function handlePriceQuery(session, message) {
  const lang = session.language || "ta";
  const cropName = (message.text || "").trim();

  const contextData = typeof session.contextData === 'object' && session.contextData !== null ? session.contextData : {};
  const priceInfo = await getLatestPrice(cropName, contextData.district);

  if (!priceInfo) {
    await wa.sendText(session.farmerPhone, strings.priceNotFound[lang]);
  } else {
    const reply =
      lang === "ta"
        ? `📊 *${cropName}* விலை\nமண்டி: ${priceInfo.market}\nமொத்த விலை: ₹${priceInfo.modalPrice}/குவிண்டால்\nநாள்: ${priceInfo.date}`
        : `📊 *${cropName}* price\nMarket: ${priceInfo.market}\nModal Price: ₹${priceInfo.modalPrice}/quintal\nDate: ${priceInfo.date}`;
    await wa.sendText(session.farmerPhone, reply);
  }

  return sendMainMenu(session);
}

async function handleDiseaseImage(session, message) {
  const lang = session.language || "ta";

  if (message.type !== "image" || !message.mediaId) {
    await wa.sendText(session.farmerPhone, strings.invalidInput[lang]);
    return; // stay in this flow, wait for an actual image
  }

  await wa.sendText(session.farmerPhone, strings.diseaseProcessing[lang]);

  // Fire-and-forget: the detection service will call back via
  // whatsappService.sendText once the YOLOv8 model finishes.
  await queueDiseaseDetection({
    phoneNumber: session.farmerPhone,
    mediaId: message.mediaId,
    language: lang,
  });

  return setFlow(session, "IDLE");
}

async function handleMachineTypeSelection(session, message) {
  const lang = session.language || "ta";
  const choice = message.interactiveId;

  const validTypes = ["MACHINE_TRACTOR", "MACHINE_HARVESTER", "MACHINE_SPRAYER"];
  if (!validTypes.includes(choice)) {
    await wa.sendText(session.farmerPhone, strings.invalidInput[lang]);
    return;
  }

  await wa.sendText(session.farmerPhone, strings.askBookingDate[lang]);
  return setFlow(session, "MACHINE_BOOKING_DATE", { machineType: choice });
}

async function handleMachineBookingDate(session, message) {
  const lang = session.language || "ta";
  const dateText = (message.text || "").trim();

  // Basic DD-MM-YYYY validation
  const match = dateText.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) {
    await wa.sendText(session.farmerPhone, strings.invalidInput[lang]);
    return;
  }

  const contextData = typeof session.contextData === 'object' && session.contextData !== null ? session.contextData : {};
  await createMachineBookingRequest({
    phoneNumber: session.farmerPhone,
    machineType: contextData.machineType,
    requestedDate: `${match[3]}-${match[2]}-${match[1]}`, // YYYY-MM-DD
  });

  await wa.sendText(session.farmerPhone, strings.bookingConfirmed[lang]);
  return sendMainMenu(session);
}

module.exports = { handleIncomingMessage, getOrCreateSession };
