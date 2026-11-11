import { useState, useEffect } from "react";
import { Users, Plus, Search, Eye, Pencil, Trash2, X, ChevronDown, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",   cadetId: "NCC001", rank: "Lance Corporal", wing: "Army Wing",  unit: "Unit A", year: "3rd Year", phone: "9876543210", email: "rahul@example.com",  attendance: 92, gender: "Male",   bloodGroup: "B+", institution: "GCE Bangalore" },
  { id: 2, name: "Priya Sharma",  cadetId: "NCC002", rank: "Cadet",          wing: "Naval Wing", unit: "Unit A", year: "2nd Year", phone: "9876543211", email: "priya@example.com",  attendance: 88, gender: "Female", bloodGroup: "O+", institution: "GCE Bangalore" },
  { id: 3, name: "Arjun Reddy",   cadetId: "NCC003", rank: "Corporal",       wing: "Army Wing",  unit: "Unit B", year: "3rd Year", phone: "9876543212", email: "arjun@example.com",  attendance: 95, gender: "Male",   bloodGroup: "A+", institution: "BMS College" },
  { id: 4, name: "Sneha Rao",     cadetId: "NCC004", rank: "Cadet",          wing: "Air Wing",   unit: "Unit B", year: "1st Year", phone: "9876543213", email: "sneha@example.com",  attendance: 72, gender: "Female", bloodGroup: "AB+","institution": "BMS College" },
  { id: 5, name: "Vikram Singh",  cadetId: "NCC005", rank: "Sergeant",       wing: "Army Wing",  unit: "Unit A", year: "3rd Year", phone: "9876543214", email: "vikram@example.com", attendance: 90, gender: "Male",   bloodGroup: "O-", institution: "GCE Bangalore" },
];

const EMPTY_FORM = {
  name: "", cadetId: "", rank: "Cadet", wing: "Army Wing",
  unit: "", year: "", phone: "", email: "",
  attendance: "", gender: "Male", bloodGroup: "O+", institution: "",
};

