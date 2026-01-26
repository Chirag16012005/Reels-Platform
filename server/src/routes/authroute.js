const express=require('express');

const {register,login,logout,sendSignupOTP, verifySignupOTP}=require('../controllers/authController');
const authMiddleware=require('../middlewares/auth');


const router=express.Router();

router.post('/register',register);
router.post('/login',login);
router.post("/logout",authMiddleware,logout);
router.post("/send-signup-otp", sendSignupOTP);
router.post("/verify-signup-otp",verifySignupOTP);
router.get("/me",authMiddleware,(req,res)=>{
    res.status(200).json({user:req.user});
});

module.exports=router;
