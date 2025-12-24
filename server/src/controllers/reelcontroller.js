const Reel=require('../models/Reels');
const Group=require('../models/Group');

const uploadReel=async(req,res)=>{
    try{
        const {title,caption,groupId}=req.body;
        const userId=req.user.id;

        if(!req.file)
            return res.status(400).json({message:"Video file is required"});

        const group=await Group.findById(groupId);
        if(!group)
            return res.status(404).json({message:"Group not found"});

        if(!group.members.includes(userId))
            return res.status(403).json({message:"You are not a member of this group"});

        const reel=await Reel.create({
            videoUrl:req.file.path,
            publicId:req.file.filename,
            caption:caption,
            title:title,
            uploadedBy:userId,
            group:groupId,
        });

        res.status(201).json({
            message:"Reel uploaded successfully",
            reel:reel,
        });
    }
    catch(error){
        console.error("Error uploading reel:",error);
        res.status(500).json({message:"Server error"});
    }
}

const getreel=async(req,res)=>{
    try{
        const {groupId}=req.params;

        const userId=req.user.id;
        const group=await Group.find({
            _id:groupId,
        })

        if(!group)
            return res.status(404).json({message:"Group not found"});

        if(!group.members.some(id=>id.toString()===userId))
            return res.status(403).json({
                message:"You are not a member of this group"
            })
            
        const reels=await Reel.find({
            group:groupId
        })
        .populate("uploadedBy", "name email")
        .sort({createdAt:-1});

        res.status(200).json(reels); 
    }  
    catch(error)
    {
        res.status(500).json({
           "message": "Server Error",error})
    }
};

const togglelike=async(req,res)=>{
    try{
        const {reelId}=req.params;
        const userId=req.user.id;
        const reel=await Reel.findById(reelId);

        if(!reel)
            return res.status(404).json({message:"Reel not found"});

        const liked=reel.like.some(id=>id.toString()===userId);

        if(liked){
            reel.like=reel.like.filter(id=>id.toString()!==userId);
        }
        else
        {
            reel.like.push(userId);
        }
        await reel.save();

        res.status(200).json({
            message:liked?"Reel unliked":"Reel liked",
            likesCount:reel.like.length,
        });

    }
    catch(error){
        console.error("Error toggling like:",error);
        res.status(500).json({message:"Server error"});
}
}

module.exports={uploadReel, getreel, togglelike};