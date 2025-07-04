const express=require("express");
const app=express();
const mongoose=require("mongoose")
const Listing=require("./models/listing.js")
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");


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


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("welcome back")
})

//index route
app.get("/listings",async(req,res)=>{
   const allListing=await Listing.find({});
   res.render("listings/index", { listings: allListing });  

});

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show",{listing});
});

//create route
app.post("/listings",async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//edit route
app.get("/listings/:id/edit",async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");  
});


// app.get("/testlisting", async(req,res)=>{
//     let samplelisting=new Listing({
//         title:"My new villa",
//         description:"by the beach",
//         price:1200,
//         location:"delhi",
//         country:"india",
//     })
//     await samplelisting.save();
//     console.log("respose was saved");
//     res.send("successful testing")
// })







app.listen(3000,()=>{
    console.log("server is on port 3000");
});