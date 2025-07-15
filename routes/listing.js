const express = require('express');  
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema }=require("../schema.js");
const Listing=require("../models/listing.js")


// FIXED validatelisting middleware
const validatelisting = async (req, res, next) => {
    try {
        await listingSchema.validateAsync(req.body);
        next();
    } catch (error) {
        let errormsg;
        if (error.details) {
            errormsg = error.details.map((el) => el.message).join(",");
        } else {
            errormsg = error.message;
        }
        throw new ExpressError(400, errormsg);
    }
};


//index route
router.get("/",async(req,res)=>{
   const allListing=await Listing.find({});
   res.render("listings/index", { listings: allListing });  

});

//new route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
})
);

//create route
router.post("/",validatelisting,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");

})
);

//edit route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
    req.flash("error","Listing not found!");
    return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
})
);

//update route
router.put("/:id",validatelisting,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
})
);

//delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Successfully deleted the listing!");
    console.log(deleteListing);
    res.redirect("/listings");  
})
);

module.exports = router;