const prisma = require("../config/prisma");
const wa = require("./whatsappService");
const strings = require("./botStrings");

async function handleMachineTypeSelection(session, message) {
  const lang = session.language || "ta";
  const choice = message.interactiveId;

  if (!choice || !choice.startsWith("MACHINE_")) {
    await wa.sendText(session.phone_number, strings.invalidInput[lang]);
    return { nextFlow: "MACHINE_BOOKING_TYPE" };
  }

  // Parse type (e.g. "MACHINE_TRACTOR" -> "tractor")
  const machineType = choice.replace("MACHINE_", "").toLowerCase();

  // Save to context
  const contextData = typeof session.context === 'object' && session.context !== null ? session.context : {};
  contextData.booking_machineType = machineType;
  
  await prisma.whatsapp_sessions.update({
    where: { id: session.id },
    data: { context: contextData }
  });

  await wa.sendText(session.phone_number, strings.askBookingDate[lang]);
  return { nextFlow: "MACHINE_BOOKING_DATE" };
}

async function handleBookingDate(session, message) {
  const lang = session.language || "ta";
  const requestedDateStr = (message.text || "").trim();

  // Simple date validation (DD-MM-YYYY)
  const dateParts = requestedDateStr.split("-");
  if (dateParts.length !== 3) {
    await wa.sendText(session.phone_number, strings.invalidInput[lang]);
    return { nextFlow: "MACHINE_BOOKING_DATE" };
  }

  const requestedDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T00:00:00Z`);
  if (isNaN(requestedDate.getTime())) {
    await wa.sendText(session.phone_number, strings.invalidInput[lang]);
    return { nextFlow: "MACHINE_BOOKING_DATE" };
  }

  const contextData = typeof session.context === 'object' && session.context !== null ? session.context : {};
  const machineType = contextData.booking_machineType;

  // Search for an available machine
  const machine = await prisma.machines.findFirst({
    where: {
      machine_type: machineType,
      is_available: true,
      // Ideally filter by district, but we'll take any available for now to ensure a match in testing
    }
  });

  if (!machine) {
    const noMachineMsg = lang === "ta" 
      ? "மன்னிக்கவும், இந்த இயந்திரம் தற்போது இல்லை." 
      : "Sorry, no machine of this type is currently available.";
    await wa.sendText(session.phone_number, noMachineMsg);
    return { nextFlow: "MAIN_MENU" };
  }

  // Save selection
  contextData.booking_date = requestedDate.toISOString();
  contextData.booking_machineId = machine.id;
  contextData.booking_machineOwnerId = machine.owner_id;
  
  await prisma.whatsapp_sessions.update({
    where: { id: session.id },
    data: { context: contextData }
  });

  // Ask for confirmation
  const machineName = machine.name;
  const price = machine.price_per_day;
  
  const confirmMsg = lang === "ta"
    ? `இயந்திரம் கிடைக்கிறது!\n\nபெயர்: ${machineName}\nவாடகை: ₹${price}/நாள்\n\nஉறுதி செய்யவா?`
    : `Machine available!\n\nName: ${machineName}\nRent: ₹${price}/day\n\nConfirm booking?`;

  const buttons = [
    { id: "BOOKING_CONFIRM_YES", title: lang === "ta" ? "ஆம் (Yes)" : "Yes" },
    { id: "BOOKING_CONFIRM_NO", title: lang === "ta" ? "இல்லை (No)" : "No" }
  ];

  await wa.sendButtons(session.phone_number, confirmMsg, buttons);
  return { nextFlow: "MACHINE_BOOKING_CONFIRM" };
}

async function handleBookingConfirm(session, message) {
  const lang = session.language || "ta";
  const choice = message.interactiveId;

  if (choice === "BOOKING_CONFIRM_NO") {
    await wa.sendText(session.phone_number, lang === "ta" ? "முன்பதிவு ரத்து செய்யப்பட்டது." : "Booking cancelled.");
    return { nextFlow: "MAIN_MENU" };
  }

  if (choice === "BOOKING_CONFIRM_YES") {
    const contextData = typeof session.context === 'object' && session.context !== null ? session.context : {};
    
    // Lookup farmer user to get their ID
    const farmerUser = await prisma.users.findUnique({
      where: { phone: session.phone_number }
    });

    if (!farmerUser) {
      await wa.sendText(session.phone_number, lang === "ta" ? "நீங்கள் விவசாயியாக பதிவு செய்யப்படவில்லை." : "You are not registered as a farmer.");
      return { nextFlow: "MAIN_MENU" };
    }

    // Create Booking
    await prisma.machine_bookings.create({
      data: {
        farmer_id: farmerUser.id,
        farmer_phone: session.phone_number,
        machine_id: contextData.booking_machineId,
        machine_type: contextData.booking_machineType,
        requested_date: new Date(contextData.booking_date),
        machine_owner_id: contextData.booking_machineOwnerId,
        source: "whatsapp",
      }
    });

    await wa.sendText(session.phone_number, strings.bookingConfirmed[lang]);
    return { nextFlow: "MAIN_MENU" };
  }

  await wa.sendText(session.phone_number, strings.invalidInput[lang]);
  return { nextFlow: "MACHINE_BOOKING_CONFIRM" };
}

module.exports = {
  handleMachineTypeSelection,
  handleBookingDate,
  handleBookingConfirm
};