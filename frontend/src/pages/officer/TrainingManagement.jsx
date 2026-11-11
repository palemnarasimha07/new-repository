import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, Save, Dumbbell } from "lucide-react";

const TRAINING_TYPES = ["Drill", "Physical Training", "Weapon Training", "Map Reading", "First Aid", "Leadership", "Field Training", "Disaster Management", "Personality Development", "Other"];
const STATUSES = ["Scheduled", "In Progress", "Completed", "Cancelled"];

const STATUS_COLORS = {
  Completed:    { bg: "#dcfce7", color: "#166534" },
  Scheduled:    { bg: "#dbeafe", color: "#1e40af" },
  "In Progress":{ bg: "#ffedd5", color: "#9a3412" },
  Cancelled:    { bg: "#fee2e2", color: "#991b1b" },
};

const DEFAULT_TRAININGS = [
  { id: 1, name: "Drill Training",     type: "Drill",             date: "2025-08-28", instructor: "Lt. Pradeep Sharma", location: "Parade Ground", status: "Completed", attendance: { NCC001: "Present", NCC002: "Present", NCC003: "Absent",  NCC004: "Present", NCC005: "Present" } },
  { id: 2, name: "Physical Training",  type: "Physical Training", date: "2025-08-29", instructor: "Training Officer",   location: "Sports Ground", status: "Completed", attendance: { NCC001: "Present", NCC002: "Leave",   NCC003: "Present", NCC004: "Present", NCC005: "Present" } },
  { id: 3, name: "First Aid Workshop", type: "First Aid",         date: "2025-09-05", instructor: "Medical Officer",   location: "Classroom 1",   status: "Scheduled", attendance: {} },
  { id: 4, name: "Map Reading",        type: "Map Reading",       date: "2025-09-10", instructor: "Lt. Pradeep Sharma", location: "Field Area",   status: "Scheduled", attendance: {} },
];

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",  cadetId: "NCC001", unit: "Unit A" },
  { id: 2, name: "Priya Sharma", cadetId: "NCC002", unit: "Unit A" },
  { id: 3, name: "Arjun Reddy",  cadetId: "NCC003", unit: "Unit B" },
  { id: 4, name: "Sneha Rao",    cadetId: "NCC004", unit: "Unit B" },
  { id: 5, name: "Vikram Singh", cadetId: "NCC005", unit: "Unit A" },
];

const EMPTY_FORM = { name: "", type: "Drill", date: "", instructor: "", location: "", status: "Scheduled" };

