import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authcontext";
import {
  getSocket,
  connectSocket,
  joinGroup,
  leaveGroup,
  sendMessage,
  shareReel,
} from "../socket";
import "./GroupFeed.css";

const GroupFeed = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { user } = useAuth();

  // Reels state
  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [reelsError, setReelsError] = useState("");

  // Chat state
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Group info
  const [groupInfo, setGroupInfo] = useState(null);

  const messagesEndRef = useRef(null);

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch reels
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await api.get(`/reels/group/${groupId}`);
        setReels(res.data);
      } catch (err) {
        setReelsError("Failed to load reels");
      } finally {
        setLoadingReels(false);
      }
    };

    fetchReels();
  }, [groupId]);

  // Fetch group info
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await api.get(`/groups/${groupId}`);
        setGroupInfo(res.data);
      } catch (err) {
        console.error("Failed to load group info:", err);
      }
    };

    fetchGroupInfo();
  }, [groupId]);

  // Socket connection and chat
  useEffect(() => {
    if (!groupId || !user) return;

    // Connect socket (cookies are sent automatically with withCredentials)
    connectSocket();
    const socket = getSocket();

    // Wait for socket to connect, then join group
    if (socket) {
      if (socket.connected) {
        joinGroup(groupId);
      } else {
        socket.on('connect', () => {
          joinGroup(groupId);
        });
      }
    }

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${groupId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Listen for new messages
    socket?.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup
    return () => {
      leaveGroup(groupId);
      socket?.off("new-message");
      socket?.off("connect");
    };
  }, [groupId, user]);

  // Handle like
  const handleLike = async (reelId) => {
    try {
      const res = await api.post("/reels/like", { reelId });
      setReels((prev) =>
        prev.map((reel) =>
          reel._id === reelId
            ? { ...reel, likes: res.data.reel?.likes || [] }
            : reel
        )
      );
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // Check if liked
  const isLiked = (reel) => {
    if (!user || !reel.likes || reel.likes.length === 0) return false;
    return reel.likes.some((id) => {
      if (!id) return false;
      if (typeof id === "string") return id === user._id;
      if (typeof id === "object" && id._id)
        return id._id.toString() === user._id.toString();
      return id.toString() === user._id.toString();
    });
  };

  // Send chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessage(groupId, newMessage.trim());
    setNewMessage("");
  };

  // Share reel to chat
  const handleShareToChat = (reelId) => {
    shareReel(groupId, reelId, "Check out this reel!");
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="group-feed-container">
      {/* Left Panel - Reels Feed */}
      <div className="reels-panel">
        <div className="reels-header">
          <h2>{groupInfo?.name || "Group Feed"}</h2>
          <button
            className="upload-btn"
            onClick={() => navigate(`/upload?groupId=${groupId}`)}
          >
            + Upload Reel
          </button>
        </div>

        {loadingReels ? (
          <div className="loading-state">Loading reels...</div>
        ) : reelsError ? (
          <div className="empty-state">
            <p style={{ color: "#ef4444" }}>{reelsError}</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h3>No reels yet</h3>
            <p>Be the first to share a reel in this group!</p>
            <button
              className="upload-btn"
              onClick={() => navigate(`/upload?groupId=${groupId}`)}
            >
              Upload First Reel
            </button>
          </div>
        ) : (
          <div className="reels-list">
            {reels.map((reel) => {
              const liked = isLiked(reel);
              const likeCount = reel.likes?.length || 0;

              return (
                <div key={reel._id} className="reel-card">
                  <video
                    src={reel.videoUrl}
                    controls
                    className="reel-video"
                  />
                  <div className="reel-info">
                    <div className="reel-author">
                      <div className="author-avatar">
                        {reel.uploadedBy?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="author-name">
                        @{reel.uploadedBy?.username || "Unknown"}
                      </span>
                    </div>
                    {reel.caption && (
                      <p className="reel-caption">{reel.caption}</p>
                    )}
                    <div className="reel-actions">
                      <button
                        className={`action-btn ${liked ? "liked" : ""}`}
                        onClick={() => handleLike(reel._id)}
                      >
                        ❤️ {likeCount}
                      </button>
                      <button
                        className="action-btn share-to-chat"
                        onClick={() => handleShareToChat(reel._id)}
                      >
                        💬 Share to Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel - Chat */}
      <div className={`chat-panel ${!isChatOpen ? "hidden" : ""}`}>
        <div className="chat-panel-header">
          <h3>💬 Group Chat</h3>
          <p>{groupInfo?.members?.length || 0} members</p>
        </div>

        <div className="chat-messages-container">
          {loadingMessages ? (
            <div className="chat-empty-state">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat-message ${msg.sender?._id === user?._id ? "own" : ""
                  }`}
              >
                <div className="chat-message-sender">
                  {msg.sender?.username || "Unknown"}
                </div>

                {msg.messageType === "reel" && msg.reelId ? (
                  <div className="chat-shared-reel">
                    <video src={msg.reelId.videoUrl} controls />
                    <div className="chat-shared-reel-caption">
                      {msg.reelId.caption || "Shared a reel"}
                    </div>
                    {msg.text && (
                      <div className="chat-message-text">{msg.text}</div>
                    )}
                  </div>
                ) : (
                  <div className="chat-message-text">{msg.text}</div>
                )}

                <div className="chat-message-time">
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn">
            ➤
          </button>
        </form>
      </div>

      {/* Mobile Chat Toggle */}
      <button
        className={`mobile-chat-toggle ${isChatOpen ? "chat-open" : ""}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        💬 Chat
      </button>
    </div>
  );
};

export default GroupFeed;