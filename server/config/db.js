const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();


const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected successfully");
    }
    catch(err){
        console.log("MongoDB connection failed",err);
    }
}

module.exports=connectDB;