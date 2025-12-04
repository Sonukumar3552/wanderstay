// IMPORTS & SETUP
if (process.env.NODE_ENV !== "production") {
  // Local pe .env se load karega
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");

// Cloudinary
const { storage } = require("./cloudinary");
const upload = multer({ storage });

// MODELS & UTILS
const User = require("./models/user");
const Listing = require("./models/listing");
const Review = require("./models/review");
const wrapAsync = require("./utils/wrapAsync");
const { listingSchema, reviewSchema } = require("./schema");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  validateReview,
  isReviewAuthor,
} = require("./middleware");
const ExpressError = require("./utils/ExpressError");

// DATABASE CONNECTION
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/travelnest";

mongoose
  .connect(dbUrl)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// APP CONFIG
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Render / production ke liye proxy trust
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// SESSION & FLASH
const secret = process.env.SECRET || "mysupersecretcode";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // production me secure cookie
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GLOBAL MIDDLEWARE
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// AUTH ROUTES
app.get("/register", (req, res) => res.render("users/register"));

app.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to TravelNest!");
      res.redirect("/listings");
    });
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

// ALL LISTINGS + FILTERING
app.get(
  ["/", "/listings"],
  wrapAsync(async (req, res) => {
    const { category } = req.query;

    let filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    const alllisting = await Listing.find(filter);

    res.render("listing/index", {
      alllisting,
      category: category || "all",
    });
  })
);

// NEW LISTING FORM
app.get("/listings/new", isLoggedIn, (req, res) =>
  res.render("listing/new")
);

// CREATE LISTING WITH CLOUDINARY
app.post(
  "/listings",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  wrapAsync(async (req, res) => {
    console.log("FILE =>", req.file);
    console.log("BODY =>", req.body.listing);

    const listingData = req.body.listing || req.body; // safety

    listingData.owner = req.user._id;

    if (req.file) {
      listingData.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      listingData.image = {
        url: "https://tse1.mm.bing.net/th/id/OIP.FtudhIBH-HYhxMpS4TU-sAHaE8?rs=1&pid=ImgDetMain",
        filename: "default",
      };
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${newListing._id}`);
  })
);

// SHOW LISTING
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

// EDIT LISTING FORM
app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    res.render("listing/edit", { listing });
  })
);

// UPDATE LISTING
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

// DELETE LISTING
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

// REVIEW ROUTES
app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success", "Review added!");
    res.redirect(`/listings/${listing._id}`);
  })
);

app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);

// 404 FOR UNKNOWN ROUTES
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(" Error:", err);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listing/error", { message });
});

// START SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(` Server running at http://localhost:${PORT}`)
);