// =============================
// IMPORTS & SETUP
// =============================
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

require("dotenv").config();


// MODELS & UTILS
const User = require("./models/user");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync");
const { listingSchema, reviewSchema } = require("./schema.js");
const { isLoggedIn, isOwner, validateListing, validateReview, isReviewAuthor } = require("./middleware.js");
const ExpressError = require("./utils/ExpressError.js");


// =============================
// DATABASE CONNECTION
// =============================
// const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// mongoose
//   .connect("mongodb://127.0.0.1:27017/mydatabase", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected Successfully"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// =============================
// APP CONFIG
// =============================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =============================
// SESSION & FLASH
// =============================
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

app.use(session(sessionOptions));
app.use(flash());

// =============================
// PASSPORT CONFIG (EMAIL LOGIN)
// =============================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =============================
// GLOBAL MIDDLEWARE
// =============================
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// =============================
// AUTH ROUTES
// =============================
app.get("/register", (req, res) => res.render("users/register"));

app.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to TravelNest!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  })
);

app.get("/login", (req, res) => res.render("users/login"));

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});


// =============================
// LISTING ROUTES
// =============================

// All Listings
app.get(
  ["/", "/listings"],
  wrapAsync(async (req, res) => {
    const alllisting = await Listing.find({});
    res.render("listing/index", { alllisting });
  })
);

// New Listing Form
app.get("/listings/new", isLoggedIn, (req, res) => res.render("listing/new"));

// Create Listing
app.post(
  "/listings",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const listingData = req.body.listing;
    listingData.owner = req.user._id; 
    
    if (!listingData.image || !listingData.image.url) {
      listingData.image = {
        url: "https://tse1.mm.bing.net/th/id/OIP.FtudhIBH-HYhxMpS4TU-sAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
        filename: "default"
      };
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");
  })
);

// Show Listing
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    res.render("listing/show", { listing });
  })
);

// Edit Listing Form
app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listing/edit", { listing });
  })
);

// Update Listing
app.put(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  })
);


// Delete Listing
app.delete(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  })
);

// =============================
// REVIEW ROUTES
// =============================
app.post(
  "/listings/:id/reviews",
  isLoggedIn, // Sirf logged-in user hona zaroori hai
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success", "New review created!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review
app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor, // Sirf author hi delete kar sakta hai
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);



// =============================
// ERROR HANDLER
// =============================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res
    .status(statusCode)
    .render("listing/error", { message });
});


// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);