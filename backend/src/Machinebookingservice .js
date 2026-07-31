/**
 * TODO: Replace with a real MachineBooking model once the
 * Machine Rental module is built. E.g.:
 *
 *   const MachineBooking = require("../models/MachineBooking");
 *   return MachineBooking.create({ phoneNumber, machineType, requestedDate, status: "PENDING" });
 */
async function createMachineBookingRequest({ phoneNumber, machineType, requestedDate }) {
  console.log("[MachineBooking] New request:", {
    phoneNumber,
    machineType,
    requestedDate,
  });
  // Return a fake booking id for now
  return { bookingId: `TEMP-${Date.now()}`, status: "PENDING" };
}

module.exports = { createMachineBookingRequest };