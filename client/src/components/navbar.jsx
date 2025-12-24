import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2>Reels</h2>

      {user && (
        <div style={styles.right}>
          <span>@{user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    borderBottom: "1px solid #ddd",
  },
  right: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
};

export default Navbar;
