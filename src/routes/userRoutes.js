const express = require("express");
const axios = require("axios");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Update user stats
router.post("/updateStats", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch latest stats from APIs
    const [githubRes, cfRes, leetcodeRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${user.username}`),
      axios.get(
        `https://codeforces.com/api/user.info?handles=${user.username}`
      ),
      axios.post("https://leetcode.com/graphql", {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile { ranking reputation }
              submitStats: submitStatsGlobal { acSubmissionNum { count } }
            }
          }
        `,
        variables: { username: user.username },
      }),
    ]);

    // Update user document
    user.githubStats = {
      publicRepos: githubRes.data.public_repos,
      followers: githubRes.data.followers,
      following: githubRes.data.following,
    };

    user.codeforcesStats = {
      rank: cfRes.data.result[0]?.rank || "Unrated",
      rating: cfRes.data.result[0]?.rating || 0,
      maxRank: cfRes.data.result[0]?.maxRank || "Unrated",
      maxRating: cfRes.data.result[0]?.maxRating || 0,
    };

    const lcData = leetcodeRes.data.data.matchedUser;
    user.leetcodeStats = {
      ranking: lcData?.profile?.ranking || 0,
      reputation: lcData?.profile?.reputation || 0,
      totalSolved: lcData?.submitStats?.acSubmissionNum[0]?.count || 0,
    };

    await user.save();

    res.json({ message: "Stats updated successfully", user });
  } catch (error) {
    console.error("Error updating stats:", error);
    res.status(500).json({ message: "Failed to update stats" });
  }
});
// Get user stats
router.get("/stats", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      githubStats: user.githubStats,
      codeforcesStats: user.codeforcesStats,
      leetcodeStats: user.leetcodeStats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;
