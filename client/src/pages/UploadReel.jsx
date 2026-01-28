import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/UploadReel.css";

const UploadReel = () => {
  const [searchParams] = useSearchParams();
  const [video, setVideo] = useState(null);
  const [caption, setCaption] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Fetch groups user belongs to
  useEffect(() => {
    api.get("/groups")
      .then(res => setGroups(res.data))
      .catch(() => setError("Failed to load groups"));
  }, []);

  // Pre-select group if groupId is in URL
  useEffect(() => {
    const presentGroupId = searchParams.get("groupId");
    if (presentGroupId) {
      setSelectedGroups([presentGroupId]);
    }
  }, [searchParams]);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("video/")) {
      setVideo(file);
      setError("");
    } else if (file) {
      setError("Please select a valid video file");
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Remove selected file
  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setVideo(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle group selection toggle
  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video) {
      setError("Video is required");
      return;
    }

    if (selectedGroups.length === 0) {
      setError("Please select at least one group to share the reel");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("video", video);
      formData.append("caption", caption);
      formData.append("title", "group reel");
      // Send the first group for initial upload
      formData.append("groupId", selectedGroups[0]);

      // Upload the reel
      const response = await api.post("/reels/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Upload successful:", response.data);
      const uploadedReel = response.data.reel;

      // Share to additional groups if more than one selected
      if (selectedGroups.length > 1) {
        for (let i = 1; i < selectedGroups.length; i++) {
          try {
            await api.post("/reels/share", {
              reelId: uploadedReel._id,
              groupId: selectedGroups[i]
            });
            console.log(`Shared to group ${selectedGroups[i]}`);
          } catch (shareErr) {
            console.error(`Failed to share to group ${selectedGroups[i]}:`, shareErr);
          }
        }
      }

      // Navigate to the first selected group
      navigate(`/group/${selectedGroups[0]}`);
    } catch (err) {
      console.error("Upload error:", err);
      if (err.code === "ECONNABORTED") {
        setError("Upload timeout - file may be too large or connection is slow");
      } else if (err.response) {
        setError(err.response.data?.message || "Upload failed");
      } else if (err.request) {
        setError("Network error - please check your connection");
      } else {
        setError("Upload failed - please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Reel</h2>
      <p className="upload-subtitle">
        Upload once, share to multiple groups!
      </p>

      {error && <p className="upload-error">{error}</p>}

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Drag & Drop Zone */}
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""} ${video ? "has-file" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="drop-zone-input"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {!video ? (
            <>
              <div className="drop-zone-icon">📹</div>
              <p className="drop-zone-text">
                Drag & drop your video here, or <strong>browse</strong>
              </p>
              <p className="drop-zone-hint">Supports MP4, MOV, WEBM (max 50MB)</p>
            </>
          ) : (
            <div className="file-selected">
              <div className="file-info">
                <span className="file-icon">🎬</span>
                <span className="file-name">{video.name}</span>
              </div>
              <span className="file-size">{formatFileSize(video.size)}</span>
              <button
                type="button"
                className="file-remove"
                onClick={handleRemoveFile}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {loading && (
          <div className="upload-progress">
            <div className="progress-header">
              <span className="progress-label">Uploading...</span>
              <span className="progress-percentage">{uploadProgress}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className={`progress-bar ${uploadProgress === 100 ? "complete" : ""}`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="progress-status">
              {uploadProgress < 100
                ? "Please wait while your video uploads..."
                : "Processing video..."}
            </p>
          </div>
        )}

        <textarea
          className="upload-textarea"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Multi-select Groups */}
        <div className="group-selection">
          <label className="group-selection-label">
            Share to Groups ({selectedGroups.length} selected)
          </label>
          <div className="group-checkboxes">
            {groups.map(group => (
              <label
                key={group._id}
                className={`group-checkbox-item ${selectedGroups.includes(group._id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group._id)}
                  onChange={() => handleGroupToggle(group._id)}
                />
                <span className="group-name">{group.name}</span>
                {selectedGroups.includes(group._id) && (
                  <span className="check-icon">✓</span>
                )}
              </label>
            ))}
          </div>
          {groups.length === 0 && (
            <p className="no-groups-message">
              You're not a member of any groups yet. Join a group first!
            </p>
          )}
        </div>

        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? "Uploading..." : `Upload & Share to ${selectedGroups.length} Group${selectedGroups.length !== 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
};

export default UploadReel;
