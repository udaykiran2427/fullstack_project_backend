const express = require("express");
const axios = require("axios");
const router = express.Router();

// Middleware for input validation
const validateUsername = (username) => {
  if (!username || username.length < 2 || username.length > 50) {
    return false;
  }
  // Basic alphanumeric and some special characters check
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  return usernameRegex.test(username);
};

// Common error handler
const handleApiError = (res, platform, error) => {
  console.error(`Error fetching ${platform} data:`, error.message);

  if (error.response) {
    // The request was made and the server responded with a status code
    return res.status(error.response.status).json({
      error: `Failed to fetch ${platform} data`,
      details: error.response.data,
    });
  } else if (error.request) {
    // The request was made but no response was received
    return res.status(503).json({
      error: `${platform} service unavailable`,
      details: "No response received from external API",
    });
  } else {
    // Something happened in setting up the request
    return res.status(500).json({
      error: `Internal error fetching ${platform} data`,
      details: error.message,
    });
  }
};

// Get GitHub Stats
router.get("/github/:username", async (req, res) => {
  const { username } = req.params;

  // Validate input
  if (!validateUsername(username)) {
    return res.status(400).json({ error: "Invalid username format" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        timeout: 5000,
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    res.json({
      username: response.data.login,
      avatar: response.data.avatar_url,
      publicRepos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
      accountCreated: response.data.created_at,
    });
  } catch (error) {
    handleApiError(res, "GitHub", error);
  }
});

// Get CodeForces Stats
router.get("/codeforces/:handle", async (req, res) => {
  const { handle } = req.params;

  // Validate input
  if (!validateUsername(handle)) {
    return res.status(400).json({ error: "Invalid handle format" });
  }

  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      { timeout: 5000 }
    );

    // Handle case where no user is found
    if (!response.data.result || response.data.result.length === 0) {
      return res.status(404).json({ error: "CodeForces user not found" });
    }

    const userData = response.data.result[0];
    res.json({
      username: userData.handle,
      rank: userData.rank || "Unranked",
      rating: userData.rating || 0,
      maxRank: userData.maxRank || "N/A",
      maxRating: userData.maxRating || 0,
      titlePhoto: userData.titlePhoto || null,
    });
  } catch (error) {
    handleApiError(res, "CodeForces", error);
  }
});

// Get LeetCode Stats
router.get("/leetcode/:username", async (req, res) => {
  const { username } = req.params;

  // Validate input
  if (!validateUsername(username)) {
    return res.status(400).json({ error: "Invalid username format" });
  }

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile { 
                ranking 
                reputation 
                contestRanking
              }
              submitStats: submitStatsGlobal { 
                acSubmissionNum { 
                  count 
                  difficulty 
                } 
              }
            }
          }
        `,
        variables: { username },
      },
      {
        timeout: 5000,
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = response.data.data.matchedUser;
    if (!data) {
      return res.status(404).json({ error: "LeetCode user not found" });
    }

    res.json({
      username: data.username,
      ranking: data.profile?.ranking || "N/A",
      reputation: data.profile?.reputation || 0,
      totalSolved: data.submitStats?.acSubmissionNum[0]?.count || 0,
      contestRanking: data.profile?.contestRanking || "N/A",
    });
  } catch (error) {
    handleApiError(res, "LeetCode", error);
  }
});

module.exports = router;
