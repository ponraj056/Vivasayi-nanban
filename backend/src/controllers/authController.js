const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, farmerProfile, dealerProfile, machineOwnerProfile } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required for OTP verification." });
    }

    let user = await User.findOne({ email });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: "Email already registered and verified." });
      }
      // Update existing unverified user with new details and OTP
      user.name = name;
      user.phone = phone;
      user.password = password; // Will be hashed again by pre-save
      user.role = role;
      user.farmerProfile = role === "farmer" ? farmerProfile : undefined;
      user.dealerProfile = role === "dealer" ? dealerProfile : undefined;
      user.machineOwnerProfile = role === "machineOwner" ? machineOwnerProfile : undefined;
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      user = await User.create({
        name, email, phone, password, role,
        farmerProfile: role === "farmer" ? farmerProfile : undefined,
        dealerProfile: role === "dealer" ? dealerProfile : undefined,
        machineOwnerProfile: role === "machineOwner" ? machineOwnerProfile : undefined,
        otp, otpExpiry
      });
    }

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: "Vivasayi Nanban - Account Verification OTP",
      text: `Your OTP for registration is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      email: user.email,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: err.message.includes("SMTP") || err.message.includes("Could not send email") ? "Could not send OTP email. Please check your SMTP settings in .env." : (err.message || "Registration failed") });
  }
};

// @route  POST /api/auth/verify-otp
// @access Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
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

// @route  POST /api/auth/resend-otp
// @access Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Vivasayi Nanban - Resend Verification OTP",
      text: `Your new OTP for registration is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({ success: true, message: "A new OTP has been sent to your email" });
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

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Email not verified. Please verify your email first." });
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

// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Vivasayi Nanban - Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({ success: true, message: "Password reset OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Set new password, pre-save hook will hash it
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password has been reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, verifyOTP, resendOTP, forgotPassword, resetPassword, login, getMe, getDashboard };
