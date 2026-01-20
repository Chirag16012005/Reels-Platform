import { useAuth } from "../context/authcontext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <h1 style={styles.heading}>Profile</h1>
        <p style={styles.detail}>Username: <strong>{user.username}</strong></p>
        <p style={styles.detail}>Email: <strong>{user.email}</strong></p>
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
