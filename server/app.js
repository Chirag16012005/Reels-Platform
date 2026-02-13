const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
}));
app.use(cookieParser());

const authroute = require("./src/routes/authroute");
const reelroute = require("./src/routes/reelroute");
const commentroute = require("./src/routes/commentroute");
const grouproute = require("./src/routes/grouproute");
const messageroute = require("./src/routes/messageroute");
const userroute = require("./src/routes/userroute");

// Body parsing - these won't interfere with multipart/form-data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

const PORT = process.env.PORT || 8008;

app.use("/api/auth", authroute);
app.use("/api/reels", reelroute);
app.use("/api/comments", commentroute);
app.use("/api/groups", grouproute);
app.use("/api/messages", messageroute);
app.use("/api/users", userroute);

app.get('/test', (req, res) => {
  res.send('Server is working');
});

module.exports = app;