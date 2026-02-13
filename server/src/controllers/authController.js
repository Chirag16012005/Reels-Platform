const OTP = require("../models/otp.js");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('./sendMail.js');
const otpgenerator = require('otp-generator');


exports.register = async (req, res) => {
    try
    {
        console.log("Reached register controller");
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
    await newUser.save();
     const emailSubject = "Welcome to ReelVault!";
    const emailText = `Hi ${username},\n\nThank you for signing up for ReelVault! We're excited to have you on board.\n\nYou can now start creating and managing your notes.\n\nBest regards,\nReelVault Team`;
    const emailHtml = `
      <h2>Welcome to ReelVault!</h2>
      <p>Hi <strong>${username}</strong>,</p>
      <p>Thank you for signing up for ReelVault! We're excited to have you on board.</p>
      <p>You can now start posting reels.</p>
      <br>
      <p>Best regards,<br>ReelVault Team: Chirag Katkoriya</p>
    `;
    sendMail(email, emailSubject, emailText, emailHtml)
      .then(result => {
        if (result.success) 
          {
          console.log("Welcome email sent to:", email);
          console.log("Preview URL:", result.previewUrl);
        } else {
          console.error("Failed to send welcome email:", result.error);
        }
      })
      .catch(err => console.error("Email error:", err));


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
};

exports.sendSignupOTP = async (req, res) => {
    try{
        const {email,name,password}=req.body;

        if(!email || !name || !password)
            return res.status(400).json({message:"All fields are required"});

            const existingUser= await User.findOne({email});
    if(existingUser)
      return res.status(400).json({message:"User with this email already exists"});

    await OTP.deleteMany({email});

    const otp= otpgenerator.generate(6,{
      digits:true,
      upperCaseAlphabets:false,
      lowerCaseAlphabets:false,
      specialChars:false});
    

    await OTP.create({email,otp});

      const emailResult=await sendOTPEmail(email,otp,name);

      if(emailResult.success){
        res.status(200).json({
          message:"OTP sent to email",
          email:email
        });
      }
      else{
        res.status(500).json({message:"Error sending OTP email", error: emailResult.error});
      }
    }
    catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !otp || !name || !password)
      return res.status(400).json({ message: "All fields are required" });

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord)
      return res.status(400).json({ message: "Invalid OTP" });

    await OTP.deleteMany({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


exports.login = async (req, res) => {
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
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            maxAge:3*60*60*1000,

        });


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

exports.logout = async (req, res) => {
    
        res.clearCookie("token",{
            httpOnly:true,
            sameSite:"lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({message:"Logout successful"});
    };