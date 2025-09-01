const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const initData = require("../data.js"); // Path ko theek kiya gaya hai

// ---- MongoDB Connection ----
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderstay";

async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected for seeding");
    await initDb();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

main();

// ---- Seeding Function ----
const initDb = async () => {
  // Delete all existing data
  await listing.deleteMany({});
  
  // Insert new data from data.js
  await listing.insertMany(initData.sampleListings);
  console.log("✅ Data was initialized");
};