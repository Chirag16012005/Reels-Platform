import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8008';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
    if (socket?.connected) {
        console.log('Socket already connected');
        return socket;
    }

    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        withCredentials: true, // Important: sends cookies with connection
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinGroup = (groupId) => {
    if (socket?.connected) {
        console.log('Joining group:', groupId);
        socket.emit('join-group', groupId);
    } else {
        console.warn('Socket not connected, cannot join group');
    }
};

export const leaveGroup = (groupId) => {
    if (socket?.connected) {
        socket.emit('leave-group', groupId);
    }
};

export const sendMessage = (groupId, text) => {
    if (socket?.connected) {
        console.log('Sending message to group:', groupId);
        socket.emit('send-message', { groupId, text });
    } else {
        console.warn('Socket not connected, cannot send message');
    }
};

export const shareReel = (groupId, reelId, text = '') => {
    if (socket?.connected) {
        socket.emit('share-reel', { groupId, reelId, text });
    }
};

export const emitTyping = (groupId) => {
    if (socket?.connected) {
        socket.emit('typing', groupId);
    }
};

export const emitStopTyping = (groupId) => {
    if (socket?.connected) {
        socket.emit('stop-typing', groupId);
    }
};
