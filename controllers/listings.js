const Listing=require("../models/listing")
const Group = require("../models/group");
module.exports.index=async(req,res)=>{
  const allListings = await Listing.find({});
  res.render("listings/index.ejs",{allListings});  
};

module.exports.renderNewForm=(req,res)=>{
  res.render("listings/new.ejs")
};

module.exports.showListing= async(req,res)=>{
 let {id} =req.params;
  const listing=await Listing.findById(id)
  .populate({
    path:"reviews",
  populate:{
    path:"author"
  },
})
  .populate("owner");
  if(!listing){
    req.flash("error","Listing You requested for does not exist");
    return res.redirect("/listings");
  }
let userGroups = [];
    if (req.user) {
        userGroups = await Group.find({ members: req.user._id });
    }  
    res.render("listings/show.ejs",{listing,userGroups})
};

module.exports.createListing=async(req,res)=>{
 let url= req.file.path;
//  listing.owner = req.user._id;
 let filename=req.file.filename;
  const newListing=new Listing(req.body.listing);
  newListing.owner=req.user._id;
  newListing.image={url,filename};
  await newListing.save();
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm=async(req,res)=>{
  let {id} =req.params;
  const listing=await Listing.findById(id);
   if(!listing){
    req.flash("error","Listing You requested for does not exist");
    return res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url;
originalImageUrl = originalImageUrl.replace("/upload", "/upload/c_fill,h_30,w_25");
  res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async(req,res)=>{
  let {id} =req.params;
 let listing =await Listing.findByIdAndUpdate(id,{...req.body.listing});
 if(typeof req.file !=="undefined"){
  let url= req.file.path;
 let filename=req.file.filename;
 listing.image={url,filename};
 await listing.save();
 }
 req.flash("success","Listing Updated!");
 res.redirect(`/listings/${id}`)
};


module.exports.destroyListing=async(req,res)=>{
  let {id} =req.params;
  let deletedListing= await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted!");
  res.redirect("/listings");
};

module.exports.shareListingWithGroup = async (req, res) => {
  const { id } = req.params;
  const { groupId } = req.body;

  const group = await Group.findById(groupId);
  if (!group) {
    req.flash("error", "Group not found");
    return res.redirect("/listings");
  }

  const isMember = group.members.some(memberId => memberId.equals(req.user._id));
  if (!isMember) {
    req.flash("error", "You can only share to groups you're a member of.");
    return res.redirect(`/listings/${id}`);
  }

  const alreadyShared = group.sharedListings.some(sl => sl.listing.equals(id));
  if (alreadyShared) {
    req.flash("info", "Already shared with that group.");
    return res.redirect(`/listings/${id}`);
  }

  group.sharedListings.push({
    listing: id,
    sharedBy: req.user._id
  });

  await group.save();

  req.flash("success", "Listing shared successfully!");
  res.redirect(`/listings/${id}`);
};
