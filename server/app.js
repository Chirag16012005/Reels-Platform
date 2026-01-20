const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(cookieParser());

const authroute = require("./src/routes/authroute");
const reelroute = require("./src/routes/reelroute");
const commentroute = require("./src/routes/commentroute");
const grouproute = require("./src/routes/grouproute");

// Body parsing - these won't interfere with multipart/form-data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

const PORT = process.env.PORT || 8008;

app.use("/api/auth", authroute);
app.use("/api/reels", reelroute);
app.use("/api/comments", commentroute);
app.use("/api/groups", grouproute);

app.get('/test', (req, res) => {
  res.send('Server is working');
});

module.exports = app;