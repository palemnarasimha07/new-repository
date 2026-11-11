import { useAuth } from "../context/AuthContext";
import { ShieldAlert, User, Shield, Crown } from "lucide-react";

export default function DemoModeBanner() {
  const { user, login } = useAuth();

  const switchRole = (role) => {
    if (role === "cadet") {
      login("NCC001", "9876543210", "cadet");
    } else if (role === "officer") {
      login("ano", "1234", "officer");
    } else if (role === "admin") {
      login("co", "1234", "admin");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #174675 0%, #1e3a8a 100%)",
        color: "white",
        padding: "8px 20px",
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 999,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            background: "#f59e0b",
            color: "#000",
            fontSize: 10,
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: 4,
            textTransform: "uppercase",
            tracking: 1,
          }}
        >
          SIH 2026 PROTOTYPE DEMO MODE
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
          <ShieldAlert size={15} style={{ color: "#fbbf24" }} /> Active Persona:{" "}
          <strong style={{ color: "#fff" }}>
            {user?.name} ({user?.role?.toUpperCase()})
          </strong>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Quick Role Switcher:</span>
        <button
          onClick={() => switchRole("cadet")}
          style={{
            background: user?.role === "cadet" ? "#22c55e" : "rgba(255,255,255,0.15)",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <User size={12} /> Cadet (NCC001)
        </button>
        <button
          onClick={() => switchRole("officer")}
          style={{
            background: user?.role === "officer" ? "#3b82f6" : "rgba(255,255,255,0.15)",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Shield size={12} /> ANO / Officer
        </button>
        <button
          onClick={() => switchRole("admin")}
          style={{
            background: user?.role === "admin" ? "#a855f7" : "rgba(255,255,255,0.15)",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Crown size={12} /> CO / Admin
        </button>
      </div>
    </div>
  );
}
