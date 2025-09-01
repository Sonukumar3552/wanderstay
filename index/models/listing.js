const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: { type: String, default: "listingimage" },
    url: {
      type: String,
      default: "https://tse1.mm.bing.net/th/id/OIP.FtudhIBH-HYhxMpS4TU-sAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  },
  price: Number,
  location: String,
  country: String,
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;
