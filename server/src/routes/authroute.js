const express=require('express');

const {register,login}=require('../controllers/authController');
const authMiddleware=require('../middlewares/auth');

const router=express.Router();

router.post('/register',register);
router.post('/login',login);
router.get("/me",authMiddleware,(req,res)=>{
    res.status(200).json({user:req.user});
});

module.exports=router;
