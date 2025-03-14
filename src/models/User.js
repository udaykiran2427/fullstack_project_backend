const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  profileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
