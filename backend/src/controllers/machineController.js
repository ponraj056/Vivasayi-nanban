const Machine = require("../models/Machine");
const MachineBooking = require("../models/Machinebooking");

/* ---------------------------- FARMER SIDE ---------------------------- */

async function browseMachines(req, res) {
  try {
    const { district, machineType } = req.query;
    const filter = { isAvailable: true };
    if (district) filter.district = district;
    if (machineType) filter.machineType = machineType;

    const machines = await Machine.find(filter)
      .populate("owner", "name phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, machines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMachineById(req, res) {
  try {
    const machine = await Machine.findById(req.params.id).populate(
      "owner",
      "name phone"
    );
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

    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    if (machine.unavailableDates.includes(requestedDate)) {
      return res
        .status(409)
        .json({ success: false, message: "Machine already booked for this date" });
    }

    const booking = await MachineBooking.create({
      farmer: req.user._id,
      farmerPhone: req.user.phone || "",
      machine: machine._id,
      machineType: machine.machineType,
      requestedDate,
      source: "WEB",
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMyBookings(req, res) {
  try {
    const bookings = await MachineBooking.find({ farmer: req.user._id })
      .populate("machine", "name machineType pricePerDay district")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ---------------------------- OWNER SIDE ---------------------------- */

async function createMachine(req, res) {
  try {
    const { machineType, name, description, pricePerDay, district, location, photoUrl } =
      req.body;

    const machine = await Machine.create({
      owner: req.user._id,
      machineType,
      name,
      description,
      pricePerDay,
      district,
      location,
      photoUrl,
    });

    res.status(201).json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMyMachines(req, res) {
  try {
    const machines = await Machine.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, machines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateMachine(req, res) {
  try {
    const machine = await Machine.findOne({ _id: req.params.id, owner: req.user._id });
    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    Object.assign(machine, req.body);
    await machine.save();

    res.json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getOwnerBookings(req, res) {
  try {
    const myMachines = await Machine.find({ owner: req.user._id }).select("_id");
    const machineIds = myMachines.map((m) => m._id);

    const bookings = await MachineBooking.find({ machine: { $in: machineIds } })
      .populate("farmer", "name phone")
      .populate("machine", "name machineType")
      .sort({ createdAt: -1 });

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

    const booking = await MachineBooking.findById(req.params.id).populate("machine");
    if (!booking || String(booking.machine.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    if (status === "APPROVED") {
      await Machine.findByIdAndUpdate(booking.machine._id, {
        $addToSet: { unavailableDates: booking.requestedDate },
      });
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