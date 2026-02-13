const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel",
        required: true,
    },
    // Group where this comment was posted (for group-specific comments)
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Self-reference for recursive comments (replies)
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null  // null means top-level comment
    },
    // Array of reply IDs for easier querying
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    
    depth: {
        type: Number,
        default: 0,
        max: 3  
    },
    // Soft delete flag
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


CommentSchema.index({ reel: 1, group: 1, parentComment: 1 });
CommentSchema.index({ reel: 1, group: 1, createdAt: -1 });

// Virtual to check if comment has replies
CommentSchema.virtual('hasReplies').get(function () {
    return this.replies && this.replies.length > 0;
});

// Method to populate replies recursively
CommentSchema.methods.populateReplies = async function (maxDepth = 3) {
    if (this.depth >= maxDepth) return this;

    await this.populate({
        path: 'replies',
        populate: [
            { path: 'user', select: 'username' },
            { path: 'replies' }
        ]
    });

    return this;
};

module.exports = mongoose.model("Comment", CommentSchema);