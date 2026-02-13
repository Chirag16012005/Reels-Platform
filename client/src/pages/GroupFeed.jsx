import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authcontext";
import "../styles/GroupFeed.css";

const GroupFeed = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { user } = useAuth();

  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [reelsError, setReelsError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);

  // Comments state
  const [selectedReel, setSelectedReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const commentsEndRef = useRef(null);

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

  // Fetch comments when a reel is selected
  useEffect(() => {
    if (!selectedReel) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await api.get(`/comments/reel/${selectedReel._id}?groupId=${groupId}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [selectedReel, groupId]);

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

  // Open comments for a reel
  const handleOpenComments = (reel) => {
    setSelectedReel(reel);
    setReplyingTo(null);
    setNewComment("");
  };

  // Close comments panel
  const handleCloseComments = () => {
    setSelectedReel(null);
    setReplyingTo(null);
    setNewComment("");
  };

  // Add comment or reply
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedReel) return;

    try {
      const payload = {
        text: newComment.trim(),
        reelId: selectedReel._id,
        groupId: groupId,
      };

      // If replying to a comment
      if (replyingTo) {
        payload.parentCommentId = replyingTo._id;
      }

      const res = await api.post("/comments/add", payload);

      // Refresh comments to show the new one with proper nesting
      const commentsRes = await api.get(`/comments/reel/${selectedReel._id}?groupId=${groupId}`);
      setComments(commentsRes.data);

      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      // Refresh comments
      const commentsRes = await api.get(`/comments/reel/${selectedReel._id}?groupId=${groupId}`);
      setComments(commentsRes.data);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };
  const handleViewProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Recursive comment component
  const CommentItem = ({ comment, depth = 0 }) => {
    const isOwn = comment.user?._id === user?._id;
    const maxIndent = Math.min(depth, 3);

    return (
      <div className={`comment-item depth-${maxIndent}`}>
        <div className="comment-header">
          <div className="comment-avatar">
            {comment.user?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="comment-meta">
            <span className="comment-author">@{comment.user?.username || "Unknown"}</span>
            <span className="comment-time">{formatTime(comment.createdAt)}</span>
          </div>
        </div>
        <p className="comment-text">{comment.text}</p>
        <div className="comment-actions-row">
          <button
            className="comment-action-btn"
            onClick={() => {
              setReplyingTo(comment);
              setNewComment(`@${comment.user?.username} `);
            }}
          >
            Reply
          </button>
          {isOwn && (
            <button
              className="comment-action-btn delete"
              onClick={() => handleDeleteComment(comment._id)}
            >
              Delete
            </button>
          )}
        </div>

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
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
            Upload Reel
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
                <div key={reel._id} className="feed-reel-card">
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
                        className={`action-btn comment-btn ${selectedReel?._id === reel._id ? "active" : ""}`}
                        onClick={() => handleOpenComments(reel)}
                      >
                        💬 Comments
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel - Comments or Members */}
      <div className={`chat-panel ${!isChatOpen ? "hidden" : ""}`}>
        {selectedReel ? (
          <>
            {/* Comments Header */}
            <div className="chat-panel-header">
              <div className="comments-header-content">
                <button className="back-btn" onClick={handleCloseComments}>
                  ←
                </button>
                <div>
                  <h3>Comments</h3>
                  <p>{comments.length} comment{comments.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            <div className="chat-messages-container">
              {loadingComments ? (
                <div className="chat-empty-state">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="chat-empty-state">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            <form className="chat-input-container" onSubmit={handleAddComment}>
              {replyingTo && (
                <div className="replying-to">
                  <span>Replying to @{replyingTo.user?.username}</span>
                  <button type="button" onClick={() => {
                    setReplyingTo(null);
                    setNewComment("");
                  }}>✕</button>
                </div>
              )}
              <div className="input-row">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                  className="chat-input"
                />
                <button type="submit" className="chat-send-btn">
                  ➤
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="chat-panel-header">
              <h3> {groupInfo?.name || "Group"}</h3>
              <p>{groupInfo?.members?.length || 0} members</p>
            </div>

            {/* Members List */}
            <div className="chat-messages-container">
              <div className="members-section">
                <h4 className="members-title">Members</h4>
                {groupInfo?.members?.length > 0 ? (
                  <div className="members-list">
                    {groupInfo.members.map((member) => (
                      <div 
                        key={member._id} 
                        className="member-item clickable"
                        onClick={() => handleViewProfile(member._id)}
                      >
                        <div className="member-avatar">
                          {member.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="member-info">
                          <span className="member-name">@{member.username}</span>
                          {member._id === groupInfo.createdBy?._id && (
                            <span className="member-role">Admin</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="chat-empty-state">No members found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Toggle */}
      <button
        className={`mobile-chat-toggle ${isChatOpen ? "chat-open" : ""}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        {selectedReel ? "💬 Comments" : "👥 Members"}
      </button>
    </div>
  );
};

export default GroupFeed;