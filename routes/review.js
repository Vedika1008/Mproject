const express =require("express");
const router =express.Router({mergeParams: true});
const wrapAsync=require("../utils/wrapAsync.js");
const Review=require("../models/review")
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing")
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewController= require("../controllers/reviews.js");

//post route
router.post("/", validateReview,isLoggedIn,
  wrapAsync(reviewController.createReview));
//delete review route
router.delete("/:reviewId",isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReviews));

module.exports=router;