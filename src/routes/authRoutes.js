const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

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
module.exports = router;
