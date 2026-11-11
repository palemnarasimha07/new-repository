import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, Tent, Users } from "lucide-react";

const CAMP_TYPES = ["ATC", "CATC", "NIC", "RDC", "TSC", "VSC", "BLC", "Other"];
const STATUSES   = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const WINGS      = ["Army", "Navy", "Air"];

const STATUS_COLORS = {
  Upcoming:  { background: "#dbeafe", color: "#1e40af" },
  Ongoing:   { background: "#ffedd5", color: "#9a3412" },
  Completed: { background: "#dcfce7", color: "#166534" },
  Cancelled: { background: "#fee2e2", color: "#991b1b" },
};

const TYPE_DESC = {
  ATC:   "Annual Training Camp",
  CATC:  "Combined Annual Training Camp",
  NIC:   "National Integration Camp",
  RDC:   "Republic Day Camp",
  TSC:   "Thal Sainik Camp",
  VSC:   "Vayu Sainik Camp",
  BLC:   "Basic Leadership Camp",
  Other: "Other Camp",
};

const DEFAULT_CAMPS = [
  { id: 1, name: "Annual Training Camp 2025", type: "ATC",  location: "Dehradun",    startDate: "2025-10-01", endDate: "2025-10-14", status: "Upcoming",  wing: "Army", strength: 50, participants: ["NCC001", "NCC002", "NCC003"], remarks: "Mandatory for all senior cadets." },
  { id: 2, name: "Republic Day Camp 2026",    type: "RDC",  location: "New Delhi",   startDate: "2026-01-10", endDate: "2026-01-26", status: "Upcoming",  wing: "Army", strength: 10, participants: ["NCC003"],                    remarks: "Selection based on merit." },
  { id: 3, name: "CATC Summer 2025",          type: "CATC", location: "Pune",        startDate: "2025-06-01", endDate: "2025-06-10", status: "Completed", wing: "Navy", strength: 30, participants: ["NCC002", "NCC004"],          remarks: "Completed successfully." },
];

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",  rollNo: "NCC001" },
  { id: 2, name: "Priya Sharma", rollNo: "NCC002" },
  { id: 3, name: "Arjun Reddy",  rollNo: "NCC003" },
  { id: 4, name: "Sneha Rao",    rollNo: "NCC004" },
  { id: 5, name: "Vikram Singh", rollNo: "NCC005" },
];

const EMPTY_FORM = { name: "", type: "ATC", location: "", startDate: "", endDate: "", status: "Upcoming", wing: "Army", strength: "", remarks: "" };

