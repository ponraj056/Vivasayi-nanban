const MachineBooking = require("../models/MachineBooking");

async function createMachineBookingRequest({ phoneNumber, machineType, requestedDate }) {
  const booking = await MachineBooking.create({
    farmerPhone: phoneNumber,
    machineType,
    requestedDate,
    source: "WHATSAPP",
  });
  return { bookingId: booking._id, status: booking.status };
}

module.exports = { createMachineBookingRequest };