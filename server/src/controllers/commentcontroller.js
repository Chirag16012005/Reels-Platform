const Comment = require("../models/Comments");
const Reel = require("../models/Reels");

exports.addComment = async (req, res) => {
  try {
    const {text,reelId}=req.body;
    const userId = req.user.id;

    if (!text) 
      return res.status(400).json({ message: "Comment text required" });
    

    const reel=await Reel.findById(reelId);
    if (!reel) 
      return res.status(404).json({ message: "Reel not found" });
    

    const comment=await Comment.create({
      text:text,
      reel: reelId,
      user: userId,
    });

    res.status(201).json(comment);
  } 
  catch (err) 
  {
    res.status(500).json({ message: "Server error", err });
  }
};

exports.getComments=async(req,res)=>{
  try {
    const {reelId}=req.params;

    const comments = await Comment.find({ reel: reelId })
      .populate("user", "username email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
