const prisma = require("../config/prisma");

/* ---------------------------- FARMER SIDE ---------------------------- */

async function browseMachines(req, res) {
  try {
    const { district, machineType } = req.query;
    const filter = { isAvailable: true };
    if (district) filter.district = district;
    if (machineType) filter.machineType = machineType;

    const machines = await prisma.machine.findMany({
      where: filter,
      include: {
        owner: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, machines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMachineById(req, res) {
  try {
    const machine = await prisma.machine.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }
    res.json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function bookMachine(req, res) {
  try {
    const { requestedDate } = req.body;
    if (!requestedDate) {
      return res.status(400).json({ success: false, message: "requestedDate is required" });
    }

    const machine = await prisma.machine.findUnique({
      where: { id: req.params.id }
    });
    
    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    if (machine.unavailableDates.includes(requestedDate)) {
      return res.status(409).json({ success: false, message: "Machine already booked for this date" });
    }

    const booking = await prisma.machineBooking.create({
      data: {
        farmerId: req.user.id,
        farmerPhone: req.user.phone || "",
        machineId: machine.id,
        machineOwnerId: machine.ownerId,
        machineType: machine.machineType,
        requestedDate,
        source: "WEB",
      }
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMyBookings(req, res) {
  try {
    const bookings = await prisma.machineBooking.findMany({
      where: { farmerId: req.user.id },
      include: {
        machine: {
          select: { name: true, machineType: true, pricePerDay: true, district: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ---------------------------- OWNER SIDE ---------------------------- */

async function createMachine(req, res) {
  try {
    const { machineType, name, description, pricePerDay, district, location, photoUrl } = req.body;

    const machine = await prisma.machine.create({
      data: {
        ownerId: req.user.id,
        machineType,
        name,
        description: description || "",
        pricePerDay: parseFloat(pricePerDay),
        district,
        location: location || "",
        photoUrl: photoUrl || "",
      }
    });

    res.status(201).json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMyMachines(req, res) {
  try {
    const machines = await prisma.machine.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, machines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateMachine(req, res) {
  try {
    const existing = await prisma.machine.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    const { id, ownerId, createdAt, updatedAt, ...updateData } = req.body;

    const machine = await prisma.machine.update({
      where: { id: existing.id },
      data: updateData
    });

    res.json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getOwnerBookings(req, res) {
  try {
    const bookings = await prisma.machineBooking.findMany({
      where: { machineOwnerId: req.user.id },
      include: {
        farmer: { select: { name: true, phone: true } },
        machine: { select: { name: true, machineType: true, pricePerDay: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function respondToBooking(req, res) {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const existingBooking = await prisma.machineBooking.findUnique({
      where: { id: req.params.id },
      include: { machine: true }
    });

    if (!existingBooking || existingBooking.machineOwnerId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = await prisma.machineBooking.update({
      where: { id: existingBooking.id },
      data: { status }
    });

    if (status === "APPROVED") {
      // Add requestedDate to unavailableDates if it's not already there
      const unavailableDates = existingBooking.machine.unavailableDates || [];
      if (!unavailableDates.includes(existingBooking.requestedDate)) {
        await prisma.machine.update({
          where: { id: existingBooking.machine.id },
          data: {
            unavailableDates: { push: existingBooking.requestedDate }
          }
        });
      }
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  browseMachines,
  getMachineById,
  bookMachine,
  getMyBookings,
  createMachine,
  getMyMachines,
  updateMachine,
  getOwnerBookings,
  respondToBooking,
};