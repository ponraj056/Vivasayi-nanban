const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["farmer", "dealer", "machineOwner", "admin"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    // Role-specific profile fields
    village: { type: String, default: "" },
    district: { type: String, default: "" },
    landSize: { type: Number, default: null }, // farmer
    crops: [{ type: String }], // farmer
    shopName: { type: String, default: "" }, // dealer
    businessType: { type: String, default: "" }, // dealer
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);