const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },

    // 4 roles
    role: {
      type: String,
      enum: ["farmer", "dealer", "machine_owner", "admin"],
      required: true,
    },

    // Farmer-specific fields
    farmerProfile: {
      location: { type: String },
      district: { type: String },
      landSize: { type: Number }, // in acres
      crops: [{ type: String }],  // crops currently growing
      priceAlertThreshold: { type: Map, of: Number }, // crop -> price threshold
    },

    // Dealer-specific fields
    dealerProfile: {
      shopName: { type: String },
      address: { type: String },
      district: { type: String },
      pincode: { type: String },
      gstNumber: { type: String },
      isVerified: { type: Boolean, default: false },
    },

    // Machine Owner-specific fields
    machineOwnerProfile: {
      district: { type: String },
      serviceRadius: { type: Number }, // in km
      machines: [
        {
          type: { type: String }, // tractor, harvester, etc.
          model: { type: String },
          ratePerAcre: { type: Number },
          ratePerHour: { type: Number },
          isAvailable: { type: Boolean, default: true },
        },
      ],
      isVerified: { type: Boolean, default: false },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
