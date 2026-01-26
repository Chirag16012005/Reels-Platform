const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Group = require('../models/Group');
const authMiddleware = require('../middlewares/auth');

/**
 * @route   GET /api/messages/:groupId
 * @desc    Get message history for a group
 * @access  Private
 */
router.get('/:groupId', authMiddleware, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 50;
        const before = req.query.before; // For pagination

        // Verify user is member of group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = group.members.some(
            (memberId) => memberId.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        // Build query
        const query = { groupId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Fetch messages
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('sender', 'username email')
            .populate({
                path: 'reelId',
                select: 'title videoUrl caption uploadedBy',
                populate: { path: 'uploadedBy', select: 'username' }
            });

        // Return in chronological order
        res.status(200).json(messages.reverse());
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
