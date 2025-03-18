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

      // const token = jwt.sign(
      //   { id: user.id, username: user.username },
      //   process.env.JWT_SECRET,
      //   { expiresIn: "1h" }
      // );
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite: "strict",
      });
      res.json({ message: "GitHub login successful", accessToken, user });
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

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
});

module.exports = router;
