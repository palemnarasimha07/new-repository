import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, Trophy } from "lucide-react";

const CATEGORIES = ["Best Cadet", "Sports", "Drill", "Camp", "Leadership", "Social Service", "Shooting", "Certificate", "Other"];
const LEVELS = ["Unit", "District", "State", "National"];

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
  { id: 1, cadetName: "Rahul Kumar",  rollNo: "NCC001", title: "Best Cadet Award",   category: "Best Cadet", date: "2025-08-15", level: "Unit",     certificateNo: "CERT001", description: "Selected as Best Cadet for outstanding performance and discipline." },
  { id: 2, cadetName: "Priya Sharma", rollNo: "NCC002", title: "Drill Competition",  category: "Drill",      date: "2025-07-20", level: "District", certificateNo: "CERT002", description: "Secured 2nd position in district drill competition." },
  { id: 3, cadetName: "Arjun Reddy",  rollNo: "NCC003", title: "Sports Gold Medal",  category: "Sports",     date: "2025-06-10", level: "State",    certificateNo: "CERT003", description: "Won gold medal in state-level athletics." },
];

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",  rollNo: "NCC001" },
  { id: 2, name: "Priya Sharma", rollNo: "NCC002" },
  { id: 3, name: "Arjun Reddy",  rollNo: "NCC003" },
  { id: 4, name: "Sneha Rao",    rollNo: "NCC004" },
  { id: 5, name: "Vikram Singh", rollNo: "NCC005" },
];

const EMPTY_FORM = { cadetName: "", rollNo: "", title: "", category: "Best Cadet", date: "", level: "Unit", certificateNo: "", description: "" };

export default function AchievementsManagement() {
  const [achievements, setAchievements] = useState(() => {
    const s = localStorage.getItem("nccAchievements");
    return s ? JSON.parse(s) : DEFAULT_ACHIEVEMENTS;
  });
  const [cadets] = useState(() => {
    const s = localStorage.getItem("nccCadets");
    return s ? JSON.parse(s) : DEFAULT_CADETS;
  });

  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [lvlFilter, setLvlFilter] = useState("All");
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { localStorage.setItem("nccAchievements", JSON.stringify(achievements)); }, [achievements]);

  const filtered = achievements.filter(a => {
    const q = search.toLowerCase();
    const matchQ = `${a.cadetName} ${a.rollNo} ${a.title} ${a.category} ${a.level}`.toLowerCase().includes(q);
    const matchCat = catFilter === "All" || a.category === catFilter;
    const matchLvl = lvlFilter === "All" || a.level === lvlFilter;
    return matchQ && matchCat && matchLvl;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ cadetName: a.cadetName, rollNo: a.rollNo, title: a.title, category: a.category, date: a.date, level: a.level, certificateNo: a.certificateNo, description: a.description }); setEditingId(a.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleCadetChange = (e) => {
    const c = cadets.find(c => c.rollNo === e.target.value);
    setForm(f => ({ ...f, cadetName: c ? c.name : "", rollNo: c ? c.rollNo : "" }));
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.cadetName || !form.title || !form.date) return;
    if (editingId) {
      setAchievements(achievements.map(a => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setAchievements([...achievements, { id: Date.now(), ...form }]);
    }
    closeForm();
  };

  const del = (id) => { if (window.confirm("Delete this achievement?")) setAchievements(achievements.filter(a => a.id !== id)); };

  const stats = [
    { label: "Total",    value: achievements.length,                                    color: "#174675", bg: "#e3f0ff" },
    { label: "National", value: achievements.filter(a => a.level === "National").length, color: "#166534", bg: "#dcfce7" },
    { label: "State",    value: achievements.filter(a => a.level === "State").length,    color: "#9a3412", bg: "#ffedd5" },
    { label: "Sports",   value: achievements.filter(a => a.category === "Sports").length,color: "#1e40af", bg: "#dbeafe" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Achievements Management</h1>
          <p className="page-sub">Track and manage cadet achievements and awards</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} style={{ marginRight: 6 }} />Add Achievement</button>
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

      {/* Search + Filter */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input className="search-input" placeholder="Search cadet, achievement..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={lvlFilter} onChange={e => setLvlFilter(e.target.value)}>
            <option value="All">All Levels</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr><th>Cadet</th><th>Roll No</th><th>Achievement</th><th>Category</th><th>Level</th><th>Date</th><th>Certificate</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">No achievements found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.cadetName}</td>
                  <td><span className="cadet-id-badge">{a.rollNo}</span></td>
                  <td>{a.title}</td>
                  <td><span className="badge" style={CAT_COLORS[a.category] || CAT_COLORS.Other}>{a.category}</span></td>
                  <td><span className="badge" style={LEVEL_COLORS[a.level] || LEVEL_COLORS.Unit}>{a.level}</span></td>
                  <td>{a.date}</td>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>{a.certificateNo || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn icon-btn-blue" onClick={() => setViewItem(a)} title="View">👁</button>
                      <button className="icon-btn icon-btn-green" onClick={() => openEdit(a)}><Pencil size={15} /></button>
                      <button className="icon-btn icon-btn-red" onClick={() => del(a.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {achievements.length} achievements</div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "✏️ Edit Achievement" : "🏆 Add Achievement"}</h2>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Select Cadet *</label>
                    <select className="form-input" value={form.rollNo} onChange={handleCadetChange}>
                      <option value="">Select Cadet</option>
                      {cadets.map(c => <option key={c.rollNo} value={c.rollNo}>{c.name} — {c.rollNo}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Achievement Title *</label>
                    <input className="form-input" placeholder="e.g. Best Cadet Award" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Level</label>
                    <select className="form-input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Certificate No.</label>
                    <input className="form-input" placeholder="e.g. CERT001" value={form.certificateNo} onChange={e => setForm(f => ({ ...f, certificateNo: e.target.value }))} />
                  </div>
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} placeholder="Describe the achievement..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update" : "Save Achievement"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
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
                {[
                  ["Cadet", viewItem.cadetName],
                  ["Roll No", viewItem.rollNo],
                  ["Date", viewItem.date],
                  ["Certificate No", viewItem.certificateNo || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="profile-field">
                    <div className="profile-field-label">{label}</div>
                    <div className="profile-field-value">{value}</div>
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