export default function CampManagement() {
  const [camps, setCamps] = useState(() => {
    const s = localStorage.getItem("nccCamps");
    return s ? JSON.parse(s) : DEFAULT_CAMPS;
  });
  const [cadets] = useState(() => {
    const s = localStorage.getItem("nccCadets");
    return s ? JSON.parse(s) : DEFAULT_CADETS;
  });

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [typeFilter, setType]       = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [viewCamp, setViewCamp]     = useState(null);
  const [partModal, setPartModal]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [tempParts, setTempParts]   = useState([]);

  useEffect(() => { localStorage.setItem("nccCamps", JSON.stringify(camps)); }, [camps]);

  const filtered = camps.filter(c => {
    const q = search.toLowerCase();
    const matchQ = `${c.name} ${c.type} ${c.location} ${c.wing}`.toLowerCase().includes(q);
    const matchS = statusFilter === "All" || c.status === statusFilter;
    const matchT = typeFilter === "All" || c.type === typeFilter;
    return matchQ && matchS && matchT;
  });

  const openAdd  = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ name: c.name, type: c.type, location: c.location, startDate: c.startDate, endDate: c.endDate, status: c.status, wing: c.wing, strength: c.strength, remarks: c.remarks }); setEditingId(c.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const save = (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.startDate || !form.endDate) return;
    if (editingId) {
      setCamps(camps.map(c => c.id === editingId ? { ...c, ...form } : c));
    } else {
      setCamps([...camps, { id: Date.now(), ...form, participants: [] }]);
    }
    closeForm();
  };

  const del = (id) => { if (window.confirm("Delete this camp?")) setCamps(camps.filter(c => c.id !== id)); };

  const openPart = (c) => { setPartModal(c); setTempParts([...c.participants]); };
  const savePart = () => {
    setCamps(camps.map(c => c.id === partModal.id ? { ...c, participants: tempParts } : c));
    setPartModal(null);
  };
  const togglePart = (rollNo) => {
    setTempParts(p => p.includes(rollNo) ? p.filter(r => r !== rollNo) : [...p, rollNo]);
  };

  const stats = [
    { label: "Total Camps",  value: camps.length,                                        color: "#174675", bg: "#e3f0ff" },
    { label: "Upcoming",     value: camps.filter(c => c.status === "Upcoming").length,   color: "#1e40af", bg: "#dbeafe" },
    { label: "Ongoing",      value: camps.filter(c => c.status === "Ongoing").length,    color: "#9a3412", bg: "#ffedd5" },
    { label: "Completed",    value: camps.filter(c => c.status === "Completed").length,  color: "#166534", bg: "#dcfce7" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Camp Management</h1>
          <p className="page-sub">Manage NCC camps, participants and schedules</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} style={{ marginRight: 6 }} />Add Camp</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Tent size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input className="search-input" placeholder="Search camps..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="All">All Types</option>
            {CAMP_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr><th>Camp Name</th><th>Type</th><th>Location</th><th>Dates</th><th>Wing</th><th>Strength</th><th>Participants</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="table-empty">No camps found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <span className="badge badge-blue" title={TYPE_DESC[c.type]}>{c.type}</span>
                  </td>
                  <td>{c.location}</td>
                  <td style={{ fontSize: 12, color: "#6b7280" }}>{c.startDate}<br />{c.endDate}</td>
                  <td>{c.wing}</td>
                  <td style={{ textAlign: "center" }}>{c.strength || "—"}</td>
                  <td>
                    <button className="icon-btn icon-btn-blue" onClick={() => openPart(c)} title="Manage Participants" style={{ width: "auto", padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, gap: 4, display: "flex", alignItems: "center" }}>
                      <Users size={13} /> {c.participants.length}
                    </button>
                  </td>
                  <td><span className="badge" style={STATUS_COLORS[c.status]}>{c.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn icon-btn-blue" onClick={() => setViewCamp(c)} title="View">👁</button>
                      <button className="icon-btn icon-btn-green" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                      <button className="icon-btn icon-btn-red" onClick={() => del(c.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {camps.length} camps</div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "✏️ Edit Camp" : "⛺ Add Camp"}</h2>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Camp Name *</label>
                    <input className="form-input" placeholder="e.g. Annual Training Camp 2025" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Camp Type</label>
                    <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {CAMP_TYPES.map(t => <option key={t} value={t}>{t} — {TYPE_DESC[t]}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Wing</label>
                    <select className="form-input" value={form.wing} onChange={e => setForm(f => ({ ...f, wing: e.target.value }))}>
                      {WINGS.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Location *</label>
                    <input className="form-input" placeholder="e.g. Dehradun" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Authorised Strength</label>
                    <input className="form-input" type="number" placeholder="e.g. 50" value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Start Date *</label>
                    <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">End Date *</label>
                    <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Remarks</label>
                    <textarea className="form-input" rows={2} placeholder="Any additional notes..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update" : "Save Camp"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {partModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">👥 Participants — {partModal.name}</h2>
              <button className="modal-close" onClick={() => setPartModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Select cadets participating in this camp.</p>
              <table className="data-table">
                <thead><tr><th>Cadet</th><th>Roll No</th><th>Selected</th></tr></thead>
                <tbody>
                  {cadets.map(c => (
                    <tr key={c.rollNo}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.rollNo}</td>
                      <td>
                        <input type="checkbox" checked={tempParts.includes(c.rollNo)} onChange={() => togglePart(c.rollNo)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>{tempParts.length} cadet(s) selected</div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setPartModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={savePart}>Save Participants</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewCamp && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">⛺ Camp Details</h2>
              <button className="modal-close" onClick={() => setViewCamp(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <span className="badge badge-blue">{viewCamp.type} — {TYPE_DESC[viewCamp.type]}</span>
                <span className="badge" style={STATUS_COLORS[viewCamp.status]}>{viewCamp.status}</span>
              </div>
              <h3 style={{ color: "#174675", margin: "0 0 16px", fontSize: 17 }}>{viewCamp.name}</h3>
              <div className="profile-grid">
                {[
                  ["Location", viewCamp.location],
                  ["Wing", viewCamp.wing],
                  ["Start Date", viewCamp.startDate],
                  ["End Date", viewCamp.endDate],
                  ["Authorised Strength", viewCamp.strength || "—"],
                  ["Participants", viewCamp.participants.length],
                ].map(([label, value]) => (
                  <div key={label} className="profile-field">
                    <div className="profile-field-label">{label}</div>
                    <div className="profile-field-value">{value}</div>
                  </div>
                ))}
              </div>
              {viewCamp.remarks && (
                <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 8, padding: 14, fontSize: 14, color: "#374151" }}>
                  <b>Remarks:</b> {viewCamp.remarks}
                </div>
              )}
              {viewCamp.participants.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Participants:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {viewCamp.participants.map(r => {
                      const c = cadets.find(c => c.rollNo === r);
                      return <span key={r} className="cadet-id-badge">{c ? c.name : r}</span>;
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setViewCamp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
