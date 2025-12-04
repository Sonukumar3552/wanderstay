
const mongoose = require("mongoose");
const initData = require("./data.js"); 
const Listing = require("../models/listing.js"); 

const MONGO_URL = "mongodb://127.0.0.1:27017/mydatabase"; 

// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

// Initialize database with seed data
const initDB = async () => {
  try {
    // Clear existing listings
    await Listing.deleteMany({});
    console.log("Existing listings removed.");

    // Insert sample data
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample listings.");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
main().then(() => initDB());