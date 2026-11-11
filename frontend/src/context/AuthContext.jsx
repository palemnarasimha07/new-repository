import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// ─── Static officer/admin users ─────────────────────────────────────────────
const STATIC_USERS = [
  { id: 2, username: "ano", password: "1234", role: "officer", name: "Lt. Pradeep Sharma", rank: "Lieutenant", unit: "1 Karnataka Battalion", institution: "Government College of Engineering", avatar: null },
  { id: 3, username: "co",  password: "1234", role: "admin",   name: "Col. Rajesh Verma",  rank: "Colonel",    unit: "Karnataka Directorate",  institution: "NCC Directorate Karnataka",       avatar: null },
];

// ─── Resolve cadet login against nccCadets localStorage ─────────────────────
function findCadetUser(username, password) {
  const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
  // Match by cadetId (username) + stored password (or phone / legacy default 1234)
  const c = cadets.find(c => {
    const isCadetIdMatch = c.cadetId?.toLowerCase() === username.toLowerCase() || (username.toLowerCase() === "cadet" && c.cadetId === "NCC001");
    if (!isCadetIdMatch) return false;

    const expectedPass = c.password || c.phone || "1234";
    return password === expectedPass || (username.toLowerCase() === "cadet" && password === "1234");
  });

  if (!c) return null;

  // mustChangePassword defaults to true unless explicitly set to false
  const mustChangePassword = c.mustChangePassword !== false;

  return {
    id: c.id,
    username: c.cadetId,
    role: "cadet",
    name: c.name,
    cadetId: c.cadetId,
    rank: c.rank || "Cadet",
    wing: c.wing || "",
    unit: c.unit || "",
    institution: c.institution || "",
    enrollmentDate: c.enrollmentDate || "",
    phone: c.phone || "",
    email: c.email || "",
    bloodGroup: c.bloodGroup || "",
    gender: c.gender || "",
    mustChangePassword,
    avatar: null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nccUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to log system audit actions
  const logAudit = (actionText, actorName, actorRole) => {
    try {
      const logs = JSON.parse(localStorage.getItem("nccAuditLogs") || "[]");
      const newEntry = {
        id: Date.now() + Math.random(),
        user: actorName || "System",
        role: actorRole || "system",
        action: actionText,
        timestamp: new Date().toLocaleString("en-IN"),
      };
      localStorage.setItem("nccAuditLogs", JSON.stringify([newEntry, ...logs]));
    } catch (e) {
      console.error("Audit log error:", e);
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = (username, password, portalRole) => {
    setLoading(true);
    setError("");

    setTimeout(() => {
      let found = null;

      if (portalRole === "cadet") {
        found = findCadetUser(username.trim(), password);
      } else {
        const match = STATIC_USERS.find(
          u => u.username === username.trim() && u.password === password && u.role === portalRole
        );
        if (match) {
          const { password: _pw, ...safe } = match;
          found = { ...safe, mustChangePassword: false };
        }
      }

      if (found) {
        setUser(found);
        localStorage.setItem("nccUser", JSON.stringify(found));
        setError("");
        logAudit(`User logged in (${found.role.toUpperCase()} portal)`, found.name || found.username, found.role);
      } else {
        setError("Invalid credentials. Cadets: use Cadet ID + phone number / password.");
      }

      setLoading(false);
    }, 400);
  };

  // ── Change Cadet Password (Forced first-time or user initiated) ────────────
  const changeCadetPassword = (newPassword) => {
    if (!user || user.role !== "cadet") return { success: false, error: "Only cadets can change password here." };

    const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
    const updatedCadets = cadets.map(c => {
      if (c.id === user.id || c.cadetId === user.cadetId) {
        return { ...c, password: newPassword, mustChangePassword: false };
      }
      return c;
    });

    localStorage.setItem("nccCadets", JSON.stringify(updatedCadets));

    const updatedUser = { ...user, mustChangePassword: false };
    setUser(updatedUser);
    localStorage.setItem("nccUser", JSON.stringify(updatedUser));

    logAudit(`Cadet updated password successfully`, user.name, "cadet");
    return { success: true };
  };

  // ── Reset Cadet Password (by ANO or CO) ──────────────────────────────────
  const resetCadetPassword = (cadetTargetId) => {
    const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
    let targetCadetName = "";

    const updatedCadets = cadets.map(c => {
      if (c.id === cadetTargetId || c.cadetId === cadetTargetId) {
        targetCadetName = c.name;
        // Reset password to phone number or 1234 and require first-time change
        return {
          ...c,
          password: c.phone || "1234",
          mustChangePassword: true
        };
      }
      return c;
    });

    localStorage.setItem("nccCadets", JSON.stringify(updatedCadets));
    logAudit(`Reset password for Cadet ${targetCadetName || cadetTargetId}`, user?.name || "Officer", user?.role || "officer");
    return { success: true, cadetName: targetCadetName };
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    if (user) {
      logAudit(`User logged out`, user.name || user.username, user.role);
    }
    setUser(null);
    localStorage.removeItem("nccUser");
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isAuthenticated = !!user;
  const isCadet = user?.role === "cadet";
  const isOfficer = user?.role === "officer";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        changeCadetPassword,
        resetCadetPassword,
        isAuthenticated,
        isCadet,
        isOfficer,
        isAdmin,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
