const dotenv=require("dotenv");
dotenv.config();

const app=require("./app");
const connectDB=require("./config/db");


connectDB();
const PORT=process.env.PORT || 8008;


console.log("Starting server...");
app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`);
});