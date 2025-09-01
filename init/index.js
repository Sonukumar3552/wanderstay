const mongoose = require("mongoose");
const initData = require("../index/data.js");
const listing = require("../index/models/listing.js");


const MONGO_URL ="mongodb://127.0.0.1:27017/mydatabase";


main().then(() => {
    console.log("connected to DB")
})
 .catch((err)=>{
    console.log(err);
 });

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await listing.deleteMany({});
    await listing.insertMany(initData.data);
    console.log("DAta was initialized");

}

initDB();
