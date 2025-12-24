const express=require("express");

const {addComment,getComments}=require("../controllers/commentcontroller");
const authMiddleware=require("../middlewares/auth");

const router=express.Router();

router.post("/addcomment",authMiddleware,addComment);
router.get("/comments/:reelId",authMiddleware,getComments);

module.exports=router;