export default function TrainingManagement() {
  const [trainings, setTrainings] = useState(() => {
    const s = localStorage.getItem("nccTrainings");
    return s ? JSON.parse(s) : DEFAULT_TRAININGS;
  });
  const [cadets] = useState(() => {
    const s = localStorage.getItem("nccCadets");
    return s ? JSON.parse(s) : DEFAULT_CADETS;
  });

  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [markSession, setMarkSession] = useState(null);
  const [tempAtt, setTempAtt]       = useState({});
  const [formError, setFormError]   = useState("");

  useEffect(() => { localStorage.setItem("nccTrainings", JSON.stringify(trainings)); }, [trainings]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total     = trainings.length;
  const completed = trainings.filter(t => t.status === "Completed").length;
  const scheduled = trainings.filter(t => t.status === "Scheduled").length;
  const inProg    = trainings.filter(t => t.status === "In Progress").length;

  const getAttPct = (t) => {
    const vals = Object.values(t.attendance || {});
    if (!vals.length) return null;
    return Math.round((vals.filter(v => v === "Present").length / vals.length) * 100);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = trainings.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = `${t.name} ${t.type} ${t.instructor} ${t.location}`.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(""); setShowForm(true); };
  const openEdit = (t) => {
    setForm({ name: t.name, type: t.type, date: t.date, instructor: t.instructor, location: t.location, status: t.status });
    setEditingId(t.id); setFormError(""); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const saveTraining = (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.instructor || !form.location) {
      setFormError("Please fill all required fields."); return;
    }
    if (editingId) {
      setTrainings(trainings.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      const att = {};
      cadets.forEach(c => { att[c.cadetId] = "Not Marked"; });
      setTrainings([...trainings, { id: Date.now(), ...form, attendance: att }]);
    }
    closeForm();
  };

  const deleteTraining = (id) => {
    if (window.confirm("Delete this training session?")) setTrainings(trainings.filter(t => t.id !== id));
  };

  // ── Attendance ─────────────────────────────────────────────────────────────
  const openMark = (t) => { setMarkSession(t); setTempAtt({ ...t.attendance }); };
  const saveAtt  = () => {
    setTrainings(trainings.map(t => t.id === markSession.id ? { ...t, attendance: tempAtt } : t));
    setMarkSession(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Management</h1>
          <p className="page-sub">Manage NCC training sessions and attendance</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} style={{ marginRight: 6 }} />Add Training
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total Sessions", value: total,     color: "#174675", bg: "#e3f0ff" },
          { label: "Completed",      value: completed, color: "#2e7d32", bg: "#e8f5e9" },
          { label: "Scheduled",      value: scheduled, color: "#1565c0", bg: "#e3f2fd" },
          { label: "In Progress",    value: inProg,    color: "#ef6c00", bg: "#fff3e0" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Dumbbell size={20} /></div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input className="search-input" placeholder="Search training..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr><th>Training</th><th>Type</th><th>Date</th><th>Instructor</th><th>Location</th><th>Status</th><th>Attendance</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">No training sessions found.</td></tr>
              ) : filtered.map(t => {
                const pct = getAttPct(t);
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td><span className="badge badge-blue">{t.type}</span></td>
                    <td>{t.date}</td>
                    <td>{t.instructor}</td>
                    <td>{t.location}</td>
                    <td>
                      <span className="badge" style={STATUS_COLORS[t.status] || { bg: "#f3f4f6", color: "#6b7280" }}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {pct === null ? (
                        <span style={{ color: "#9ca3af", fontSize: 13 }}>Not marked</span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="mini-progress">
                            <div className="mini-progress-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "#22c55e" : "#ef4444" }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{pct}%</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="icon-btn icon-btn-blue"  onClick={() => openMark(t)} title="Mark Attendance">📋</button>
                        <button className="icon-btn icon-btn-green" onClick={() => openEdit(t)}><Pencil size={15} /></button>
                        <button className="icon-btn icon-btn-red"   onClick={() => deleteTraining(t.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {total} sessions</div>
      </div>

      {/* Training Overview Cards */}
      <div className="card">
        <h3 className="card-title">📚 Training Overview</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {trainings.map(t => {
            const pct = getAttPct(t);
            return (
              <div key={t.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h4 style={{ color: "#174675", margin: 0, fontSize: 14 }}>{t.name}</h4>
                  <span className="badge" style={STATUS_COLORS[t.status]}>{t.status}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0" }}>📅 {t.date}</p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0" }}>👤 {t.instructor}</p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0" }}>📍 {t.location}</p>
                {pct !== null && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>Attendance</span><span style={{ fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "#22c55e" : "#ef4444" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "✏️ Edit Training" : "➕ Add Training Session"}</h2>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
            </div>
            <form onSubmit={saveTraining}>
              <div className="modal-body">
                {formError && <div className="login-error" style={{ marginBottom: 16 }}>⚠️ {formError}</div>}
                <div className="form-grid">
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Training Name *</label>
                    <input className="form-input" placeholder="e.g. Drill Training" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Type *</label>
                    <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Instructor *</label>
                    <input className="form-input" placeholder="Instructor name" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Location *</label>
                    <input className="form-input" placeholder="e.g. Parade Ground" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update" : "Save Training"}</button>
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
              <h2 className="modal-title">📋 Attendance — {markSession.name}</h2>
              <button className="modal-close" onClick={() => setMarkSession(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: "#f0f4f8", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#374151" }}>
                📅 {markSession.date} &nbsp;·&nbsp; 👤 {markSession.instructor} &nbsp;·&nbsp; 📍 {markSession.location}
              </div>
              <table className="data-table">
                <thead><tr><th>Cadet</th><th>Cadet ID</th><th>Unit</th><th>Status</th></tr></thead>
                <tbody>
                  {cadets.map(c => {
                    const status = tempAtt[c.cadetId] || "Not Marked";
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.cadetId}</td>
                        <td>{c.unit}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {["Present", "Absent", "Leave"].map(opt => (
                              <button key={opt} onClick={() => setTempAtt({ ...tempAtt, [c.cadetId]: opt })}
                                style={{
                                  padding: "5px 12px", borderRadius: 6, border: "none",
                                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  ...(status === opt
                                    ? opt === "Present" ? { background: "#dcfce7", color: "#166534" }
                                      : opt === "Absent" ? { background: "#fee2e2", color: "#991b1b" }
                                      : { background: "#fef9c3", color: "#854d0e" }
                                    : { background: "#f3f4f6", color: "#6b7280" }),
                                }}
                              >{opt}</button>
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
              <button className="btn-primary" onClick={saveAtt}><Save size={15} style={{ marginRight: 6 }} />Save Attendance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
