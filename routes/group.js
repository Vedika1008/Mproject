
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateGroup, isGroupExists, isGroupMember } = require("../middleware");
const groupController = require("../controllers/groups");

// Route for displaying all groups and creating a new group
router.route("/")
    .get(isLoggedIn, wrapAsync(groupController.index))
    .post(isLoggedIn,validateGroup, wrapAsync(groupController.createGroup));

//  new group form
router.get("/new", isLoggedIn, groupController.renderNewForm);

// Routes for showing and deleting a specific group
router.route("/:id")
    .get(isLoggedIn,isGroupExists, wrapAsync(groupController.showGroup))
    .delete(isLoggedIn,isGroupExists, wrapAsync(groupController.destroyGroup));

// Route to render the add member form
router.route("/:id/add-member")
     .get(isLoggedIn,isGroupExists, isGroupMember, wrapAsync(groupController.renderAddMemberForm))
     .post(isLoggedIn,isGroupExists, isGroupMember, wrapAsync(groupController.addMember));

module.exports = router;
// // routes/groups.js
// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync");
// const Group = require("../models/group"); // make sure this is created if not already
// const User = require("../models/user");
// const { isLoggedIn } = require("../middleware"); // to protect group page

// // INDEX route to show all groups
// router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
//     const groups = await Group.find({members: req.user._id }); // later we can filter only groups user is part of
//     res.render("groups/index", { groups });
// }));

// // GET route to render new group form
// router.get("/new", isLoggedIn, (req, res) => {
//   res.render("groups/new");
// });

// // POST route to create a group
// router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
//   const group = new Group(req.body.group);
//   group.creator = req.user._id;
//   group.members.push(req.user._id); // creator is also a member
//   await group.save();
//   req.flash("success", "Group created!");
//   res.redirect("/listings/groups");
// }));

// router.get("/:id", isLoggedIn, wrapAsync(async (req, res) => {
//   const { id } = req.params;
//   const group = await Group.findById(id)
//     .populate("creator")
//     .populate("members", "username")
//     .populate({
//       path: "sharedListings.listing",
//       populate: { path: "owner", select: "username" }
//     })
//     .populate("sharedListings.sharedBy", "username");

//   if (!group) {
//     req.flash("error", "Group not found");
//     return res.redirect("/listings/groups");
//   }

//   res.render("groups/show", { group });
// }));

// //add member
// router.get("/:id/add-member", isLoggedIn, wrapAsync(async (req, res) => {
//   const { id } = req.params;
//   const group = await Group.findById(id);

//   if (!group) {
//     req.flash("error", "Group not found");
//     return res.redirect("/listings/groups");
//   }

//   // Allow any member to add others
//   const isMember = group.members.some(memberId => memberId.equals(req.user._id));
//   if (!isMember) {
//     req.flash("error", "Only group members can add others.");
//     return res.redirect("/listings/groups");
//   }

//   res.render("groups/add-member", { group });
// }));
// router.post("/:id/add-member", isLoggedIn, wrapAsync(async (req, res) => {
//   const { id } = req.params;
//   const { username } = req.body;

//   const group = await Group.findById(id);

//   if (!group) {
//     req.flash("error", "Group not found");
//     return res.redirect("/listings/groups");
//   }

//   // Ensure current user is a member
//   const isMember = group.members.some(memberId => memberId.equals(req.user._id));
//   if (!isMember) {
//     req.flash("error", "Only group members can add others.");
//     return res.redirect("/listings/groups");
//   }

//   const userToAdd = await User.findOne({ username });

//   if (!userToAdd) {
//     req.flash("error", "User not found.");
//     return res.redirect(`/listings/groups/${id}/add-member`);
//   }

//   // Prevent adding duplicates
//   const alreadyMember = group.members.some(memberId => memberId.equals(userToAdd._id));
//   if (alreadyMember) {
//     req.flash("info", "User is already a member.");
//     return res.redirect(`/listings/groups/${id}`);
//   }

//   group.members.push(userToAdd._id);
//   await group.save();

//   req.flash("success", `Added ${username} to the group.`);
//   res.redirect(`/listings/groups/${id}`);
// }));

// module.exports = router;