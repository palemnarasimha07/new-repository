import { useState, useEffect } from "react";
import { CalendarCheck, Plus, X, Save } from "lucide-react";

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",  cadetId: "NCC001", unit: "Unit A" },
  { id: 2, name: "Priya Sharma", cadetId: "NCC002", unit: "Unit A" },
  { id: 3, name: "Arjun Reddy",  cadetId: "NCC003", unit: "Unit B" },
  { id: 4, name: "Sneha Rao",    cadetId: "NCC004", unit: "Unit B" },
  { id: 5, name: "Vikram Singh", cadetId: "NCC005", unit: "Unit A" },
];

const TYPES = ["Parade", "Training", "Camp", "Event"];
const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

const STATUS_STYLE = {
  Present: { background: "#dcfce7", color: "#166534" },
  Absent:  { background: "#fee2e2", color: "#991b1b" },
  Leave:   { background: "#fef9c3", color: "#854d0e" },
  "Not Marked": { background: "#f3f4f6", color: "#6b7280" },
};

export default function AttendanceManagement() {
  const [cadets] = useState(() => {
    const s = localStorage.getItem("nccCadets");
    return s ? JSON.parse(s) : DEFAULT_CADETS;
  });

  const [sessions, setSessions] = useState(() => {
    const s = localStorage.getItem("nccAttendance");
    return s ? JSON.parse(s) : [
      {
        id: 1, type: "Parade", date: "2025-08-28",
        instructor: "Lt. Pradeep Sharma", location: "Parade Ground",
        records: { NCC001: "Present", NCC002: "Present", NCC003: "Absent", NCC004: "Present", NCC005: "Present" },
      },
      {
        id: 2, type: "Training", date: "2025-08-29",
        instructor: "Training Officer", location: "Sports Ground",
        records: { NCC001: "Present", NCC002: "Leave", NCC003: "Present", NCC004: "Present", NCC005: "Present" },
      },
    ];
  });

  const [activeTab, setActiveTab]     = useState("All");
  const [showForm, setShowForm]       = useState(false);
  const [markSession, setMarkSession] = useState(null);
  const [tempRecords, setTempRecords] = useState({});
  const [form, setForm] = useState({ type: "Parade", date: "", instructor: "", location: "" });

  useEffect(() => {
    localStorage.setItem("nccAttendance", JSON.stringify(sessions));
  }, [sessions]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const getPercent = (session) => {
    const vals = Object.values(session.records || {});
    if (!vals.length) return 0;
    return Math.round((vals.filter(v => v === "Present").length / vals.length) * 100);
  };

  const cadetAttendance = (cadetId) => {
    const all = sessions.filter(s => s.records?.[cadetId]);
    if (!all.length) return 0;
    const present = all.filter(s => s.records[cadetId] === "Present").length;
    return Math.round((present / all.length) * 100);
  };

  const filtered = activeTab === "All" ? sessions : sessions.filter(s => s.type === activeTab);

  // ── Add session ────────────────────────────────────────────────────────────
  const addSession = (e) => {
    e.preventDefault();
    if (!form.date || !form.instructor || !form.location) return;
    const records = {};
    cadets.forEach(c => { records[c.cadetId] = "Not Marked"; });
    setSessions([...sessions, { id: Date.now(), ...form, records }]);
    setForm({ type: "Parade", date: "", instructor: "", location: "" });
    setShowForm(false);
  };

  // ── Mark attendance ────────────────────────────────────────────────────────
  const openMark = (session) => {
    setMarkSession(session);
    setTempRecords({ ...session.records });
  };

  const saveAttendance = () => {
    setSessions(sessions.map(s =>
      s.id === markSession.id ? { ...s, records: tempRecords } : s
    ));
    setMarkSession(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-sub">Record and track cadet attendance</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} style={{ marginRight: 6 }} />New Session
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total Sessions", value: sessions.length,                                    color: "#174675", bg: "#e3f0ff" },
          { label: "Parade",         value: sessions.filter(s => s.type === "Parade").length,   color: "#2e7d32", bg: "#e8f5e9" },
          { label: "Training",       value: sessions.filter(s => s.type === "Training").length, color: "#ef6c00", bg: "#fff3e0" },
          { label: "Camp",           value: sessions.filter(s => s.type === "Camp").length,     color: "#6a1b9a", bg: "#f3e5f5" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <CalendarCheck size={20} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["All", ...TYPES].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "tab-active" : ""}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Sessions table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th><th>Date</th><th>Instructor</th>
                <th>Location</th><th>Attendance %</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No sessions found.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-blue">{s.type}</span></td>
                  <td>{s.date}</td>
                  <td>{s.instructor}</td>
                  <td>{s.location}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="mini-progress">
                        <div className="mini-progress-fill" style={{ width: `${getPercent(s)}%`, background: getPercent(s) >= 75 ? "#22c55e" : "#ef4444" }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{getPercent(s)}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn-primary btn-sm" onClick={() => openMark(s)}>
                      Mark Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cadet-wise summary */}
      <div className="card">
        <h3 className="card-title">👨🎓 Cadet-wise Attendance Summary</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr><th>Cadet</th><th>Cadet ID</th><th>Unit</th><th>Overall Attendance</th><th>Status</th></tr>
            </thead>
            <tbody>
              {cadets.map(c => {
                const pct = cadetAttendance(c.cadetId);
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-blue">{c.cadetId}</span></td>
                    <td>{c.unit}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="mini-progress">
                          <div className="mini-progress-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "#22c55e" : "#ef4444" }} />
                        </div>
                        <span style={{ fontWeight: 700, color: pct >= 75 ? "#16a34a" : "#dc2626", fontSize: 13 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      {pct < 75
                        ? <span className="badge badge-red">⚠️ Low Attendance</span>
                        : <span className="badge badge-green">✅ Good</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Session Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">➕ New Attendance Session</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={addSession}>
              <div className="modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="form-field">
                    <label className="form-label">Session Type</label>
                    <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Instructor *</label>
                    <input className="form-input" placeholder="Instructor name" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Location *</label>
                    <input className="form-input" placeholder="e.g. Parade Ground" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {markSession && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">📋 Mark Attendance — {markSession.type}</h2>
              <button className="modal-close" onClick={() => setMarkSession(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: "#f0f4f8", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#374151" }}>
                📅 {markSession.date} &nbsp;·&nbsp; 👤 {markSession.instructor} &nbsp;·&nbsp; 📍 {markSession.location}
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Cadet</th><th>Cadet ID</th><th>Unit</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {cadets.map(c => {
                    const status = tempRecords[c.cadetId] || "Not Marked";
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.cadetId}</td>
                        <td>{c.unit}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {STATUS_OPTIONS.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setTempRecords({ ...tempRecords, [c.cadetId]: opt })}
                                style={{
                                  padding: "5px 12px", borderRadius: 6, border: "none",
                                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  ...(status === opt ? STATUS_STYLE[opt] : { background: "#f3f4f6", color: "#6b7280" }),
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMarkSession(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveAttendance}>
                <Save size={15} style={{ marginRight: 6 }} />Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
