const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    farmerProfile: {
      location: String,
      district: String,
      taluk: String,
      village: String,
      pincode: String,
      landSize: Number, // in acres
      crops: [String],
    },
    role: {
      type: String,
      enum: ["farmer", "dealer", "machineOwner", "admin"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    dealerProfile: {
      shopName: String,
      address: String,
      district: String,
      pincode: String,
    },
    machineOwnerProfile: {
      district: String,
      serviceRadius: Number,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);