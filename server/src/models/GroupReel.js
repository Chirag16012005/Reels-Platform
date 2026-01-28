const mongoose = require('mongoose');

// This model links reels to groups (many-to-many relationship)
// A reel can be shared to multiple groups
const groupReelSchema = new mongoose.Schema({
    reelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index to prevent duplicate shares of the same reel in the same group
groupReelSchema.index({ reelId: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model('GroupReel', groupReelSchema);
