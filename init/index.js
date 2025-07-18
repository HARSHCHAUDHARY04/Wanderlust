const mongoose=require("mongoose");
const initdata=require("./data");
const Listing=require("../models/listing.js");


const mongo_url="mongodb://127.0.0.1:27017/wanderlust"

main().then(()=>{
    console.log("connected to db")
})
.catch((err)=>{
    console.log(err)
});

async function main() {
    await mongoose.connect(mongo_url)
}

const initDB= async ()=>{
    await Listing.deleteMany({});
    const dataWithOwner=initdata.data.map((obj)=>({...obj,owner:"6878a9b38c457a4e6577626d"}))
    await Listing.insertMany(dataWithOwner);
    console.log("data was initialized")
}

initDB();