import { useAuth } from "../context/authcontext";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

const Profile = () => {
  const { user } = useAuth();
  const {userId} = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwn=!user || userId===user?.id;

  // if (!user) {
  //   return null;
  // }
  useEffect(()=>{
    const fetchProfile=async()=>{
      try{
        if(isOwn)
        {
          setProfile(user);
        }
        else{
          const res=await api.get(`/users/${userId}`);
          setProfile(res.data);
        }
      }
      catch(err){
        setError(err.message);
      }
      finally{
        setLoading(false);
      }

    }
    fetchProfile();
  },[userId,user,isOwn])

    if (loading || !profile) {
      console.log("loading"); 
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <h1 style={styles.heading}>Profile</h1>
        <p style={styles.detail}>Username: <strong>{profile.username}</strong></p>
        <p style={styles.detail}>Email: <strong>{profile.email}</strong></p>
      </section>
    </main>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  heading: {
    marginBottom: "12px",
    fontSize: "1.75rem",
    color: "#111827",
  },
  detail: {
    marginBottom: "8px",
    fontSize: "1rem",
    color: "#374151",
  },
};

export default Profile;
