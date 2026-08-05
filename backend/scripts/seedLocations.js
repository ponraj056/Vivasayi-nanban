require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Location = require("../src/models/Location");

const seedData = [
  // Karur District
  { district: "Karur", taluk: "Karur", village: "Thanthoni", pincode: "639006" },
  { district: "Karur", taluk: "Karur", village: "Vangal", pincode: "639116" },
  { district: "Karur", taluk: "Aravakurichi", village: "Pallapatti", pincode: "639205" },
  
  // Dindigul District
  { district: "Dindigul", taluk: "Dindigul West", village: "Sinthalavadampatti", pincode: "624002" },
  { district: "Dindigul", taluk: "Palani", village: "Ayakudi", pincode: "624613" },
  { district: "Dindigul", taluk: "Palani", village: "Balasamudram", pincode: "624610" },

  // Coimbatore District
  { district: "Coimbatore", taluk: "Coimbatore North", village: "Thudiyalur", pincode: "641034" },
  { district: "Coimbatore", taluk: "Pollachi", village: "Kottur", pincode: "642114" },
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    console.log("Clearing existing locations...");
    await Location.deleteMany();

    console.log("Inserting seed data...");
    await Location.insertMany(seedData);

    console.log("Location seed completed successfully!");
    process.exit();
  } catch (err) {
    console.error("Error seeding locations:", err);
    process.exit(1);
  }
};

seedLocations();
