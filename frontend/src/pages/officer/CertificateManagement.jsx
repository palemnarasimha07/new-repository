import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, Award, Printer, QrCode, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const CERT_TYPES = ["A Certificate", "B Certificate", "C Certificate", "Camp Certificate", "Achievement Certificate", "Participation Certificate"];
const STATUSES   = ["Issued", "Pending", "Revoked"];

const STATUS_COLORS = {
  Issued:  { background: "#dcfce7", color: "#166534" },
  Pending: { background: "#ffedd5", color: "#9a3412" },
  Revoked: { background: "#fee2e2", color: "#991b1b" },
};

const TYPE_DESC = {
  "A Certificate": "Basic NCC Certificate",
  "B Certificate": "Intermediate NCC Certificate",
  "C Certificate": "Advanced NCC Certificate",
  "Camp Certificate": "Issued for camp participation",
  "Achievement Certificate": "Issued for achievements/awards",
  "Participation Certificate": "Issued for event participation",
};

const DEFAULT_CERTS = [
  { id: 1, cadetName: "Rahul Kumar",  rollNo: "NCC001", type: "B Certificate",            certNo: "NCC/CERT/2025/001", issueDate: "2025-08-15", status: "Issued",  remarks: "Passed with distinction." },
  { id: 2, cadetName: "Priya Sharma", rollNo: "NCC002", type: "Camp Certificate",          certNo: "NCC/CERT/2025/002", issueDate: "2025-07-10", status: "Issued",  remarks: "CATC Summer 2025." },
  { id: 3, cadetName: "Arjun Reddy",  rollNo: "NCC003", type: "Achievement Certificate",   certNo: "NCC/CERT/2025/003", issueDate: "2025-06-20", status: "Issued",  remarks: "State level sports." },
  { id: 4, cadetName: "Sneha Rao",    rollNo: "NCC004", type: "A Certificate",             certNo: "NCC/CERT/2025/004", issueDate: "",           status: "Pending", remarks: "Exam pending." },
];

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",  rollNo: "NCC001" },
  { id: 2, name: "Priya Sharma", rollNo: "NCC002" },
  { id: 3, name: "Arjun Reddy",  rollNo: "NCC003" },
  { id: 4, name: "Sneha Rao",    rollNo: "NCC004" },
  { id: 5, name: "Vikram Singh", rollNo: "NCC005" },
];

const EMPTY_FORM = { cadetName: "", rollNo: "", type: "B Certificate", certNo: "", issueDate: "", status: "Issued", remarks: "" };

function genCertNo(existing) {
  const year = new Date().getFullYear();
  const next = existing.length + 1;
  return `NCC/CERT/${year}/${String(next).padStart(3, "0")}`;
}

