import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Shield, User, Lock } from "lucide-react";

const PORTALS = [
  {
    role: "cadet",
    icon: "👨🎓",
    title: "Cadet",
    desc: "Access your profile, training, exams and achievements.",
    color: "#1a6b3c",
    demo: { username: "cadet", password: "1234" },
    hint: "Username: Cadet ID (e.g. NCC001) · Password: Phone number",
  },
  {
    role: "officer",
    icon: "🎖️",
    title: "ANO / Officer",
    desc: "Manage cadets, training, examinations and performance.",
    color: "#174675",
    demo: { username: "ano", password: "1234" },
    hint: "Username: ano · Password: 1234",
  },
  {
    role: "admin",
    icon: "⭐",
    title: "CO / Admin",
    desc: "Full administrative access to NCC cadet management.",
    color: "#7b1fa2",
    demo: { username: "co", password: "1234" },
    hint: "Username: co · Password: 1234",
  },
];

function getDashboardPath(role) {
  if (role === "cadet") return "/cadet/dashboard";
  if (role === "officer") return "/officer/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export default function Login() {
  const [selectedPortal, setSelectedPortal] = useState(PORTALS[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, setError, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handlePortalSelect = (portal) => {
    setSelectedPortal(portal);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    login(username, password, selectedPortal.role);
  };

  return (
    <div className="login-page">
      <div className="login-container login-container-sm">

        {/* Header */}
        <div className="login-header">
          <div className="login-emblem">🇮🇳</div>
          <h1 className="login-title">NCC Digital Cadet System</h1>
          <p className="login-subtitle">
            National Cadet Corps — Digital Management Portal
          </p>
        </div>

        {/* Single card with portal selector + form */}
        <div className="login-card">

          {/* Portal selector tabs */}
          <div className="login-portal-tabs">
            {PORTALS.map((portal) => (
              <button
                key={portal.role}
                className="login-portal-tab"
                style={
                  selectedPortal.role === portal.role
                    ? { background: portal.color, color: "white", borderColor: portal.color }
                    : {}
                }
                onClick={() => handlePortalSelect(portal)}
              >
                <span>{portal.icon}</span>
                <span>{portal.title}</span>
              </button>
            ))}
          </div>

          {/* Colored top strip */}
          <div
            className="login-card-top"
            style={{ background: selectedPortal.color }}
          >
            <span className="login-card-icon">{selectedPortal.icon}</span>
            <h2 className="login-card-title">{selectedPortal.title} Portal</h2>
            <p className="login-card-sub">{selectedPortal.desc}</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">Username</label>
              <div className="login-input-wrap">
                <User size={17} className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder={`Enter ${selectedPortal.title} username`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <Lock size={17} className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <div className="login-error">❌ {error}</div>}

            <button
              type="submit"
              className="login-submit"
              style={{ background: selectedPortal.color }}
              disabled={loading}
            >
              {loading ? "Logging in..." : `🔐 Login as ${selectedPortal.title}`}
            </button>

            <div className="login-demo">
              <Shield size={14} />
              <span>{selectedPortal.hint || `Demo — Username: ${selectedPortal.demo.username} · Password: ${selectedPortal.demo.password}`}</span>
            </div>
          </form>
        </div>

        <p className="login-footer-text">🔒 Secure NCC Digital Management System</p>
      </div>
    </div>
  );
}
