import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authcontext";

const GroupFeed = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await api.get(`/reels/group/${groupId}`);
        setReels(res.data);
      } 
      catch (err) 
      {
        setError("Failed to load reels");
      } 
      finally 
      {
        setLoading(false);
      }
    };

    fetchReels();
  }, [groupId]);

  const handleLike = async (reelId) => {
    try {
      const res = await api.post("/reels/like", { reelId });

      setReels((prev) =>
        prev.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                likes: res.data.reel?.likes || [],
              }
            : reel
        )
      );
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const isLiked = (reel) => {
    if (!user || !reel.likes || reel.likes.length === 0) return false;
    
    return reel.likes.some((id) =>
        (typeof id === "string" && id === user._id) ||
        (typeof id === "object" && id.toString() === user._id) ||
        id.toString() === user._id.toString()
    );
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading feed...</p>;

  if (error)
    return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={styles.feed}>
      <div style={styles.uploadSection}>
        <button
        style={styles.uploadBtn}
        onClick={()=>{
          navigate(`/upload?groupId=${groupId}`);
        }}>
          Upload Your Reel
        </button>
      </div>
      {reels.length===0 && (
        <div style={styles.emptyState}>
          <p>No reels in this group yet</p>
            Upload Your Reel
        </div>
      )}

      {reels.map((reel) => {
        const liked = isLiked(reel);
        const likeCount = reel.likes?.length || 0; 

        return (
          <div key={reel._id} style={styles.reelCard}>
            <video src={reel.videoUrl} controls style={styles.video} />

            <div style={styles.meta}>
              <strong>@{reel.uploadedBy?.username || "Unknown"}</strong>
              <p>{reel.caption}</p>
            </div>

            <button
              style=
              {{
                ...styles.likeBtn,
                color: liked?"red":"black",
                fontWeight: liked ? "bold" : "normal",
              }}
              onClick={() => handleLike(reel._id)}
            >
              ❤️ {likeCount}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  feed: {
    maxWidth: "420px",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  reelCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    padding: "10px",
  },
  emptyState: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
  },
  video: {
    width: "100%",
    borderRadius: "6px",
  },
  meta: {
    marginTop: "8px",
  },
  likeBtn: {
    marginTop: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  uploadBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#fff",
    cursor: "pointer",
  },
  uploadSection: {
    display: "flex",
    justifyContent: "center",
    padding: "10px 0",
  },
};

export default GroupFeed;