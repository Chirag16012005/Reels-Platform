const Reel=require('../models/Reels');
const Group=require('../models/Group');

const uploadReel=async(req,res)=>{
     console.log(" uploadReel hit");
    try{
        console.log("Request Body:", req.body);
        console.log("Request File:", req.file ? "File received" : "No file");
        const {title,caption,groupId}=req.body;
        const userId=req.user._id;

        if(!req.file)
        {
            console.log("Video file is required");
            return res.status(400).json({message:"Video file is required"});
        }
        console.log("Group ID:", groupId);
        const group=await Group.findById(groupId);
        if(!group)
            return res.status(404).json({message:"Group not found"});

        if(!group.members.some(id=>id.toString()===userId.toString()))
            return res.status(403).json({message:"You are not a member of this group"});
        
        console.log("BEfore cloudinary")
        const reel=await Reel.create({
            videoUrl:req.file.path,
            publicId:req.file.filename,
            caption:caption,
            title:title,
            uploadedBy:userId,
            groupId:groupId,
        });
        await reel.save();
        console.log("After cloudinary")
        return res.status(201).json({
            message:"Reel uploaded successfully",
            reel:reel,
        });
    }
    catch(error){
        console.error("Error uploading reel:",error);
        return res.status(500).json({message:"Server error"});
    }
}

const getreel=async(req,res)=>{
    try{
        const {groupId}=req.params;

        const userId=req.user._id;
        const group=await Group.findById(groupId);

        if(!group)
            return res.status(404).json({message:"Group not found"});

        if(!group.members.some(id=>id.toString()===userId.toString()))
            return res.status(403).json({
                message:"You are not a member of this group"
            })
            
        const reels=await Reel.find({groupId})
        .populate("uploadedBy", "username email")
        .sort({createdAt:-1});

        res.status(200).json(reels); 
    }  
    catch(error)
    {
        res.status(500).json({
           "message": "Server Error",error})
    }
};
const togglelike = async (req, res) => {
    try {
        const { reelId } = req.body;
        const userId = req.user._id;
        const reel = await Reel.findById(reelId);

        if (!reel)
            return res.status(404).json({ message: "Reel not found" });

        const liked = reel.likes.some(id => id.toString() === userId.toString());

        if (liked) {
            reel.likes = reel.likes.filter(id => id.toString() !== userId.toString());
        } else {
            reel.likes.push(userId);
        }
        await reel.save();

        // Fetch the updated reel with populated data
        const updatedReel = await Reel.findById(reelId)
            .populate("uploadedBy", "username email");

        res.status(200).json({
            message: liked ? "Reel unliked" : "Reel liked",
            likesCount: reel.likes.length,
            reel: updatedReel,
        });

    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports={uploadReel, getreel, togglelike};