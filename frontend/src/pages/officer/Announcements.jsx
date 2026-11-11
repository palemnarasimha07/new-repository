import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, Megaphone, Pin } from "lucide-react";

const PRIORITIES = ["Normal", "Important", "Urgent"];
const AUDIENCES  = ["All Cadets", "Army Wing", "Navy Wing", "Air Wing", "Officers Only"];

const PRIORITY_COLORS = {
  Normal:    { background: "#f3f4f6", color: "#374151" },
  Important: { background: "#ffedd5", color: "#9a3412" },
  Urgent:    { background: "#fee2e2", color: "#991b1b" },
};

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: "Annual Training Camp Registration Open", body: "All cadets are required to register for the Annual Training Camp by 15th September. Contact your unit officer for details.", priority: "Important", audience: "All Cadets", date: "2025-08-20", pinned: true },
  { id: 2, title: "Republic Day Parade Selection",          body: "Selection trials for Republic Day Parade will be held on 5th September at the Parade Ground. All interested cadets must report by 0600 hrs.", priority: "Urgent",    audience: "All Cadets", date: "2025-08-18", pinned: true },
  { id: 3, title: "Uniform Inspection Notice",              body: "A uniform inspection will be conducted during the next parade. Ensure all uniforms are clean and properly pressed.", priority: "Normal",    audience: "All Cadets", date: "2025-08-15", pinned: false },
];

const EMPTY_FORM = { title: "", body: "", priority: "Normal", audience: "All Cadets", date: new Date().toISOString().split("T")[0], pinned: false };

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(() => {
    const s = localStorage.getItem("nccAnnouncements");
    return s ? JSON.parse(s) : DEFAULT_ANNOUNCEMENTS;
  });

  const [search, setSearch]       = useState("");
  const [priFilter, setPriFilter] = useState("All");
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { localStorage.setItem("nccAnnouncements", JSON.stringify(announcements)); }, [announcements]);

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return new Date(b.date) - new Date(a.date);
  });

  const filtered = sorted.filter(a => {
    const q = search.toLowerCase();
    const matchQ = `${a.title} ${a.body} ${a.audience}`.toLowerCase().includes(q);
    const matchP = priFilter === "All" || a.priority === priFilter;
    return matchQ && matchP;
  });

  const openAdd  = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ title: a.title, body: a.body, priority: a.priority, audience: a.audience, date: a.date, pinned: a.pinned }); setEditingId(a.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const save = (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;
    if (editingId) {
      setAnnouncements(announcements.map(a => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setAnnouncements([...announcements, { id: Date.now(), ...form }]);
    }
    closeForm();
  };

  const del    = (id) => { if (window.confirm("Delete this announcement?")) setAnnouncements(announcements.filter(a => a.id !== id)); };
  const toggle = (id) => setAnnouncements(announcements.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));

  const stats = [
    { label: "Total",     value: announcements.length,                                       color: "#174675", bg: "#e3f0ff" },
    { label: "Pinned",    value: announcements.filter(a => a.pinned).length,                 color: "#1e40af", bg: "#dbeafe" },
    { label: "Urgent",    value: announcements.filter(a => a.priority === "Urgent").length,   color: "#991b1b", bg: "#fee2e2" },
    { label: "Important", value: announcements.filter(a => a.priority === "Important").length,color: "#9a3412", bg: "#ffedd5" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-sub">Publish and manage announcements for cadets</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} style={{ marginRight: 6 }} />New Announcement</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Megaphone size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input className="search-input" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={priFilter} onChange={e => setPriFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Announcement Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No announcements found.</div>
        ) : filtered.map(a => (
          <div key={a.id} className="card" style={{ borderLeft: `4px solid ${a.priority === "Urgent" ? "#ef4444" : a.priority === "Important" ? "#f97316" : "#d1d5db"}`, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {a.pinned && <Pin size={14} color="#174675" />}
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{a.title}</span>
                  <span className="badge" style={PRIORITY_COLORS[a.priority]}>{a.priority}</span>
                  <span className="badge badge-blue">{a.audience}</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.6 }}>{a.body}</p>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>📅 {a.date}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button className="icon-btn" style={{ background: a.pinned ? "#dbeafe" : "#f3f4f6", color: a.pinned ? "#1d4ed8" : "#6b7280" }} onClick={() => toggle(a.id)} title={a.pinned ? "Unpin" : "Pin"}><Pin size={15} /></button>
                <button className="icon-btn icon-btn-blue" onClick={() => setViewItem(a)} title="View">👁</button>
                <button className="icon-btn icon-btn-green" onClick={() => openEdit(a)}><Pencil size={15} /></button>
                <button className="icon-btn icon-btn-red" onClick={() => del(a.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "✏️ Edit Announcement" : "📢 New Announcement"}</h2>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Title *</label>
                    <input className="form-input" placeholder="Announcement title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Audience</label>
                    <select className="form-input" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                      {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-field" style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
                    <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    <label htmlFor="pinned" className="form-label" style={{ margin: 0 }}>Pin this announcement</label>
                  </div>
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Message *</label>
                    <textarea className="form-input" rows={4} placeholder="Write the announcement message..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update" : "Publish"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">📢 Announcement</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <span className="badge" style={PRIORITY_COLORS[viewItem.priority]}>{viewItem.priority}</span>
                <span className="badge badge-blue">{viewItem.audience}</span>
                {viewItem.pinned && <span className="badge badge-blue">📌 Pinned</span>}
              </div>
              <h3 style={{ color: "#111827", margin: "0 0 12px", fontSize: 17 }}>{viewItem.title}</h3>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 16px" }}>{viewItem.body}</p>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>Published: {viewItem.date}</p>
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
