import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/Groups.css";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState("");
  const [viewMembersGroup, setViewMembersGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [feedReels, setFeedReels] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch random feed reels from all groups
  const fetchFeedReels = async () => {
    try {
      const res = await api.get("/reels/feed");
      setFeedReels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Mock notifications - in real app, this would come from API
  const fetchNotifications = async () => {
    // This would be replaced with actual API call
    const mockNotifications = [
      {
        id: 1,
        type: "reel",
        message: "New reel posted in Design Team",
        time: "2 min ago",
        read: false
      },
      {
        id: 2,
        type: "message",
        message: "Alex commented on your reel",
        time: "15 min ago",
        read: false
      },
      {
        id: 3,
        type: "reel",
        message: "Sarah shared a reel in Marketing",
        time: "1 hour ago",
        read: true
      },
      {
        id: 4,
        type: "message",
        message: "New message in Project Alpha",
        time: "2 hours ago",
        read: true
      },
      {
        id: 5,
        type: "reel",
        message: "3 new reels in Friends group",
        time: "5 hours ago",
        read: true
      }
    ];
    setNotifications(mockNotifications);
  };

  useEffect(() => {
    fetchGroups();
    fetchFeedReels();
    fetchNotifications();
  }, []);

  // create group
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) return;

    try {
      await api.post("/groups", {
        name: groupName
      });

      setGroupName("");
      setShowCreateModal(false);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail || !selectedGroup)
      return;

    try {
      await api.post("/groups/add-member", {
        groupId: selectedGroup._id,
        email: memberEmail,
      });

      setMemberEmail("");
      alert("Member added");
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleSearchUseres = async (query) => {
    setQuery(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);

    try {
      const res = await api.get(`/users/search?name=${query}`);
      setResults(res.data);
    }
    catch (err) {
      console.error(err);
    }
    finally {
      setIsSearching(false);
    }
  }

  // view members
  const handleViewMembers = async (group) => {
    try {
      const res = await api.get(`/groups/${group._id}`);
      setMembers(res.data.members || []);
      setViewMembersGroup(group);
    } catch (err) {
      alert("Failed to load members");
    }
  };

  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-container">
      {/* Left Panel - Groups List */}
      <div className="left-panel">
        <div className="panel-header">
          <h2 className="panel-title">Groups</h2>
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span>+</span>
          </button>
        </div>

        <div className="groups-list">
          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p className="empty-text">No groups yet</p>
              <button
                className="create-group-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Create your first group
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group._id}
                className="group-item"
                onClick={() => navigate(`/group/${group._id}`)}
              >
                <div className="group-avatar">
                  {getInitials(group.name)}
                </div>
                <div className="group-info">
                  <span className="group-name">{group.name}</span>
                  <span className="group-members">
                    {group.members?.length || 0} members
                  </span>
                </div>
                <div className="group-actions">
                  <button
                    className="action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMembers(group);
                    }}
                    title="View Members"
                  >
                    👥
                  </button>
                  <button
                    className="action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroup(group);
                    }}
                    title="Add Member"
                  >
                    ➕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Middle Panel - Feed */}
      <div className="center-panel">
        <div className="panel-header">
          <h2 className="panel-title">Your Feed</h2>
          <span className="feed-subtitle">Reels from your groups</span>
        </div>

        <div className="feed-container">
          {feedReels.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-feed-icon">🎬</div>
              <h3 className="empty-feed-title">No reels yet</h3>
              <p className="empty-feed-text">
                Join groups and share reels to see them here
              </p>
            </div>
          ) : (
            feedReels.map((reel, index) => (
              <div key={reel._id || index} className="reel-card">
                <div className="reel-header">
                  <div className="reel-author-avatar">
                    {getInitials(reel.uploadedBy?.username || "User")}
                  </div>
                  <div className="reel-author-info">
                    <span className="reel-author-name">
                      {reel.uploadedBy?.username || "Unknown"}
                    </span>
                    <span className="reel-group-tag">
                      in {reel.groupName}
                    </span>
                  </div>
                </div>
                <video
                  className="reel-video"
                  src={reel.videoUrl}
                  controls
                  muted
                  loop
                />
                {reel.caption && (
                  <p className="reel-caption">{reel.caption}</p>
                )}
                <div className="reel-actions">
                  <button className="reel-action-btn">
                    ❤️ Like
                  </button>
                  <button className="reel-action-btn">
                    💬 Comment
                  </button>
                  <button
                    className="reel-action-btn"
                    onClick={() => navigate(`/group/${reel.groupId}`)}
                  >
                    👁️ View Group
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Notifications */}
      <div className="right-panel">
        <div className="panel-header">
          <h2 className="panel-title">Notifications</h2>
          <span className="notif-badge">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-notif">
              <div className="empty-notif-icon">🔔</div>
              <p className="empty-notif-text">No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => markNotificationRead(notif.id)}
              >
                <div className="notif-icon-wrapper">
                  {notif.type === "reel" ? "🎬" : "💬"}
                </div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>

        <div className="notif-footer">
          <button
            className="clear-all-btn"
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Group</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="modal-form">
              <input
                className="modal-input"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              {error && <p className="error-text">{error}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {selectedGroup && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add member to {selectedGroup.name}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setSelectedGroup(null);
                  setQuery("");
                  setResults([]);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-form">
              <input
                className="modal-input"
                placeholder="Search by username"
                value={query}
                onChange={(e) => handleSearchUseres(e.target.value)}
              />
              {results.length > 0 && (
                <ul className="search-results">
                  {results.map((user) => (
                    <li
                      key={user._id}
                      onClick={() => {
                        setMemberEmail(user.email);
                        setResults([]);
                        setQuery(user.username);
                      }}
                      className="search-result-item"
                    >
                      <div className="search-result-avatar">
                        {getInitials(user.username)}
                      </div>
                      <span>{user.username}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setSelectedGroup(null);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="submit-btn"
                  onClick={handleAddMember}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {viewMembersGroup && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Members of {viewMembersGroup.name}</h3>
              <button
                className="modal-close"
                onClick={() => setViewMembersGroup(null)}
              >
                ✕
              </button>
            </div>
            <div className="members-list">
              {members.length === 0 ? (
                <p className="no-members">No members found</p>
              ) : (
                members.map((member) => (
                  <div key={member._id} className="member-item">
                    <div className="member-avatar">
                      {getInitials(member.username)}
                    </div>
                    <div className="member-info">
                      <span className="member-name">{member.username}</span>
                      <span className="member-email">{member.email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={() => setViewMembersGroup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default Groups;
