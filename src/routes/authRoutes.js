const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/", session: false }),
  (req, res) => {
    res.send("GitHub login sucessful!");
  }
);
module.exports = router;
