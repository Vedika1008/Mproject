const Group = require("../models/group");
const User = require("../models/user");

// Renders the page showing all groups for the current user
module.exports.index = async (req, res) => {
    const groups = await Group.find({ members: req.user._id });
    res.render("groups/index", { groups });
};

// Renders the form to create a new group
module.exports.renderNewForm = (req, res) => {
    res.render("groups/new");
};

// Handles the creation of a new group
module.exports.createGroup = async (req, res) => {
    const group = new Group(req.body.group);
    group.creator = req.user._id;
    group.members.push(req.user._id); // The creator is automatically a member
    await group.save();
    req.flash("success", "Group created!");
    res.redirect("/listings/groups");
};

// Shows the details of a specific group
module.exports.showGroup = async (req, res) => {
    const { id } = req.params;
    const group = await Group.findById(id)
        .populate("creator")
        .populate("members", "username")
        .populate({
            path: "sharedListings.listing",
            populate: { path: "owner", select: "username" }
        })
        .populate("sharedListings.sharedBy", "username");

    // if (!group) {
    //     req.flash("error", "Group not found");
    //     return res.redirect("/listings/groups");
    // }

    res.render("groups/show", { group });
};

// Renders the form to add a new member to a group
module.exports.renderAddMemberForm = async (req, res) => {
    // const { id } = req.params;
    // const group = await Group.findById(id);

    // if (!group) {
    //     req.flash("error", "Group not found");
    //     return res.redirect("/listings/groups");
    // }

    // const isMember = group.members.some(memberId => memberId.equals(req.user._id));
    // if (!isMember) {
    //     req.flash("error", "Only group members can add others.");
    //     return res.redirect("/listings/groups");
    // }

    res.render("groups/add-member", { group: req.group });
};

// Handles adding a member to a group
module.exports.addMember = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    const group = req.group;

    // const group = await Group.findById(id);

    // if (!group) {
    //     req.flash("error", "Group not found");
    //     return res.redirect("/listings/groups");
    // }

    // const isMember = group.members.some(memberId => memberId.equals(req.user._id));
    // if (!isMember) {
    //     req.flash("error", "Only group members can add others.");
    //     return res.redirect("/listings/groups");
    // }

    const userToAdd = await User.findOne({ username });

    if (!userToAdd) {
        req.flash("error", "User not found.");
        return res.redirect(`/listings/groups/${id}/add-member`);
    }

    const alreadyMember = group.members.some(memberId => memberId.equals(userToAdd._id));
    if (alreadyMember) {
        req.flash("info", "User is already a member.");
        return res.redirect(`/listings/groups/${id}`);
    }

    group.members.push(userToAdd._id);
    await group.save();

    req.flash("success", `Added ${username} to the group.`);
    res.redirect(`/listings/groups/${id}`);
};

// Handles the deletion of a group
module.exports.destroyGroup = async (req, res) => {
    const { id } = req.params;
    await Group.findByIdAndDelete(id);
    req.flash("success", "Group deleted!");
    res.redirect("/listings/groups");
};
