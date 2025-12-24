const express = require("express");
const dotenv = require("dotenv");
const cors= require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use(cookieParser());



const authroute=require("./src/routes/authroute");
const reelroute=require("./src/routes/reelroute");
const commentroute=require("./src/routes/commentroute");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8008;

app.use("/api/auth",authroute);
app.use("/api/reels",reelroute);
app.use("/api/comments",commentroute);
app.get('/test', (req, res) => {
  res.send('Server is working');
});

module.exports=app;