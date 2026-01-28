const Comment = require("../models/Comments");
const Reel = require("../models/Reels");
const Group = require("../models/Group");

exports.addComment = async (req, res) => {
  try {
    const { text, reelId, groupId, parentCommentId } = req.body;
    const userId = req.user._id;

    if (!text)
      return res.status(400).json({ message: "Comment text required" });

    if (!groupId)
      return res.status(400).json({ message: "Group ID required" });

    const reel = await Reel.findById(reelId);
    if (!reel)
      return res.status(404).json({ message: "Reel not found" });

    const group = await Group.findById(groupId);
    if (!group)
      return res.status(404).json({ message: "Group not found" });
    if (!group.members.some(id => id.toString() === userId.toString()))
      return res.status(403).json({ message: "You are not a member of this group" });

    let depth = 0;
    let parentComment = null;


    if (parentCommentId) 
    {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      if (parentComment.depth >= 3) {
        return res.status(400).json({ message: "Maximum reply depth reached" });
      }
      depth = parentComment.depth + 1;
    }

    const comment = await Comment.create({
      text,
      reel: reelId,
      group: groupId,
      user: userId,
      parentComment: parentCommentId || null,
      depth
    });

    if (parentComment) {
      parentComment.replies.push(comment._id);
      await parentComment.save();
    }
    await comment.populate("user", "username");

    res.status(201).json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

// Get all comments for a reel in a specific group with nested replies
exports.getComments = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { groupId } = req.query;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID required" });
    }

    const comments = await Comment.find({
      reel: reelId,
      group: groupId,
      parentComment: null,
      isDeleted: false
    })
      .populate("user", "username")
      .populate({
        path: "replies",
        match: { isDeleted: false, group: groupId },
        populate: [
          { path: "user", select: "username" },
          {
            path: "replies",
            match: { isDeleted: false, group: groupId },
            populate: [
              { path: "user", select: "username" },
              {
                path: "replies",
                match: { isDeleted: false, group: groupId },
                populate: { path: "user", select: "username" }
              }
            ]
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

// Delete a comment (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only comment owner can delete
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Soft delete - keep structure intact
    comment.isDeleted = true;
    comment.text = "[Deleted]";
    await comment.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

// Get comment count for a reel in a specific group
exports.getCommentCount = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { groupId } = req.query;

    const query = {
      reel: reelId,
      isDeleted: false
    };

    // If groupId is provided, filter by group
    if (groupId) {
      query.group = groupId;
    }

    const count = await Comment.countDocuments(query);

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};
