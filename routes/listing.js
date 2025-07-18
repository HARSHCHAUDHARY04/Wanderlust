const express = require('express');  
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js")
const {isLoggedIn,isOwner,validatelisting}=require("../middleware.js");


//index route
router.get("/",async(req,res)=>{
   const allListing=await Listing.find({});
   res.render("listings/index", { listings: allListing });  

});

//new route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show",{listing});
})
);

//create route
router.post("/",validatelisting,isLoggedIn,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");

})
);

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync (async(req,res)=>{
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
router.put("/:id",isLoggedIn,isOwner,validatelisting,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    // let listing=await Listing.findById(id);
    // if(!currUser && !listing.owner._id.equals(currUser._id)){
    //     req.flash("error","You dont have permission to edit");
    //     return res.redirect(`/listings/${id}`);
    // }

    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
})
);

//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Successfully deleted the listing!");
    console.log(deleteListing);
    res.redirect("/listings");  
})
);

module.exports = router;