const WINGS  = ["Army Wing", "Naval Wing", "Air Wing"];
const RANKS  = ["Cadet", "Lance Corporal", "Corporal", "Sergeant", "Under Officer", "Senior Under Officer"];
const BLOODS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function CadetManagement() {
  const [cadets, setCadets] = useState(() => {
    const s = localStorage.getItem("nccCadets");
    return s ? JSON.parse(s) : DEFAULT_CADETS;
  });
  const [search, setSearch]       = useState("");
  const [wingFilter, setWingFilter] = useState("All");
  const [showForm, setShowForm]   = useState(false);
  const [viewCadet, setViewCadet] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    localStorage.setItem("nccCadets", JSON.stringify(cadets));
  }, [cadets]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total    = cadets.length;
  const avgAtt   = total ? Math.round(cadets.reduce((s, c) => s + Number(c.attendance), 0) / total) : 0;
  const lowAtt   = cadets.filter(c => Number(c.attendance) < 75).length;
  const armyCadets  = cadets.filter(c => c.wing === "Army Wing").length;
  const navalCadets = cadets.filter(c => c.wing === "Naval Wing").length;
  const airCadets   = cadets.filter(c => c.wing === "Air Wing").length;

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = cadets.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.cadetId.toLowerCase().includes(q) ||
      c.unit.toLowerCase().includes(q) ||
      c.rank.toLowerCase().includes(q);
    const matchWing = wingFilter === "All" || c.wing === wingFilter;
    return matchSearch && matchWing;
  });

  // ── Form handlers ──────────────────────────────────────────────────────────
  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(""); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ name: c.name, cadetId: c.cadetId, rank: c.rank, wing: c.wing, unit: c.unit,
      year: c.year, phone: c.phone, email: c.email, attendance: c.attendance,
      gender: c.gender, bloodGroup: c.bloodGroup, institution: c.institution });
    setEditingId(c.id); setFormError(""); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setFormError(""); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const saveCadet = e => {
    e.preventDefault();
    if (!form.name || !form.cadetId || !form.unit || !form.phone || !form.email) {
      setFormError("Please fill all required fields."); return;
    }
    const att = Math.min(100, Math.max(0, Number(form.attendance) || 0));
    if (editingId) {
      setCadets(cadets.map(c => c.id === editingId ? { ...c, ...form, attendance: att } : c));
    } else {
      setCadets([...cadets, { id: Date.now(), ...form, attendance: att }]);
    }
    closeForm();
  };

  const { resetCadetPassword } = useAuth();

  const handleResetPassword = (c) => {
    if (window.confirm(`Reset password for Cadet ${c.name} (${c.cadetId})? Temporary password will be set to phone number: ${c.phone}.`)) {
      resetCadetPassword(c.id);
      const updated = cadets.map(cad => cad.id === c.id ? { ...cad, password: cad.phone, mustChangePassword: true } : cad);
      setCadets(updated);
      alert(`🔑 Password reset for ${c.name}. Temporary password is: ${c.phone}. Cadet must change password on next login.`);
    }
  };

  const deleteCadet = id => {
    if (window.confirm("Delete this cadet?")) setCadets(cadets.filter(c => c.id !== id));
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cadet Management</h1>
          <p className="page-sub">Manage all NCC cadet records</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} style={{ marginRight: 6 }} />Add Cadet
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total Cadets",    value: total,       color: "#174675", bg: "#e3f0ff" },
          { label: "Army Wing",       value: armyCadets,  color: "#2e7d32", bg: "#e8f5e9" },
          { label: "Naval Wing",      value: navalCadets, color: "#1565c0", bg: "#e3f2fd" },
          { label: "Air Wing",        value: airCadets,   color: "#6a1b9a", bg: "#f3e5f5" },
          { label: "Avg Attendance",  value: `${avgAtt}%`,color: "#ef6c00", bg: "#fff3e0" },
          { label: "Low Attendance",  value: lowAtt,      color: "#c62828", bg: "#ffebee" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <Users size={20} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              className="search-input"
              placeholder="Search by name, ID, unit, rank..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={wingFilter} onChange={e => setWingFilter(e.target.value)}>
            <option value="All">All Wings</option>
            {WINGS.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cadet</th><th>Cadet ID</th><th>Wing</th>
                <th>Rank</th><th>Unit</th><th>Phone</th>
                <th>Attendance</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">No cadets found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="table-avatar">{c.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{c.institution}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{c.cadetId}</span></td>
                  <td>
                    <span className={`badge ${c.wing === "Army Wing" ? "badge-green" : c.wing === "Naval Wing" ? "badge-blue" : "badge-purple"}`}>
                      {c.wing}
                    </span>
                  </td>
                  <td>{c.rank}</td>
                  <td>{c.unit}</td>
                  <td>{c.phone}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="mini-progress">
                        <div className="mini-progress-fill" style={{ width: `${c.attendance}%`, background: c.attendance >= 75 ? "#22c55e" : "#ef4444" }} />
                      </div>
                      <span style={{ fontWeight: 700, color: c.attendance >= 75 ? "#16a34a" : "#dc2626", fontSize: 13 }}>
                        {c.attendance}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn icon-btn-blue"  onClick={() => setViewCadet(c)} title="View Cadet Profile"><Eye size={15} /></button>
                      <button className="icon-btn icon-btn-green" onClick={() => openEdit(c)} title="Edit Cadet"><Pencil size={15} /></button>
                      <button className="icon-btn" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5" }} onClick={() => handleResetPassword(c)} title="Reset Cadet Password"><KeyRound size={15} /></button>
                      <button className="icon-btn icon-btn-red"   onClick={() => deleteCadet(c.id)} title="Delete Cadet"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing {filtered.length} of {total} cadets
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "✏️ Edit Cadet" : "➕ Add New Cadet"}</h2>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
            </div>
            <form onSubmit={saveCadet}>
              <div className="modal-body">
                {formError && <div className="login-error" style={{ marginBottom: 16 }}>⚠️ {formError}</div>}
                <div className="form-grid">
                  <Field label="Full Name *"     name="name"        value={form.name}        onChange={handleChange} placeholder="Cadet full name" />
                  <Field label="Cadet ID *"      name="cadetId"     value={form.cadetId}     onChange={handleChange} placeholder="e.g. NCC006" />
                  <Field label="Institution *"   name="institution" value={form.institution} onChange={handleChange} placeholder="College/School name" />
                  <Field label="Unit *"          name="unit"        value={form.unit}        onChange={handleChange} placeholder="e.g. Unit A" />
                  <Field label="Year"            name="year"        value={form.year}        onChange={handleChange} placeholder="e.g. 2nd Year" />
                  <Field label="Phone *"         name="phone"       value={form.phone}       onChange={handleChange} placeholder="10-digit number" />
                  <Field label="Email *"         name="email"       value={form.email}       onChange={handleChange} placeholder="email@example.com" type="email" />
                  <Field label="Attendance %"    name="attendance"  value={form.attendance}  onChange={handleChange} placeholder="0-100" type="number" />
                  <SelectField label="Wing"       name="wing"       value={form.wing}       onChange={handleChange} options={WINGS} />
                  <SelectField label="Rank"       name="rank"       value={form.rank}       onChange={handleChange} options={RANKS} />
                  <SelectField label="Gender"     name="gender"     value={form.gender}     onChange={handleChange} options={["Male", "Female", "Other"]} />
                  <SelectField label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} options={BLOODS} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update Cadet" : "Save Cadet"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewCadet && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">👨‍✈️ Cadet Profile</h2>
              <button className="modal-close" onClick={() => setViewCadet(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div className="profile-avatar-lg" style={{ margin: "0 auto 10px" }}>{viewCadet.name.charAt(0)}</div>
                <h3 style={{ color: "#174675", margin: 0 }}>{viewCadet.name}</h3>
                <p style={{ color: "#6b7280", margin: "4px 0" }}>{viewCadet.rank} · {viewCadet.wing}</p>
                <span className="badge badge-blue">{viewCadet.cadetId}</span>
              </div>
              <div className="profile-grid">
                {[
                  ["Unit", viewCadet.unit], ["Institution", viewCadet.institution],
                  ["Year", viewCadet.year], ["Gender", viewCadet.gender],
                  ["Blood Group", viewCadet.bloodGroup], ["Phone", viewCadet.phone],
                  ["Email", viewCadet.email],
                  ["Attendance", `${viewCadet.attendance}% ${viewCadet.attendance >= 75 ? "✅" : "⚠️"}`],
                ].map(([l, v]) => (
                  <div key={l} className="profile-field">
                    <div className="profile-field-label">{l}</div>
                    <div className="profile-field-value">{v || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setViewCadet(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <select className="form-input" name={name} value={value} onChange={onChange}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
