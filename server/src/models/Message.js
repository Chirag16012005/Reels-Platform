const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        trim: true,
    },
    reelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel',
        default: null,
    },
    messageType: {
        type: String,
        enum: ['text', 'reel'],
        default: 'text',
    },
}, { timestamps: true });

// Index for faster queries
messageSchema.index({ groupId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
