import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Award, X } from "lucide-react";

const STATUS_COLORS = {
  Issued:  { background: "#dcfce7", color: "#166534" },
  Pending: { background: "#ffedd5", color: "#9a3412" },
  Revoked: { background: "#fee2e2", color: "#991b1b" },
};

const DEFAULT_CERTS = [
  { id: 1, cadetName: "Rahul Kumar",  rollNo: "NCC001", type: "B Certificate",          certNo: "NCC/CERT/2025/001", issueDate: "2025-08-15", status: "Issued",  remarks: "Passed with distinction." },
  { id: 2, cadetName: "Priya Sharma", rollNo: "NCC002", type: "Camp Certificate",        certNo: "NCC/CERT/2025/002", issueDate: "2025-07-10", status: "Issued",  remarks: "CATC Summer 2025." },
  { id: 3, cadetName: "Arjun Reddy",  rollNo: "NCC003", type: "Achievement Certificate", certNo: "NCC/CERT/2025/003", issueDate: "2025-06-20", status: "Issued",  remarks: "State level sports." },
  { id: 4, cadetName: "Sneha Rao",    rollNo: "NCC004", type: "A Certificate",           certNo: "NCC/CERT/2025/004", issueDate: "",           status: "Pending", remarks: "Exam pending." },
];

export default function CadetCertificates() {
  const { user } = useAuth();
  const cadetId = user?.cadetId || "NCC001";

  const all = (() => {
    const s = localStorage.getItem("nccCertificates");
    return s ? JSON.parse(s) : DEFAULT_CERTS;
  })();

  const certs = all.filter(c => c.rollNo === cadetId);
  const [viewItem, setViewItem] = useState(null);

  const stats = [
    { label: "Total",   value: certs.length,                                     color: "#174675", bg: "#e3f0ff" },
    { label: "Issued",  value: certs.filter(c => c.status === "Issued").length,  color: "#166534", bg: "#dcfce7" },
    { label: "Pending", value: certs.filter(c => c.status === "Pending").length, color: "#9a3412", bg: "#ffedd5" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="page-sub">Your NCC certificates and awards</p>
        </div>
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

      {certs.length === 0 ? (
        <div className="coming-soon-card">
          <Award size={48} color="#d1d5db" />
          <h2>No Certificates Yet</h2>
          <p>Your certificates will appear here once issued by your officer.</p>
        </div>
      ) : (
        <>
          {/* Certificate cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {certs.map(c => (
              <div key={c.id} className="card" style={{ borderTop: `4px solid ${c.status === "Issued" ? "#22c55e" : c.status === "Pending" ? "#f97316" : "#ef4444"}`, cursor: "pointer" }} onClick={() => setViewItem(c)}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏅</div>
                <h3 style={{ color: "#174675", margin: "0 0 8px", fontSize: 15 }}>{c.type}</h3>
                <span className="badge" style={STATUS_COLORS[c.status]}>{c.status}</span>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "10px 0 3px", fontFamily: "monospace" }}>{c.certNo}</p>
                {c.issueDate && <p style={{ fontSize: 13, color: "#9ca3af" }}>Issued: {c.issueDate}</p>}
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <h3 className="card-title" style={{ margin: 0 }}>📋 Certificate Records</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr><th>Certificate Type</th><th>Certificate No</th><th>Issue Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {certs.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.type}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{c.certNo}</td>
                      <td style={{ color: "#6b7280" }}>{c.issueDate || "—"}</td>
                      <td><span className="badge" style={STATUS_COLORS[c.status]}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
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
                  ["Certificate No", viewItem.certNo],
                  ["Issue Date", viewItem.issueDate || "—"],
                  ["Status", viewItem.status],
                ].map(([l, v]) => (
                  <div key={l} className="profile-field">
                    <div className="profile-field-label">{l}</div>
                    <div className="profile-field-value" style={{ fontFamily: l === "Certificate No" ? "monospace" : "inherit", fontSize: l === "Certificate No" ? 12 : 14 }}>{v}</div>
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
              <button className="btn-primary" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
