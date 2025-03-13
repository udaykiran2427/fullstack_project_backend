require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("./config/passport"); // Import Passport.js

app.use(cors());
app.use(express.json());
app.use("/auth", require("./routes/authRoutes"));
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
