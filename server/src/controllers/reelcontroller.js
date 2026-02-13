const Reel = require('../models/Reels');
const Group = require('../models/Group');
const GroupReel = require('../models/GroupReel');

// Upload a reel (centrally stored)
const uploadReel = async (req, res) => {
    console.log("uploadReel hit");
    try {
        console.log("Request Body:", req.body);
        console.log("Request File:", req.file ? "File received" : "No file");
        const { title, caption, groupId, visibility } = req.body;
        const userId = req.user._id;

        if (!req.file) {
            console.log("Video file is required");
            return res.status(400).json({ message: "Video file is required" });
        }

        console.log("Before cloudinary");

        // Create the reel (stored centrally)
        const reel = await Reel.create({
            videoUrl: req.file.path,
            publicId: req.file.filename,
            caption: caption,
            title: title || "Untitled Reel",
            uploadedBy: userId,
            // groupId is optional now - only set if provided for backward compatibility
            groupId: groupId || null,
            visibility: visibility || "public",
        });
        await reel.save();
        console.log("After cloudinary, Reel created:", reel._id);

        // If groupId is provided, also link it to the group
        if (groupId) {
            console.log("Group ID provided:", groupId);
            const group = await Group.findById(groupId);
            if (!group) {
                // Reel is created but group not found - delete the reel
                await Reel.findByIdAndDelete(reel._id);
                return res.status(404).json({ message: "Group not found" });
            }

            if (!group.members.some(id => id.toString() === userId.toString())) {
                // User not a member - delete the reel
                await Reel.findByIdAndDelete(reel._id);
                return res.status(403).json({ message: "You are not a member of this group" });
            }

            // Create the group-reel link
            await GroupReel.create({
                reelId: reel._id,
                groupId: groupId,
                sharedBy: userId
            });
            console.log("Reel linked to group:", groupId);
        }

        return res.status(201).json({
            message: "Reel uploaded successfully",
            reel: reel,
        });
    }
    catch (error) {
        console.error("Error uploading reel:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

// Get reels for a group (using the junction table)
const getreel = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const group = await Group.findById(groupId);

        if (!group)
            return res.status(404).json({ message: "Group not found" });

        if (!group.members.some(id => id.toString() === userId.toString()))
            return res.status(403).json({
                message: "You are not a member of this group"
            });

        // Get all reel IDs linked to this group
        const groupReels = await GroupReel.find({ groupId })
            .sort({ sharedAt: -1 });

        const reelIds = groupReels.map(gr => gr.reelId);

        // Fetch the actual reels — exclude private reels (unless the viewer is the uploader)
        const reels = await Reel.find({
            _id: { $in: reelIds },
            $or: [
                { visibility: { $ne: "private" } },
                { uploadedBy: userId }
            ]
        }).populate("uploadedBy", "username email");

        // Sort reels based on the order they were shared
        const reelMap = new Map(reels.map(r => [r._id.toString(), r]));
        const sortedReels = reelIds
            .map(id => reelMap.get(id.toString()))
            .filter(Boolean);

        res.status(200).json(sortedReels);
    }
    catch (error) {
        res.status(500).json({
            "message": "Server Error", error
        });
    }
};

// Toggle like on a reel
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

// Share an existing reel to a group
const shareReelToGroup = async (req, res) => {
    try {
        const { reelId, groupId } = req.body;
        const userId = req.user._id;

        // Check if reel exists
        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Check if user is the owner of the reel
        if (reel.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only share your own reels" });
        }

        // Check if group exists and user is a member
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Check if reel is already shared to this group
        const existingShare = await GroupReel.findOne({ reelId, groupId });
        if (existingShare) {
            return res.status(400).json({ message: "Reel is already shared to this group" });
        }

        // Create the link
        await GroupReel.create({
            reelId,
            groupId,
            sharedBy: userId
        });

        res.status(200).json({ message: "Reel shared to group successfully" });
    } catch (error) {
        console.error("Error sharing reel to group:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Remove a reel from a group (unshare)
const unshareReelFromGroup = async (req, res) => {
    try {
        const { reelId, groupId } = req.body;
        const userId = req.user._id;

        // Check if reel exists
        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Check if user is the owner of the reel
        if (reel.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only unshare your own reels" });
        }

        // Remove the link
        const result = await GroupReel.findOneAndDelete({ reelId, groupId });
        if (!result) {
            return res.status(404).json({ message: "Reel is not shared to this group" });
        }

        res.status(200).json({ message: "Reel removed from group successfully" });
    } catch (error) {
        console.error("Error unsharing reel from group:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Get all reels uploaded by the current user (My Reels)
const getMyReels = async (req, res) => {
    try {
        const userId = req.user._id;

        const reels = await Reel.find({ uploadedBy: userId })
            .populate("uploadedBy", "username email")
            .sort({ createdAt: -1 });

        // For each reel, get the groups it's shared to
        const reelsWithGroups = await Promise.all(reels.map(async (reel) => {
            const groupReels = await GroupReel.find({ reelId: reel._id })
                .populate("groupId", "name");

            return {
                ...reel.toObject(),
                sharedToGroups: groupReels.map(gr => gr.groupId)
            };
        }));

        res.status(200).json(reelsWithGroups);
    } catch (error) {
        console.error("Error getting my reels:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Get groups where a reel is shared
const getReelGroups = async (req, res) => {
    try {
        const { reelId } = req.params;

        const groupReels = await GroupReel.find({ reelId })
            .populate("groupId", "name members createdBy");

        const groups = groupReels.map(gr => gr.groupId);

        res.status(200).json(groups);
    } catch (error) {
        console.error("Error getting reel groups:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Update visibility of a reel (only owner can update)
const updateVisibility = async (req, res) => {
    try {
        const { reelId } = req.params;
        const { visibility } = req.body;
        const userId = req.user._id;

        // Validate visibility value
        if (!['public', 'private'].includes(visibility)) {
            return res.status(400).json({ message: "Visibility must be 'public' or 'private'" });
        }

        // Find the reel
        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Only the owner can change visibility
        if (reel.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only update visibility of your own reels" });
        }

        reel.visibility = visibility;
        await reel.save();

        const updatedReel = await Reel.findById(reelId)
            .populate("uploadedBy", "username email");

        res.status(200).json({
            message: `Reel visibility updated to '${visibility}'`,
            reel: updatedReel
        });
    } catch (error) {
        console.error("Error updating visibility:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const getPublicReels = async (req, res) => {
    try {
        const reels = await Reel.find({ visibility: "public" })
            .populate("uploadedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(reels);
    } catch (error) {
        console.error("Error getting public reels:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Get feed reels - random reels from all groups the user is a member of
const getFeedReels = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all groups the user is a member of
        const userGroups = await Group.find({ members: userId });
        const groupIds = userGroups.map(g => g._id);

        // Get all reel IDs shared to these groups
        const groupReels = await GroupReel.find({ groupId: { $in: groupIds } })
            .populate("groupId", "name");

        // Build reel-to-group mapping (a reel may be in multiple groups, pick one for display)
        const reelGroupMap = {};
        groupReels.forEach(gr => {
            if (!reelGroupMap[gr.reelId.toString()]) {
                reelGroupMap[gr.reelId.toString()] = {
                    groupName: gr.groupId?.name || "Unknown",
                    groupId: gr.groupId?._id
                };
            }
        });

        const reelIds = Object.keys(reelGroupMap);

        // Fetch actual reels — exclude private ones (unless user is the uploader)
        const reels = await Reel.find({
            _id: { $in: reelIds },
            $or: [
                { visibility: { $ne: "private" } },
                { uploadedBy: userId }
            ]
        }).populate("uploadedBy", "username email");

        // Attach group info and shuffle
        const reelsWithGroups = reels.map(reel => ({
            ...reel.toObject(),
            groupName: reelGroupMap[reel._id.toString()]?.groupName,
            groupId: reelGroupMap[reel._id.toString()]?.groupId
        }));

        // Shuffle randomly (Fisher-Yates)
        for (let i = reelsWithGroups.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [reelsWithGroups[i], reelsWithGroups[j]] = [reelsWithGroups[j], reelsWithGroups[i]];
        }

        res.status(200).json(reelsWithGroups.slice(0, 20));
    } 
    catch (error) 
    {
        console.error("Error getting feed reels:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    uploadReel,
    getreel,
    togglelike,
    shareReelToGroup,
    unshareReelFromGroup,
    getMyReels,
    getReelGroups,
    getPublicReels,
    updateVisibility,
    getFeedReels
};