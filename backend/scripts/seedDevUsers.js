const mongoose = require("mongoose");
const User = require("../src/models/User");

mongoose.connect("mongodb://127.0.0.1:27017/vivasayi-nanban")
  .then(async () => {
    console.log("Connected to MongoDB for seeding...");

    const users = [
      {
        name: "Test Farmer",
        email: "farmer@test.com",
        phone: "9999999991",
        password: "password123",
        role: "farmer",
        isVerified: true,
      },
      {
        name: "Test Agri Agency",
        email: "agency@test.com",
        phone: "9999999992",
        password: "password123",
        role: "agri_agency",
        isVerified: true,
      },
      {
        name: "Test Machine Owner",
        email: "machine@test.com",
        phone: "9999999993",
        password: "password123",
        role: "machine_owner",
        isVerified: true,
      },
      {
        name: "Test Agri Officer",
        email: "officer@test.com",
        phone: "9999999994",
        password: "password123",
        role: "agri_officer",
        isVerified: true,
      },
      {
        name: "Test Admin",
        email: "admin@test.com",
        phone: "9999999995",
        password: "password123",
        role: "admin",
        isVerified: true,
      }
    ];

    for (let u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created ${u.role}: ${u.email}`);
      } else {
        console.log(`${u.role} already exists`);
      }
    }
    process.exit();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
