require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Location = require("../src/models/Location");

const seedDataNested = [
  {
    "district": "Karur",
    "taluks": [
      {
        "taluk": "Karur",
        "villages": [
          { "village": "Thanthoni", "pincode": "639006" },
          { "village": "Vangal", "pincode": "639116" }
        ]
      },
      {
        "taluk": "Aravakurichi",
        "villages": [
          { "village": "Pallapatti", "pincode": "639205" }
        ]
      }
    ]
  },
  {
    "district": "Dindigul",
    "taluks": [
      {
        "taluk": "Dindigul West",
        "villages": [
          { "village": "Sinthalavadampatti", "pincode": "624002" }
        ]
      },
      {
        "taluk": "Palani",
        "villages": [
          { "village": "Ayakudi", "pincode": "624613" },
          { "village": "Balasamudram", "pincode": "624610" }
        ]
      }
    ]
  },
  {
    "district": "Coimbatore",
    "taluks": [
      {
        "taluk": "Coimbatore North",
        "villages": [
          { "village": "Thudiyalur", "pincode": "641034" },
          { "village": "Thudiyalur", "pincode": "641029" } // Test multiple pincodes
        ]
      },
      {
        "taluk": "Pollachi",
        "villages": [
          { "village": "Kottur", "pincode": "642114" }
        ]
      }
    ]
  }
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    console.log("Clearing existing locations...");
    await Location.deleteMany();

    console.log("Parsing and inserting seed data...");
    const flatData = [];
    seedDataNested.forEach(d => {
      d.taluks.forEach(t => {
        t.villages.forEach(v => {
          flatData.push({
            district: d.district,
            taluk: t.taluk,
            village: v.village,
            pincode: v.pincode
          });
        });
      });
    });

    await Location.insertMany(flatData);

    console.log(`Successfully seeded ${flatData.length} locations!`);
    process.exit();
  } catch (err) {
    console.error("Error seeding locations:", err);
    process.exit(1);
  }
};

seedLocations();
