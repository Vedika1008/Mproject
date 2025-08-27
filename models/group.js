const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  sharedListings: [{
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  sharedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

}]

});
module.exports = mongoose.model("Group", groupSchema);

// // Check if user is a member of the group
// groupSchema.methods.isMember = function(userId) {
//   return this.members.some(member => 
//     member.toString() === userId.toString()
//   );
// };

// // Check if user is the creator
// groupSchema.methods.isCreator = function(userId) {
//   return this.creator.toString() === userId.toString();
// };
