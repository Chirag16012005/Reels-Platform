import { useEffect, useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import api from "../api/axios";

const UploadReel = () => {
  const [searchParams]=useSearchParams();
  const [video, setVideo] = useState(null);
  const [caption, setCaption] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch groups user belongs to
  useEffect(() => {
    api.get("/groups")
      .then(res => setGroups(res.data))
      .catch(() => setError("Failed to load groups"));
  }, []);

  useEffect(()=>{
    const presentGroupId=searchParams.get("groupId");
    if(presentGroupId){
      setGroupId(presentGroupId);
    }

  },[searchParams]);
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!video || !groupId) {
    setError("Video and group are required");
    return;
  }

  try {
    setLoading(true);
    setError(""); // Clear previous errors

    const formData = new FormData();
    formData.append("video", video);
    formData.append("caption", caption);
    formData.append("groupId", groupId);
    formData.append("title", "group reel");

    const response = await api.post("/reels/upload", formData, {
      onUploadProgress: (progressEvent) => {
        // Optional: You can add progress tracking here
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    console.log("Upload successful:", response.data);
    navigate(`/group/${groupId}`);
  } catch (err) {
    console.error("Upload error:", err);
    if (err.code === 'ECONNABORTED') {
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
    <div style={styles.container}>
      <h2>Upload Reel</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Select Group</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  error: {
    color: "red",
  },
};

export default UploadReel;
