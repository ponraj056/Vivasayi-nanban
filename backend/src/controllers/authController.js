const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const sendEmail = require("../utils/sendEmail");

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, farmerProfile, dealerProfile, machineOwnerProfile } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required for OTP verification." });
    }

    let user = await prisma.user.findFirst({ where: { email } });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: "Email already registered and verified." });
      }
      // Update existing unverified user with new details and OTP
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone,
          password: hashedPassword,
          role,
          otp,
          otpExpiry,
        }
      });
      
      // Update profiles if needed (simplified for this demo: create or update)
      // Usually, you'd use upsert, but for unverified we can assume it's new
      
    } else {
      const data = {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        otp,
        otpExpiry,
      };

      if (role === "farmer" && farmerProfile) {
        data.farmerProfile = { create: farmerProfile };
      } else if (role === "dealer" && dealerProfile) {
        data.dealerProfile = { create: dealerProfile };
      } else if (role === "machine_owner" && machineOwnerProfile) {
        data.machineOwnerProfile = { create: machineOwnerProfile };
      }

      user = await prisma.user.create({ data });
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

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    const token = generateToken(updatedUser.id);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
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

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    });

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

    const user = await prisma.user.findFirst({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Email not verified. Please verify your email first." });
    }

    const token = generateToken(user.id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        farmerProfile: true,
        dealerProfile: true,
        machineOwnerProfile: true
      }
    });
    // Remove password from response
    if (user) delete user.password;
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/auth/dashboard
// @access Private
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
    user: req.user, // Note: req.user should already have password omitted from middleware
  });
};

// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    });

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

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    res.status(200).json({ success: true, message: "Password has been reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, verifyOTP, resendOTP, forgotPassword, resetPassword, login, getMe, getDashboard };