export default function CertificateManagement() {
  const [certs, setCerts] = useState(() => {
    const s = localStorage.getItem("nccCertificates");
    return s ? JSON.parse(s) : DEFAULT_CERTS;
  });
  const [cadets] = useState(() => {
    const s = localStorage.getItem("nccCadets");
    return s ? JSON.parse(s) : DEFAULT_CADETS;
  });

  const [search, setSearch]       = useState("");
  const [typeFilter, setType]     = useState("All");
  const [statusFilter, setStatus] = useState("All");
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem]   = useState(null);
  const [qrItem, setQrItem]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { localStorage.setItem("nccCertificates", JSON.stringify(certs)); }, [certs]);

  const filtered = certs.filter(c => {
    const q = search.toLowerCase();
    const matchQ = `${c.cadetName} ${c.rollNo} ${c.certNo} ${c.type}`.toLowerCase().includes(q);
    const matchT = typeFilter === "All" || c.type === typeFilter;
    const matchS = statusFilter === "All" || c.status === statusFilter;
    return matchQ && matchT && matchS;
  });

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, certNo: genCertNo(certs) });
    setEditingId(null); setShowForm(true);
  };
  const openEdit = (c) => {
    setForm({ cadetName: c.cadetName, rollNo: c.rollNo, type: c.type, certNo: c.certNo, issueDate: c.issueDate, status: c.status, remarks: c.remarks });
    setEditingId(c.id); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleCadetChange = (e) => {
    const c = cadets.find(c => c.rollNo === e.target.value);
    setForm(f => ({ ...f, cadetName: c ? c.name : "", rollNo: c ? c.rollNo : "" }));
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.cadetName || !form.certNo) return;
    if (editingId) {
      setCerts(certs.map(c => c.id === editingId ? { ...c, ...form } : c));
    } else {
      setCerts([...certs, { id: Date.now(), ...form }]);
    }
    closeForm();
  };

  const del    = (id) => { if (window.confirm("Delete this certificate?")) setCerts(certs.filter(c => c.id !== id)); };
  const revoke = (id) => { if (window.confirm("Revoke this certificate?")) setCerts(certs.map(c => c.id === id ? { ...c, status: "Revoked" } : c)); };

  const printCert = (c) => {
    const win = window.open("", "_blank", "width=700,height=500");
    win.document.write(`
      <html><head><title>Certificate — ${c.certNo}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: white; }
        .cert { border: 8px double #174675; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto; }
        .emblem { font-size: 60px; margin-bottom: 8px; }
        .org { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
        .title { font-size: 28px; font-weight: 800; color: #174675; margin: 16px 0 8px; }
        .sub { font-size: 14px; color: #374151; margin-bottom: 24px; }
        .name { font-size: 24px; font-weight: 700; color: #111827; border-bottom: 2px solid #174675; display: inline-block; padding-bottom: 4px; margin-bottom: 16px; }
        .details { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
        .certno { font-size: 12px; color: #9ca3af; font-family: monospace; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
        .sig { border-top: 1px solid #374151; padding-top: 6px; width: 140px; text-align: center; }
      </style></head><body>
      <div class="cert">
        <div class="emblem">🇮🇳</div>
        <div class="org">National Cadet Corps</div>
        <div class="org">NCC Digital Cadet System</div>
        <div class="title">${c.type}</div>
        <div class="sub">This is to certify that</div>
        <div class="name">${c.cadetName}</div>
        <div class="details">Cadet ID: ${c.rollNo} &nbsp;|&nbsp; Issue Date: ${c.issueDate || '—'}</div>
        ${c.remarks ? `<div class="sub" style="font-style:italic">“${c.remarks}”</div>` : ''}
        <div class="certno">Certificate No: ${c.certNo}</div>
        <div class="footer">
          <div class="sig">Commanding Officer</div>
          <div class="sig">Date: ${c.issueDate || new Date().toLocaleDateString()}</div>
        </div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const stats = [
    { label: "Total",   value: certs.length,                                      color: "#174675", bg: "#e3f0ff" },
    { label: "Issued",  value: certs.filter(c => c.status === "Issued").length,   color: "#166534", bg: "#dcfce7" },
    { label: "Pending", value: certs.filter(c => c.status === "Pending").length,  color: "#9a3412", bg: "#ffedd5" },
    { label: "Revoked", value: certs.filter(c => c.status === "Revoked").length,  color: "#991b1b", bg: "#fee2e2" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Management</h1>
          <p className="page-sub">Issue and manage NCC certificates for cadets</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} style={{ marginRight: 6 }} />Issue Certificate</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Award size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input className="search-input" placeholder="Search cadet, cert number..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="All">All Types</option>
            {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
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
              <tr><th>Cadet</th><th>Roll No</th><th>Certificate Type</th><th>Cert Number</th><th>Issue Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">No certificates found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.cadetName}</td>
                  <td><span className="cadet-id-badge">{c.rollNo}</span></td>
                  <td><span className="badge badge-blue">{c.type}</span></td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{c.certNo}</td>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>{c.issueDate || "—"}</td>
                  <td><span className="badge" style={STATUS_COLORS[c.status]}>{c.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn icon-btn-blue" onClick={() => setViewItem(c)} title="View">👁</button>
                      {c.status === "Issued" && (
                        <button className="icon-btn" style={{ background: "#e0f2fe", color: "#0369a1" }} onClick={() => setQrItem(c)} title="QR Verification"><QrCode size={15} /></button>
                      )}
                      <button className="icon-btn icon-btn-green" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                      {c.status === "Issued" && (
                        <button className="icon-btn" style={{ background: "#f3e8ff", color: "#6b21a8" }} onClick={() => printCert(c)} title="Print Certificate"><Printer size={15} /></button>
                      )}
                      {c.status === "Issued" && (
                        <button className="icon-btn" style={{ background: "#ffedd5", color: "#9a3412" }} onClick={() => revoke(c.id)} title="Revoke">🚫</button>
                      )}
                      <button className="icon-btn icon-btn-red" onClick={() => del(c.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {certs.length} certificates</div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "✏️ Edit Certificate" : "🏅 Issue Certificate"}</h2>
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
                    <label className="form-label">Certificate Type</label>
                    <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Certificate Number *</label>
                    <input className="form-input" placeholder="e.g. NCC/CERT/2025/001" value={form.certNo} onChange={e => setForm(f => ({ ...f, certNo: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Issue Date</label>
                    <input className="form-input" type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Remarks</label>
                    <textarea className="form-input" rows={2} placeholder="Any notes..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? "Update" : "Issue Certificate"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title">🏅 Certificate Details</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 52 }}>🏅</div>
                <h3 style={{ color: "#174675", margin: "8px 0 4px" }}>{viewItem.type}</h3>
                <span className="badge" style={STATUS_COLORS[viewItem.status]}>{viewItem.status}</span>
              </div>
              <div className="profile-grid">
                {[
                  ["Cadet", viewItem.cadetName],
                  ["Roll No", viewItem.rollNo],
                  ["Certificate No", viewItem.certNo],
                  ["Issue Date", viewItem.issueDate || "—"],
                  ["Type", viewItem.type],
                  ["Description", TYPE_DESC[viewItem.type]],
                ].map(([label, value]) => (
                  <div key={label} className="profile-field">
                    <div className="profile-field-label">{label}</div>
                    <div className="profile-field-value" style={{ fontSize: label === "Certificate No" ? 12 : 14, fontFamily: label === "Certificate No" ? "monospace" : "inherit" }}>{value}</div>
                  </div>
                ))}
              </div>
              {viewItem.remarks && (
                <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 8, padding: 14, fontSize: 14, color: "#374151" }}>
                  <b>Remarks:</b> {viewItem.remarks}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { printCert(viewItem); }}>🖨️ Print Certificate</button>
              <button className="btn-primary" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440, textAlign: "center" }}>
            <div className="modal-header">
              <h2 className="modal-title">📲 Digital QR Verification</h2>
              <button className="modal-close" onClick={() => setQrItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: "24px 20px" }}>
              <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                <QRCodeSVG
                  value={`${window.location.origin}/verify-certificate/${encodeURIComponent(qrItem.certNo)}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#174675" }}>{qrItem.type}</h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
                Cert No: <strong style={{ color: "#0f172a" }}>{qrItem.certNo}</strong>
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                Scan this QR code with any smartphone to open the public official verification page.
              </p>
            </div>
            <div className="modal-footer">
              <a
                href={`/verify-certificate/${encodeURIComponent(qrItem.certNo)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ width: "100%", textDecoration: "none", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 6 }}
              >
                Open Verification Page <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
