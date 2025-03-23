const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  profileUrl: { type: String },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now },

  githubStats: {
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
  codeforcesStats: {
    rank: { type: String, default: "Unrated" },
    rating: { type: Number, default: 0 },
    maxRank: { type: String, default: "Unrated" },
    maxRating: { type: Number, default: 0 },
  },
  leetcodeStats: {
    ranking: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
  },
});

userSchema.methods.setRefreshToken = async function (token) {
  const salt = await bcrypt.genSalt(10);
  this.refreshToken = await bcrypt.hash(token, salt);
};

userSchema.methods.isValidRefreshToken = async function (token) {
  return await bcrypt.compare(token, this.refreshToken);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
