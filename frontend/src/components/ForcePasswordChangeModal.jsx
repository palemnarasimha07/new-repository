import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, KeyRound, CheckCircle, LogOut } from "lucide-react";

export default function ForcePasswordChangeModal() {
  const { user, changeCadetPassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!user || user.role !== "cadet" || !user.mustChangePassword) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const res = changeCadetPassword(newPassword.trim());
    if (res.success) {
      setSuccessMsg("✅ Password updated successfully! Redirecting to your Cadet Dashboard...");
    } else {
      setError(res.error || "Failed to update password.");
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 99999, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)" }}>
      <div className="modal" style={{ maxWidth: 480, border: "2px solid #174675", borderRadius: 16 }}>
        <div className="modal-header" style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: 8, borderRadius: 8, display: "flex" }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 18, color: "#174675", margin: 0 }}>
                🔒 First-Time Password Change Required
              </h2>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Security Policy Enforcement for Cadets
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: "20px" }}>
            <p style={{ fontSize: 13.5, color: "#334155", margin: "0 0 16px", lineHeight: 1.5 }}>
              Welcome, <b>{user.name}</b>! As part of NCC Security Standards, you must change your temporary/default password before accessing the cadet portal.
            </p>

            {error && (
              <div className="login-error" style={{ marginBottom: 14 }}>
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 14, fontWeight: 600 }}>
                {successMsg}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-field">
                <label className="form-label" style={{ fontWeight: 600 }}>New Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                  <KeyRound size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" style={{ fontWeight: 600 }}>Confirm New Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                  <CheckCircle size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, background: "#f1f5f9", padding: 12, borderRadius: 8, fontSize: 12, color: "#64748b" }}>
              💡 <b>Tip:</b> Choose a secure password that you will remember for future logins.
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onClick={logout}
            >
              <LogOut size={15} /> Log Out
            </button>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "10px 20px", fontSize: 14 }}
            >
              Update Password & Continue →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
