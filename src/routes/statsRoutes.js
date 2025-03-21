const express = require("express");
const axios = require("axios");
const router = express.Router();

// Get GitHub Stats
router.get("/github/:username", async (req, res) => {
  const { username } = req.params;
  console.log(`✅ GitHub route hit! Username: ${req.params.username}`);
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`
    );
    res.json({
      username: response.data.login,
      avatar: response.data.avatar_url,
      publicRepos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
});

// Get CodeForces Stats
router.get("/codeforces/:handle", async (req, res) => {
  const { handle } = req.params;
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    res.json({
      username: response.data.result[0]?.handle, // Handle undefined cases
      rank: response.data.result[0]?.rank,
      rating: response.data.result[0]?.rating,
      maxRank: response.data.result[0]?.maxRank,
      maxRating: response.data.result[0]?.maxRating,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CodeForces data" });
  }
});

// Get LeetCode Stats
router.get("/leetcode/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile { ranking reputation }
              submitStats: submitStatsGlobal { acSubmissionNum { count } }
            }
          }
        `,
        variables: { username },
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data.data.matchedUser;
    if (!data) {
      return res.status(404).json({ error: "LeetCode user not found" });
    }

    res.json({
      username: data.username,
      ranking: data.profile?.ranking,
      reputation: data.profile?.reputation,
      totalSolved: data.submitStats?.acSubmissionNum[0]?.count || 0, // Handle missing data
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch LeetCode data" });
  }
});

module.exports = router;
