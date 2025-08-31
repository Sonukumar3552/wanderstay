const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/mydatabase";

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
    res.send("Hi I am root");
});

app.get("/listing", async (req, res) => {
    const alllisting = await listing.find({});
    res.render("listing/index", { alllisting });
});

app.get("/listing/new",(req,res)=>{
    res.render("listing/new.ejs");
});

app.get("/listing/:id", async (req, res) => {
    let { id } = req.params;
    const foundListing = await listing.findById(id);
    res.render("listing/show.ejs", { listing: foundListing });
});

app.post("/listing", async (req, res) => {
    const newListing = new listing(req.body);
    await newListing.save();
    res.redirect(`/listing/${newListing._id}`);
});

app.get("/listing/:id/edit", async(req , res)=>{
     let { id } = req.params;
    const foundListing = await listing.findById(id);
    res.render("listing/edit.ejs", { foundListing});
});

app.put("/listing/:id", async (req , res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id , {...req.body.listing})
    res.redirect("/listing");
});

app.delete("/listing/:id", async (req, res) => {
    let {id} = req.params;
    let deletedlisting = await listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listing");
});

app.get("/testlisting", async (req, res) => {
    let samplelisting = new listing({
        title: "My new villa",
        description: "By the beach",
        price: 1000,
        location: "Goa",
        country: "India"
    });
    await samplelisting.save();
    console.log("sample was saved");
    res.send("successful testing");
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
