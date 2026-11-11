import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { CalendarCheck } from "lucide-react";

const STATUS_COLORS = {
  Present:    { background: "#dcfce7", color: "#166534" },
  Absent:     { background: "#fee2e2", color: "#991b1b" },
  Leave:      { background: "#fef9c3", color: "#854d0e" },
  "Not Marked": { background: "#f3f4f6", color: "#6b7280" },
};

const DEFAULT_SESSIONS = [
  { id: 1, name: "Drill Training",     type: "Drill",             date: "2025-08-28", instructor: "Lt. Pradeep Sharma" },
  { id: 2, name: "Physical Training",  type: "Physical Training", date: "2025-08-29", instructor: "Training Officer" },
  { id: 3, name: "First Aid Workshop", type: "First Aid",         date: "2025-09-05", instructor: "Medical Officer" },
  { id: 4, name: "Map Reading",        type: "Map Reading",       date: "2025-09-10", instructor: "Lt. Pradeep Sharma" },
];

const DEFAULT_ATTENDANCE = {
  1: { NCC001: "Present", NCC002: "Present", NCC003: "Absent",  NCC004: "Present", NCC005: "Present" },
  2: { NCC001: "Present", NCC002: "Leave",   NCC003: "Present", NCC004: "Present", NCC005: "Present" },
  3: { NCC001: "Absent",  NCC002: "Present", NCC003: "Present", NCC004: "Leave",   NCC005: "Present" },
  4: {},
};

export default function CadetAttendance() {
  const { user } = useAuth();
  const cadetId = user?.cadetId || "NCC001";

  const trainings = (() => {
    const s = localStorage.getItem("nccTrainings");
    return s ? JSON.parse(s) : DEFAULT_SESSIONS;
  })();

  const [filter, setFilter] = useState("All");

  const records = trainings.map(t => {
    const att = t.attendance || DEFAULT_ATTENDANCE[t.id] || {};
    const status = att[cadetId] || "Not Marked";
    return { ...t, status };
  });

  const filtered = filter === "All" ? records : records.filter(r => r.status === filter);

  const present    = records.filter(r => r.status === "Present").length;
  const absent     = records.filter(r => r.status === "Absent").length;
  const leave      = records.filter(r => r.status === "Leave").length;
  const marked     = records.filter(r => r.status !== "Not Marked").length;
  const attendPct  = marked > 0 ? Math.round((present / marked) * 100) : 0;

  const stats = [
    { label: "Total Sessions", value: records.length, color: "#174675", bg: "#e3f0ff" },
    { label: "Present",        value: present,         color: "#166534", bg: "#dcfce7" },
    { label: "Absent",         value: absent,          color: "#991b1b", bg: "#fee2e2" },
    { label: "Leave",          value: leave,           color: "#854d0e", bg: "#fef9c3" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-sub">Your training and parade attendance record</p>
        </div>
        <div className="page-header-badge">Overall: {attendPct}%</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><CalendarCheck size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Attendance bar */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Attendance Rate</span>
          <span style={{ fontWeight: 700, color: attendPct >= 75 ? "#166534" : "#991b1b" }}>{attendPct}%</span>
        </div>
        <div style={{ height: 12, background: "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ width: `${attendPct}%`, height: "100%", background: attendPct >= 75 ? "#22c55e" : "#ef4444", borderRadius: 10, transition: "width 0.4s" }} />
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Minimum required attendance: 75%</p>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {["All", "Present", "Absent", "Leave", "Not Marked"].map(f => (
          <button key={f} className={`tab ${filter === f ? "tab-active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr><th>Session</th><th>Type</th><th>Date</th><th>Instructor</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">No records found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td><span className="badge badge-blue">{r.type}</span></td>
                  <td>{r.date}</td>
                  <td style={{ color: "#6b7280" }}>{r.instructor}</td>
                  <td><span className="badge" style={STATUS_COLORS[r.status]}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {records.length} sessions</div>
      </div>
    </div>
  );
}
