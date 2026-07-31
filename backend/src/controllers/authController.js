const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, farmerProfile, dealerProfile, machineOwnerProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name, email, phone, password, role,
      farmerProfile: role === "farmer" ? farmerProfile : undefined,
      dealerProfile: role === "dealer" ? dealerProfile : undefined,
      machineOwnerProfile: role === "machine_owner" ? machineOwnerProfile : undefined,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/auth/dashboard
// @access Private — returns dashboard data based on role
const getDashboard = async (req, res) => {
  const roleMessages = {
    farmer: "Farmer dashboard — crop advisory, price alerts, expense tracker",
    dealer: "Dealer dashboard — stock management, incoming orders",
    machine_owner: "Machine Owner dashboard — availability, bookings",
    admin: "Admin dashboard — all users, verification, village analytics",
  };
  res.status(200).json({
    success: true,
    role: req.user.role,
    message: roleMessages[req.user.role],
    user: req.user,
  });
};

module.exports = { register, login, getMe, getDashboard };
