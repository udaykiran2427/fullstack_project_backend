const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
  res.json({ message: "Auth route is working" });
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/", session: false }),
  async (req, res) => {
    try {
      const { id, username, photos, profileUrl } = req.user;
      let user = await User.findOne({ githubId: id });

      if (!user) {
        user = new User({
          githubId: id,
          username,
          avatar: photos[0].value,
          profileUrl,
        });
        await user.save();
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "GitHub login successful", token, user });
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile fetched successfully", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
