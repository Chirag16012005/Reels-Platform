import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  const handleProfile = () => {
    navigate(`/users/${user._id}`);
  };

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <Link to={user ? "/groups" : "/login"} style={styles.brand}>
          ReelVault
        </Link>

        <div style={styles.actions}>
          {user ? (
            <>
              <span style={styles.username}>{user.username}</span>
              <Link to="/my-reels" style={styles.navLink}>
                My Reels
              </Link>
              <button type="button" style={styles.button} onClick={handleProfile}>
                Profile
              </button>
              <button type="button" style={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/signup" style={styles.primaryLink}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    borderBottom: "1px solid #e5e5e5",
    backgroundColor: "#ffffff",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "50px",
    zIndex: 1000,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  brand: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#111827",
    textDecoration: "none",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  username: {
    fontSize: "0.95rem",
    color: "#4b5563",
  },
  button: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
  },
  logoutButton: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #ef4444",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "opacity 0.2s ease",
  },
  link: {
    fontSize: "0.9rem",
    color: "#6b7280",
    textDecoration: "none",
  },
  navLink: {
    fontSize: "0.9rem",
    color: "#5843f7",
    textDecoration: "none",
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "rgba(88, 67, 247, 0.08)",
  },
  primaryLink: {
    padding: "6px 14px",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
};

export default Navbar;
