const express = require("express");
const dotenv = require("dotenv");
const authroute=require("./routes/authroute");
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8000;

app.use("/api/auth",authroute);


module.exports=app;