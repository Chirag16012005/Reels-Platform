const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


export const register= async(req,res)=>{
    try
    {
        const {username,email,password}=req.body;

        if (!username || !email || !password) 
      return res.status(400).json({ message: "All fields are required" });
    

    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(409).json({ message: "User already exists" });

    const hashedpassword=await bcrypt.hash(password,10);

    const newUser=new User({
        username:username,
        email:email,
        password:hashedpassword,
    });

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:newUser._id,
            username:newUser.username,
            email:newUser.email,
        }
    });
    }
    catch(error){
        res.status(500).json({message:"Server Error"});
    }
}

export const login=async(req,res)=>{
    try{
        const{email,password}=req.body;
        if(!email || !password)
        return res.status(400).json({message:"All fields are required"});
        
        const user=await User.findOne({email});
        if(!user)
        return res.status(401).json({message:"Invalid credentials"});

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)
        return res.status(401).json({message:"Invalid credentials"});

        const token=jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'3h'}
        );

        res.status(200).json({
            message:"Login successful",
            token:token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
            },
        });
    }
    catch(error){
        res.status(500).json({message:"Server Error"});
    }
};