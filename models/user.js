const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  // ✅ FIX: Add the username field to the schema
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  }
});

// Use 'email' for login, but 'username' is still stored
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("User", userSchema);