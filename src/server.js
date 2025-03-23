require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const passport = require("./config/passport"); // Import Passport.js
const connectDB = require("./config/db"); // Import DB connection
const statsRoutes = require("./routes/statsRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
connectDB(); // Connect to MongoDB

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/stats", statsRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});
console.log("Stats Routes Loaded:", statsRoutes);
console.log("User Routes Loaded:", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
