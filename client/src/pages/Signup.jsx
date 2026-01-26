// ...existing code...
import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); //1: signup details, 2: otp verification
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      await api.post("/auth/send-signup-otp", {
        name,
        email,
        password
      });
      setSuccess("OTP sent successfully to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

 const verifyOtp = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    await api.post("/auth/verify-signup-otp", {
      email,
      otp,
      name,
      password,
    });

    setSuccess("Account created successfully! Redirecting to login...");
    setTimeout(() => navigate("/login"), 1500);
  } catch (err) {
    setError(err.response?.data?.message || "OTP verification failed");
  } finally {
    setLoading(false);
  }
};


  const goBack = () => {
    setStep(1);
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {step === 1 ? "Create your account" : "Verify OTP"}
        </h2>
        <p className="auth-subtitle">
          {step === 1 
            ? "Start exploring and posting reels today." 
            : "Enter the OTP sent to your email"}
        </p>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        {step === 1 ? (
          <form className="auth-form" onSubmit={sendOtp}>
            <label className="auth-label">
              Name
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                required
                disabled={loading}
              />
            </label>

            <label className="auth-label">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
                disabled={loading}
              />
            </label>

            <label className="auth-label">
              Password
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
                disabled={loading}
              />
            </label>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={verifyOtp}>
            <label className="auth-label">
              OTP Code
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="auth-input"
                required
                maxLength={6}
                disabled={loading}
              />
            </label>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Sign up"}
            </button>

            <button 
              type="button" 
              className="auth-button-secondary" 
              onClick={goBack}
              disabled={loading}
            >
              Back to Signup
            </button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;