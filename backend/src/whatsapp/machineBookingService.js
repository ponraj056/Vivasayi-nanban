const prisma = require("../config/prisma");

async function createMachineBookingRequest({ phoneNumber, machineType, requestedDate }) {
  const booking = await prisma.machineBooking.create({
    data: {
      farmerPhone: phoneNumber,
      machineType,
      requestedDate,
      source: "WHATSAPP",
    }
  });
  return { bookingId: booking.id, status: booking.status };
}

module.exports = { createMachineBookingRequest };