import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Dumbbell } from "lucide-react";

const STATUS_COLORS = {
  Completed:    { background: "#dcfce7", color: "#166534" },
  Scheduled:    { background: "#dbeafe", color: "#1e40af" },
  "In Progress":{ background: "#ffedd5", color: "#9a3412" },
  Cancelled:    { background: "#fee2e2", color: "#991b1b" },
};

const ATT_COLORS = {
  Present:      { background: "#dcfce7", color: "#166534" },
  Absent:       { background: "#fee2e2", color: "#991b1b" },
  Leave:        { background: "#fef9c3", color: "#854d0e" },
  "Not Marked": { background: "#f3f4f6", color: "#6b7280" },
};

const DEFAULT_TRAININGS = [
  { id: 1, name: "Drill Training",     type: "Drill",             date: "2025-08-28", instructor: "Lt. Pradeep Sharma", location: "Parade Ground", status: "Completed", attendance: { NCC001: "Present", NCC002: "Present", NCC003: "Absent" } },
  { id: 2, name: "Physical Training",  type: "Physical Training", date: "2025-08-29", instructor: "Training Officer",   location: "Sports Ground", status: "Completed", attendance: { NCC001: "Present", NCC002: "Leave",   NCC003: "Present" } },
  { id: 3, name: "First Aid Workshop", type: "First Aid",         date: "2025-09-05", instructor: "Medical Officer",   location: "Classroom 1",   status: "Scheduled", attendance: {} },
  { id: 4, name: "Map Reading",        type: "Map Reading",       date: "2025-09-10", instructor: "Lt. Pradeep Sharma", location: "Field Area",   status: "Scheduled", attendance: {} },
];

export default function CadetTraining() {
  const { user } = useAuth();
  const cadetId = user?.cadetId || "NCC001";

  const trainings = (() => {
    const s = localStorage.getItem("nccTrainings");
    return s ? JSON.parse(s) : DEFAULT_TRAININGS;
  })();

  const [filter, setFilter] = useState("All");

  const records = trainings.map(t => ({
    ...t,
    myStatus: (t.attendance || {})[cadetId] || "Not Marked",
  }));

  const filtered = filter === "All" ? records : records.filter(r => r.status === filter);

  const completed  = records.filter(r => r.status === "Completed").length;
  const scheduled  = records.filter(r => r.status === "Scheduled").length;
  const myPresent  = records.filter(r => r.myStatus === "Present").length;
  const myMarked   = records.filter(r => r.myStatus !== "Not Marked").length;
  const myPct      = myMarked > 0 ? Math.round((myPresent / myMarked) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Training</h1>
          <p className="page-sub">Training sessions and your attendance</p>
        </div>
        <div className="page-header-badge">My Attendance: {myPct}%</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total Sessions", value: records.length, color: "#174675", bg: "#e3f0ff" },
          { label: "Completed",      value: completed,      color: "#166534", bg: "#dcfce7" },
          { label: "Upcoming",       value: scheduled,      color: "#1e40af", bg: "#dbeafe" },
          { label: "My Attendance",  value: `${myPct}%`,    color: myPct >= 75 ? "#166534" : "#991b1b", bg: myPct >= 75 ? "#dcfce7" : "#fee2e2" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Dumbbell size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {["All", "Completed", "Scheduled", "In Progress", "Cancelled"].map(f => (
          <button key={f} className={`tab ${filter === f ? "tab-active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr><th>Training</th><th>Type</th><th>Date</th><th>Instructor</th><th>Location</th><th>Status</th><th>My Attendance</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">No sessions found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td><span className="badge badge-blue">{r.type}</span></td>
                  <td>{r.date}</td>
                  <td style={{ color: "#6b7280" }}>{r.instructor}</td>
                  <td style={{ color: "#6b7280" }}>{r.location}</td>
                  <td><span className="badge" style={STATUS_COLORS[r.status]}>{r.status}</span></td>
                  <td><span className="badge" style={ATT_COLORS[r.myStatus]}>{r.myStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {records.length} sessions</div>
      </div>

      {/* Upcoming sessions cards */}
      {records.filter(r => r.status === "Scheduled").length > 0 && (
        <div className="card">
          <h3 className="card-title">📅 Upcoming Sessions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {records.filter(r => r.status === "Scheduled").map(r => (
              <div key={r.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, color: "#174675", marginBottom: 6 }}>{r.name}</div>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0" }}>📅 {r.date}</p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0" }}>👤 {r.instructor}</p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0" }}>📍 {r.location}</p>
                <span className="badge badge-blue" style={{ marginTop: 8, display: "inline-block" }}>{r.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
