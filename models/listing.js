const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

// =============================
// LISTING SCHEMA
// =============================
const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    // Image stored as object to support { url: "..." }
    image: {
      url: String,
      filename: String,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  }
);

// =============================
// CASCADE DELETE REVIEWS WHEN LISTING DELETED
// =============================
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

// =============================
// EXPORT MODEL
// =============================
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;