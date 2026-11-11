import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Pencil, X, Save, User } from "lucide-react";

const RANKS = ["Cadet", "Lance Corporal", "Corporal", "Sergeant", "Under Officer", "Senior Under Officer"];
const WINGS  = ["Army Wing", "Navy Wing", "Air Wing"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function CadetProfile() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(`nccProfile_${user?.id}`);
    return saved ? JSON.parse(saved) : {
      name: user?.name || "",
      rank: user?.rank || "",
      wing: user?.wing || "",
      unit: user?.unit || "",
      institution: user?.institution || "",
      enrollmentDate: user?.enrollmentDate || "",
      dob: "",
      phone: "",
      email: "",
      address: "",
      bloodGroup: "",
      emergencyContact: "",
      hobbies: "",
    };
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(profile);
  const [saved, setSaved]     = useState(false);

  const saveProfile = (e) => {
    e.preventDefault();
    setProfile(form);
    localStorage.setItem(`nccProfile_${user?.id}`, JSON.stringify(form));
    // Also sync back to nccCadets so officer sees updated info
    const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
    const updated = cadets.map(c => c.cadetId === user?.cadetId ? { ...c, ...form } : c);
    localStorage.setItem("nccCadets", JSON.stringify(updated));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fields = [
    { label: "Full Name",          key: "name",             type: "text",   placeholder: "Your full name" },
    { label: "Rank",               key: "rank",             type: "select", options: RANKS },
    { label: "Wing",               key: "wing",             type: "select", options: WINGS },
    { label: "Unit",               key: "unit",             type: "text",   placeholder: "e.g. 1 Karnataka Battalion" },
    { label: "Institution",        key: "institution",      type: "text",   placeholder: "College / School name" },
    { label: "Date of Birth",      key: "dob",              type: "date" },
    { label: "Enrollment Date",    key: "enrollmentDate",   type: "date" },
    { label: "Blood Group",        key: "bloodGroup",       type: "select", options: BLOOD_GROUPS },
    { label: "Phone",              key: "phone",            type: "text",   placeholder: "10-digit mobile number" },
    { label: "Email",              key: "email",            type: "email",  placeholder: "your@email.com" },
    { label: "Emergency Contact",  key: "emergencyContact", type: "text",   placeholder: "Name & phone" },
    { label: "Address",            key: "address",          type: "text",   placeholder: "Residential address" },
    { label: "Hobbies / Interests",key: "hobbies",          type: "text",   placeholder: "e.g. Photography, Trekking" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Your NCC cadet information</p>
        </div>
        {!editing && (
          <button className="btn-primary" onClick={() => { setForm(profile); setEditing(true); }}>
            <Pencil size={15} style={{ marginRight: 6 }} />Edit Profile
          </button>
        )}
      </div>

      {saved && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
          ✅ Profile saved successfully.
        </div>
      )}

      {/* Profile header card */}
      <div className="card">
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div className="profile-avatar-lg" style={{ background: "#174675" }}>
            {profile.name?.charAt(0) || <User size={28} />}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 4px", color: "#111827", fontSize: 20 }}>{profile.name}</h2>
            <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: 14 }}>{profile.rank} · {profile.wing}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="cadet-id-badge">Cadet ID: {user?.cadetId}</span>
              {profile.bloodGroup && <span className="badge badge-red">{profile.bloodGroup}</span>}
              {profile.unit && <span className="badge badge-blue">{profile.unit}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* View mode */}
      {!editing && (
        <div className="card">
          <h3 className="card-title">📋 Personal Details</h3>
          <div className="profile-grid">
            {fields.map(f => (
              <div key={f.key} className="profile-field">
                <div className="profile-field-label">{f.label}</div>
                <div className="profile-field-value">{profile[f.key] || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="card-title" style={{ margin: 0 }}>✏️ Edit Profile</h3>
            <button className="icon-btn icon-btn-red" onClick={() => setEditing(false)}><X size={16} /></button>
          </div>
          <form onSubmit={saveProfile}>
            <div className="form-grid">
              {fields.map(f => (
                <div key={f.key} className="form-field">
                  <label className="form-label">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="form-input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      <option value="">Select</option>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn-primary"><Save size={15} style={{ marginRight: 6 }} />Save Profile</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
