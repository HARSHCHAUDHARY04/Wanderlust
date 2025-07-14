const express=require("express");
const app=express();
const mongoose=require("mongoose")
const Listing=require("./models/listing.js")
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/review.js");
const {listingSchema ,reviewSchema}=require("./schema.js");
const listings=require("./routes/listing.js");

const mongo_url="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(mongo_url);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use((req, res, next) => {
    res.locals.currUser = null;
    next();
});

app.get("/",(req,res)=>{
    res.send("welcome back");
})




const validateReview = async (req, res, next) => {
    try {
        await reviewSchema.validateAsync(req.body);
        next();
    } catch (error) {
        let errormsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errormsg);
    }
};

const validatelisting = async (req, res, next) => {
    try {
        await listingSchema.validateAsync(req.body);
        next();
    } catch (error) {
        let errormsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errormsg);
    }
};


app.use("/listings",listings);


//index route
app.get("/",async(req,res)=>{
   const allListing=await Listing.find({});
   res.render("listings/index", { listings: allListing });  

});

//new route
app.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show",{listing});
})
);

//create route
app.post("/",validatelisting,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

})
);

//edit route
app.get("/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})
);

//update route
app.put("/:id",validatelisting,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})
);

//delete route
app.delete("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");  
})
);

//reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}))

//delete review route
app.delete("/listings/:id/review/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
})
)


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


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let { statusCode = 500, message = "Something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});







app.listen(8080,()=>{
    console.log("server is on port 8080");
});
