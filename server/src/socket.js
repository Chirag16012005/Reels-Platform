const Message = require('./models/Message');
const Group = require('./models/Group');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const setupSocket = (io) => {
    // Auth middleware for socket connections
    io.use((socket, next) => {
        let token = socket.handshake.auth.token;

        // If no token in auth, try to get from cookies
        if (!token && socket.handshake.headers.cookie) {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            token = cookies.token;
        }

        if (!token) {
            console.log('Socket auth failed: No token found');
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            console.log('Socket authenticated for user:', socket.userId);
            next();
        } catch (err) {
            console.error('Socket auth error:', err.message);
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join a group chat room
        socket.on('join-group', async (groupId) => {
            try {
                console.log(`User ${socket.userId} attempting to join group ${groupId}`);

                // Verify user is member of group
                const group = await Group.findById(groupId);
                if (!group) {
                    console.log('Group not found:', groupId);
                    socket.emit('error', { message: 'Group not found' });
                    return;
                }

                const isMember = group.members.some(
                    (memberId) => memberId.toString() === socket.userId.toString()
                );

                if (!isMember) {
                    console.log('User not a member of group');
                    socket.emit('error', { message: 'Not a member of this group' });
                    return;
                }

                socket.join(groupId);
                console.log(`User ${socket.userId} joined group ${groupId} successfully`);

                // Notify others in the room
                socket.to(groupId).emit('user-joined', {
                    userId: socket.userId,
                    groupId,
                });
            } catch (err) {
                console.error('Join group error:', err);
                socket.emit('error', { message: 'Failed to join group' });
            }
        });

        // Leave a group chat room
        socket.on('leave-group', (groupId) => {
            socket.leave(groupId);
            console.log(`User ${socket.userId} left group ${groupId}`);

            socket.to(groupId).emit('user-left', {
                userId: socket.userId,
                groupId,
            });
        });

        // Send a text message
        socket.on('send-message', async (data) => {
            const { groupId, text } = data;
            console.log(`Message from ${socket.userId} to group ${groupId}: "${text}"`);

            if (!text || !text.trim()) {
                socket.emit('error', { message: 'Message cannot be empty' });
                return;
            }

            try {
            
                const message = await Message.create({
                    groupId,
                    sender: socket.userId,
                    text: text.trim(),
                    messageType: 'text',
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'username email');

                console.log('Message saved:', populatedMessage._id);
                io.to(groupId).emit('new-message', populatedMessage);
            } catch (err) {
                console.error('Send message error:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Share a reel in chat
        socket.on('share-reel', async (data) => {
            const { groupId, reelId, text } = data;

            try {
                const message = await Message.create({
                    groupId,
                    sender: socket.userId,
                    text: text || '',
                    reelId,
                    messageType: 'reel',
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'username email')
                    .populate({
                        path: 'reelId',
                        select: 'title videoUrl caption uploadedBy',
                        populate: { path: 'uploadedBy', select: 'username' }
                    });

                io.to(groupId).emit('new-message', populatedMessage);
            } catch (err) {
                console.error('Share reel error:', err);
                socket.emit('error', { message: 'Failed to share reel' });
            }
        });

        // Typing indicator
        socket.on('typing', (groupId) => {
            socket.to(groupId).emit('user-typing', {
                userId: socket.userId,
                groupId,
            });
        });

        socket.on('stop-typing', (groupId) => {
            socket.to(groupId).emit('user-stop-typing', {
                userId: socket.userId,
                groupId,
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};

module.exports = setupSocket;
