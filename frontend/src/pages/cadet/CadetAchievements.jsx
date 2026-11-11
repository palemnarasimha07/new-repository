import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Trophy, X } from "lucide-react";

const LEVEL_COLORS = {
  Unit:     { background: "#f3f4f6", color: "#374151" },
  District: { background: "#dbeafe", color: "#1e40af" },
  State:    { background: "#ffedd5", color: "#9a3412" },
  National: { background: "#dcfce7", color: "#166534" },
};

const CAT_COLORS = {
  "Best Cadet":    { background: "#fef9c3", color: "#854d0e" },
  Sports:          { background: "#dcfce7", color: "#166534" },
  Drill:           { background: "#dbeafe", color: "#1e40af" },
  Camp:            { background: "#f3e8ff", color: "#6b21a8" },
  Leadership:      { background: "#ffedd5", color: "#9a3412" },
  "Social Service":{ background: "#e0f2fe", color: "#0369a1" },
  Shooting:        { background: "#fee2e2", color: "#991b1b" },
  Certificate:     { background: "#f0fdf4", color: "#15803d" },
  Other:           { background: "#f3f4f6", color: "#374151" },
};

const DEFAULT_ACHIEVEMENTS = [
  { id: 1, cadetName: "Rahul Kumar",  rollNo: "NCC001", title: "Best Cadet Award",  category: "Best Cadet", date: "2025-08-15", level: "Unit",     certificateNo: "CERT001", description: "Selected as Best Cadet for outstanding performance." },
  { id: 2, cadetName: "Priya Sharma", rollNo: "NCC002", title: "Drill Competition", category: "Drill",      date: "2025-07-20", level: "District", certificateNo: "CERT002", description: "Secured 2nd position in district drill competition." },
  { id: 3, cadetName: "Arjun Reddy",  rollNo: "NCC003", title: "Sports Gold Medal", category: "Sports",     date: "2025-06-10", level: "State",    certificateNo: "CERT003", description: "Won gold medal in state-level athletics." },
];

export default function CadetAchievements() {
  const { user } = useAuth();
  const cadetId = user?.cadetId || "NCC001";

  const all = (() => {
    const s = localStorage.getItem("nccAchievements");
    return s ? JSON.parse(s) : DEFAULT_ACHIEVEMENTS;
  })();

  const achievements = all.filter(a => a.rollNo === cadetId);
  const [viewItem, setViewItem] = useState(null);

  const stats = [
    { label: "Total",    value: achievements.length,                                       color: "#174675", bg: "#e3f0ff" },
    { label: "National", value: achievements.filter(a => a.level === "National").length,   color: "#166534", bg: "#dcfce7" },
    { label: "State",    value: achievements.filter(a => a.level === "State").length,      color: "#9a3412", bg: "#ffedd5" },
    { label: "District", value: achievements.filter(a => a.level === "District").length,   color: "#1e40af", bg: "#dbeafe" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Achievements</h1>
          <p className="page-sub">Your awards and recognitions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Trophy size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {achievements.length === 0 ? (
        <div className="coming-soon-card">
          <Trophy size={48} color="#d1d5db" />
          <h2>No Achievements Yet</h2>
          <p>Your achievements will appear here once recorded by your officer.</p>
        </div>
      ) : (
        <>
          {/* Achievement cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {achievements.map(a => (
              <div key={a.id} className="card" style={{ borderTop: `4px solid ${a.level === "National" ? "#22c55e" : a.level === "State" ? "#f97316" : a.level === "District" ? "#3b82f6" : "#9ca3af"}`, cursor: "pointer" }} onClick={() => setViewItem(a)}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
                <h3 style={{ color: "#174675", margin: "0 0 8px", fontSize: 15 }}>{a.title}</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  <span className="badge" style={CAT_COLORS[a.category] || CAT_COLORS.Other}>{a.category}</span>
                  <span className="badge" style={LEVEL_COLORS[a.level] || LEVEL_COLORS.Unit}>{a.level}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0" }}>📅 {a.date}</p>
                {a.certificateNo && <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0" }}>🏅 {a.certificateNo}</p>}
              </div>
            ))}
          </div>

          {/* Table view */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <h3 className="card-title" style={{ margin: 0 }}>📋 Achievement Records</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr><th>Achievement</th><th>Category</th><th>Level</th><th>Date</th><th>Certificate No</th></tr>
                </thead>
                <tbody>
                  {achievements.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.title}</td>
                      <td><span className="badge" style={CAT_COLORS[a.category] || CAT_COLORS.Other}>{a.category}</span></td>
                      <td><span className="badge" style={LEVEL_COLORS[a.level] || LEVEL_COLORS.Unit}>{a.level}</span></td>
                      <td>{a.date}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 13, color: "#6b7280" }}>{a.certificateNo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title">🏆 Achievement Details</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 52 }}>🏆</div>
                <h3 style={{ color: "#174675", margin: "8px 0 4px" }}>{viewItem.title}</h3>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <span className="badge" style={CAT_COLORS[viewItem.category] || CAT_COLORS.Other}>{viewItem.category}</span>
                  <span className="badge" style={LEVEL_COLORS[viewItem.level] || LEVEL_COLORS.Unit}>{viewItem.level} Level</span>
                </div>
              </div>
              <div className="profile-grid">
                {[["Date", viewItem.date], ["Certificate No", viewItem.certificateNo || "—"]].map(([l, v]) => (
                  <div key={l} className="profile-field">
                    <div className="profile-field-label">{l}</div>
                    <div className="profile-field-value">{v}</div>
                  </div>
                ))}
              </div>
              {viewItem.description && (
                <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 8, padding: 14, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                  {viewItem.description}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


