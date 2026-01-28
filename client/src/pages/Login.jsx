// ...existing code...
import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import "../styles/AuthPage.css";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handlesumbit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      login(res.data.user);
      navigate("/groups");
    } catch (err) {
      seterror(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Log in to continue sharing reels.</p>
        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handlesumbit}>
          <label className="auth-label">
            Email
            <input
              type="email"              
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="auth-input"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className="auth-input"
              required
            />
          </label>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;