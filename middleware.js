const Listing=require("./models/listing");
const Review=require("./models/review");
const Group = require("./models/group");
const {listingSchema, reviewSchema, groupSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");

module.exports.isLoggedIn=(req,res,next)=>{
      if(!req.isAuthenticated()){
        //redirect url
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
        } 
     next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
      req.flash("error", "Cannot find that property!");
      return res.redirect("/listings");
  }

  // THE FIX: Compare the owner's ID directly.
  if (!listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this property");
      return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing =(req,res,next)=>{
  let {error} =listingSchema.validate(req.body);
  if(error){
    let errMsg= error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  } else{
    next();
  }
};
module.exports.validateReview =(req,res,next)=>{
  let {error} =reviewSchema.validate(req.body);
  if(error){
    let errMsg= error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  } else{
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};


module.exports.validateGroup = (req, res, next) => {
  const { error } = groupSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.isGroupExists = async (req, res, next) => {
  const { id } = req.params;
  const group = await Group.findById(id);
  if (!group) {
    req.flash("error", "Group not found");
    return res.redirect("/listings/groups");
  }
  req.group = group; // attach for later use
  next();
};
module.exports.isGroupMember = (req, res, next) => {
  const group = req.group;
  const isMember = group.members.some(memberId => memberId.equals(req.user._id));
  if (!isMember) {
    req.flash("error", "Only group members can perform this action.");
    return res.redirect("/listings/groups");
  }
  next();
};
