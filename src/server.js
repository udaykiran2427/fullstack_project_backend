require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const app = express();
const passport = require("./config/passport"); // Import Passport.js
const connectDB = require("./config/db"); // Import DB connection
connectDB(); // Connect to MongoDB

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/auth", authRoutes);
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
