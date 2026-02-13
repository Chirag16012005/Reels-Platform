import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/MyReels.css";

const MyReels = () => {
    const navigate = useNavigate();
    const [reels, setReels] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReel, setSelectedReel] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [togglingVisibility, setTogglingVisibility] = useState(null); // reelId being toggled

    // Fetch user's reels
    useEffect(() => {
        const fetchMyReels = async () => {
            try {
                setLoading(true);
                const res = await api.get("/reels/my-reels");
                setReels(res.data);
            } catch (err) {
                console.error("Failed to load reels:", err);
                setError("Failed to load your reels");
            } finally {
                setLoading(false);
            }
        };
        fetchMyReels();
    }, []);

    // Fetch groups
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get("/groups");
                setGroups(res.data);
            } catch (err) {
                console.error("Failed to load groups:", err);
            }
        };
        fetchGroups();
    }, []);

    // Open share modal
    const handleOpenShareModal = (reel) => {
        setSelectedReel(reel);
        setShareModalOpen(true);
    };

    // Close share modal
    const handleCloseShareModal = () => {
        setSelectedReel(null);
        setShareModalOpen(false);
    };

    // Check if reel is shared to a group
    const isSharedToGroup = (reel, groupId) => {
        if (!reel.sharedToGroups) return false;
        return reel.sharedToGroups.some(g => g && g._id === groupId);
    };

    // Share or unshare reel to/from group
    const handleToggleShare = async (groupId) => {
        if (!selectedReel || sharing) return;

        try {
            setSharing(true);
            const isShared = isSharedToGroup(selectedReel, groupId);

            if (isShared) {
                // Unshare
                await api.post("/reels/unshare", {
                    reelId: selectedReel._id,
                    groupId: groupId
                });
            } else {
                // Share
                await api.post("/reels/share", {
                    reelId: selectedReel._id,
                    groupId: groupId
                });
            }

            // Refresh reels
            const res = await api.get("/reels/my-reels");
            setReels(res.data);

            // Update selected reel
            const updatedReel = res.data.find(r => r._id === selectedReel._id);
            if (updatedReel) {
                setSelectedReel(updatedReel);
            }
        } catch (err) {
            console.error("Failed to toggle share:", err);
            alert(err.response?.data?.message || "Failed to update sharing");
        } finally {
            setSharing(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // Toggle visibility of a reel
    const handleToggleVisibility = async (reel) => {
        if (togglingVisibility) return;

        const newVisibility = reel.visibility === 'public' ? 'private' : 'public';

        try {
            setTogglingVisibility(reel._id);
            await api.patch(`/reels/${reel._id}/visibility`, {
                visibility: newVisibility
            });

            // Refresh reels
            const res = await api.get("/reels/my-reels");
            setReels(res.data);
        } catch (err) {
            console.error("Failed to update visibility:", err);
            alert(err.response?.data?.message || "Failed to update visibility");
        } finally {
            setTogglingVisibility(null);
        }
    };

    if (loading) {
        return (
            <div className="my-reels-container">
                <div className="my-reels-loading">Loading your reels...</div>
            </div>
        );
    }

    return (
        <div className="my-reels-container">
            <div className="my-reels-header">
                <div className="header-content">
                    <h1>📁 My Reels</h1>
                    <p>Your personal reel library - share any reel to multiple groups!</p>
                </div>
                <button className="upload-new-btn" onClick={() => navigate("/upload")}>
                    + Upload New Reel
                </button>
            </div>

            {error && <div className="my-reels-error">{error}</div>}

            {reels.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎬</div>
                    <h3>No reels yet</h3>
                    <p>Upload your first reel to get started!</p>
                    <button className="upload-new-btn" onClick={() => navigate("/upload")}>
                        Upload Your First Reel
                    </button>
                </div>
            ) : (
                <div className="reels-grid">
                    {reels.map((reel) => (
                        <div key={reel._id} className="reel-card">
                            <div className="reel-thumbnail">
                                <video src={reel.videoUrl} preload="metadata" />
                                <div className="reel-overlay">
                                    <button
                                        className="play-btn"
                                        onClick={() => {
                                            // Play video in a simple modal or just play inline
                                            const video = document.querySelector(`#video-${reel._id}`);
                                            if (video) {
                                                video.paused ? video.play() : video.pause();
                                            }
                                        }}
                                    >
                                        ▶
                                    </button>
                                </div>
                            </div>

                            <div className="reel-details">
                                <div className="reel-meta-row">
                                    <p className="reel-caption">
                                        {reel.caption || "No caption"}
                                    </p>
                                    <span className={`visibility-badge ${reel.visibility || 'public'}`}>
                                        {reel.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                                    </span>
                                </div>
                                <span className="reel-date">{formatDate(reel.createdAt)}</span>

                                <div className="shared-groups">
                                    {reel.sharedToGroups && reel.sharedToGroups.length > 0 ? (
                                        <>
                                            <span className="shared-label">Shared to:</span>
                                            <div className="group-tags">
                                                {reel.sharedToGroups.map((group) => (
                                                    group && (
                                                        <span key={group._id} className="group-tag">
                                                            {group.name}
                                                        </span>
                                                    )
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="not-shared">Not shared to any group</span>
                                    )}
                                </div>

                                <div className="reel-actions">
                                    <button
                                        className={`visibility-toggle-btn ${reel.visibility === 'private' ? 'is-private' : 'is-public'}`}
                                        onClick={() => handleToggleVisibility(reel)}
                                        disabled={togglingVisibility === reel._id}
                                    >
                                        {togglingVisibility === reel._id
                                            ? '⏳ Updating...'
                                            : reel.visibility === 'private'
                                                ? '🌐 Make Public'
                                                : '🔒 Make Private'
                                        }
                                    </button>
                                    <button
                                        className="share-btn"
                                        onClick={() => handleOpenShareModal(reel)}
                                    >
                                        📤 Share to Groups
                                    </button>
                                </div>
                            </div>

                            {/* Hidden video for playback */}
                            <video
                                id={`video-${reel._id}`}
                                src={reel.videoUrl}
                                className="hidden-video"
                                controls
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && selectedReel && (
                <div className="modal-overlay" onClick={handleCloseShareModal}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Share Reel</h2>
                            <button className="close-btn" onClick={handleCloseShareModal}>✕</button>
                        </div>

                        <div className="modal-content">
                            <div className="reel-preview">
                                <video src={selectedReel.videoUrl} controls />
                                <p>{selectedReel.caption || "No caption"}</p>
                            </div>

                            <div className="groups-list">
                                <h3>Select groups to share:</h3>
                                {groups.length === 0 ? (
                                    <p className="no-groups">You're not a member of any groups yet.</p>
                                ) : (
                                    groups.map((group) => {
                                        const isShared = isSharedToGroup(selectedReel, group._id);
                                        return (
                                            <label
                                                key={group._id}
                                                className={`group-item ${isShared ? 'shared' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isShared}
                                                    onChange={() => handleToggleShare(group._id)}
                                                    disabled={sharing}
                                                />
                                                <span className="group-name">{group.name}</span>
                                                {isShared && <span className="shared-badge">✓ Shared</span>}
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="done-btn" onClick={handleCloseShareModal}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReels;
