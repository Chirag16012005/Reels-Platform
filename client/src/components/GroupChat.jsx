import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/authcontext';
import {
    getSocket,
    connectSocket,
    joinGroup,
    leaveGroup,
    sendMessage,
    shareReel,
} from '../socket';
import './GroupChat.css';

const GroupChat = ({ groupId, reels = [] }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load message history and connect socket
    useEffect(() => {
        if (!groupId || !user) return;

        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            // Try to get from localStorage or skip
            console.log('No token found for socket connection');
        }

        // Connect socket
        connectSocket(token);
        const socket = getSocket();

        // Join the group room
        joinGroup(groupId);

        // Fetch message history
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${groupId}`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to load messages:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Listen for new messages
        socket?.on('new-message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Cleanup on unmount
        return () => {
            leaveGroup(groupId);
            socket?.off('new-message');
        };
    }, [groupId, user]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        sendMessage(groupId, newMessage.trim());
        setNewMessage('');
    };

    const handleShareReel = (reelId) => {
        shareReel(groupId, reelId, 'Check out this reel!');
        setShowShareMenu(false);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) {
        return (
            <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                💬 Chat
            </button>
        );
    }

    return (
        <div className="group-chat">
            <div className="chat-header">
                <span>💬 Group Chat</span>
                <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                    ✕
                </button>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <div className="chat-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`chat-message ${msg.sender?._id === user?._id ? 'own' : ''
                                }`}
                        >
                            <div className="message-sender">
                                {msg.sender?.username || 'Unknown'}
                            </div>

                            {msg.messageType === 'reel' && msg.reelId ? (
                                <div className="message-reel">
                                    <div className="reel-preview">
                                        <video src={msg.reelId.videoUrl} controls />
                                        <span>{msg.reelId.caption || 'Shared a reel'}</span>
                                    </div>
                                    {msg.text && <p>{msg.text}</p>}
                                </div>
                            ) : (
                                <div className="message-text">{msg.text}</div>
                            )}

                            <div className="message-time">{formatTime(msg.createdAt)}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {showShareMenu && (
                <div className="share-menu">
                    <div className="share-menu-header">
                        <span>Share a Reel</span>
                        <button onClick={() => setShowShareMenu(false)}>✕</button>
                    </div>
                    <div className="share-menu-list">
                        {reels.length === 0 ? (
                            <p>No reels to share</p>
                        ) : (
                            reels.map((reel) => (
                                <div
                                    key={reel._id}
                                    className="share-reel-item"
                                    onClick={() => handleShareReel(reel._id)}
                                >
                                    <span>🎬 {reel.caption || reel.title || 'Untitled'}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <form className="chat-input-form" onSubmit={handleSend}>
                <button
                    type="button"
                    className="share-btn"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    title="Share a reel"
                >
                    🎬
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button type="submit" className="send-btn">
                    ➤
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
