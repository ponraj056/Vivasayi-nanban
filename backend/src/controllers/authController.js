const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, phone, email, password, role, village, district, land_size, agency_details } = req.body;

    if (!phone || !password || !name || !role) {
      return res.status(400).json({ success: false, message: "Name, phone, role, and password are required." });
    }

    const validRoles = ["farmer", "dealer", "machineOwner", "agency"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    let existingPhone = await prisma.users.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "Phone number already registered." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const data = {
      name,
      phone,
      email,
      password_hash,
      role,
      village,
      district,
      land_size: land_size ? parseFloat(land_size) : null,
    };

    if (role === "agency" && agency_details) {
      data.agency_profile = {
        create: {
          business_name: agency_details.business_name,
          business_description: agency_details.business_description,
          phone: agency_details.phone || phone,
          email: agency_details.email || email,
          address: agency_details.address,
          village: agency_details.village || village,
          district: agency_details.district || district,
          pincode: agency_details.pincode,
          gst_number: agency_details.gst_number,
          license_number: agency_details.license_number,
          verification_status: "pending"
        }
      };
    }

    const user = await prisma.users.create({ data });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        district: user.district
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Please provide phone and password" });
    }

    const user = await prisma.users.findUnique({ where: { phone } });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    const token = generateToken(user.id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        district: user.district
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
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: {
        agency_profile: true
      }
    });
    
    if (user) {
      delete user.password_hash;
    }
    
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
