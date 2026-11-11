import { AlertTriangle, UserX, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AttentionRequiredWidget() {
  const navigate = useNavigate();

  const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
  const trainings = JSON.parse(localStorage.getItem("nccTrainings") || "[]");
  const achievements = JSON.parse(localStorage.getItem("nccAchievements") || "[]");
  const certs = JSON.parse(localStorage.getItem("nccCertificates") || "[]");

  // 1. Identify Cadets with Attendance < 75%
  const lowAttendanceCadets = cadets.map((c) => {
    const marked = trainings.filter((t) => t.attendance?.[c.cadetId]);
    const present = marked.filter((t) => t.attendance?.[c.cadetId] === "Present");
    const pct = marked.length > 0 ? Math.round((present.length / marked.length) * 100) : (c.attendance || 85);
    return { ...c, attPct: pct };
  }).filter((c) => c.attPct < 75);

  // 2. Identify Low-Performing Cadets (< 60% exam score)
  const lowPerformingCadets = cadets.map((c) => {
    const resObj = JSON.parse(localStorage.getItem(`nccResults_${c.id}`) || "{}");
    const resArr = Object.values(resObj);
    const avg = resArr.length ? Math.round(resArr.reduce((s, r) => s + r.pct, 0) / resArr.length) : null;
    return { ...c, examAvg: avg };
  }).filter((c) => c.examAvg !== null && c.examAvg < 60);

  // 3. Pending Certificate Approvals
  const pendingCertificates = certs.filter((c) => c.status === "Pending");

  // 4. Pending Achievement Verification (cadet submitted)
  const pendingAchievements = achievements.filter((a) => a.status === "Pending Verification");

  const totalActionItems =
    lowAttendanceCadets.length + lowPerformingCadets.length + pendingCertificates.length + pendingAchievements.length;

  return (
    <div className="card" style={{ border: "2px solid #ef4444", background: "#fff5f5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 8, borderRadius: 8 }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#991b1b", fontSize: 16, fontWeight: 800 }}>
              🚨 Attention Required ({totalActionItems} Items)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7f1d1d" }}>
              Immediate officer decision support & risk flags requiring action
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {/* Low Attendance Alert Box */}
        <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #fca5a5" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", display: "flex", alignItems: "center", gap: 6 }}>
              <UserX size={16} /> Low Attendance (&lt;75%)
            </span>
            <span className="badge badge-red">{lowAttendanceCadets.length}</span>
          </div>
          {lowAttendanceCadets.length > 0 ? (
            <div style={{ fontSize: 12, color: "#374151" }}>
              {lowAttendanceCadets.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>{c.name} ({c.cadetId})</span>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>{c.attPct}%</span>
                </div>
              ))}
              <button
                className="btn-secondary"
                style={{ width: "100%", fontSize: 11, padding: "4px", marginTop: 6 }}
                onClick={() => navigate("/officer/attendance")}
              >
                Manage Attendance <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>🟢 All cadets have &ge; 75% attendance.</p>
          )}
        </div>

        {/* Low Marks Performance Alert Box */}
        <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #fcd34d" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#854d0e", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} /> Low Exam Score (&lt;60%)
            </span>
            <span className="badge badge-orange">{lowPerformingCadets.length}</span>
          </div>
          {lowPerformingCadets.length > 0 ? (
            <div style={{ fontSize: 12, color: "#374151" }}>
              {lowPerformingCadets.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>{c.name}</span>
                  <span style={{ color: "#b45309", fontWeight: 700 }}>{c.examAvg}%</span>
                </div>
              ))}
              <button
                className="btn-secondary"
                style={{ width: "100%", fontSize: 11, padding: "4px", marginTop: 6 }}
                onClick={() => navigate("/officer/analytics")}
              >
                View Performance Analytics <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>🟢 No cadets failing academic exams.</p>
          )}
        </div>

        {/* Pending Approvals Box */}
        <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #93c5fd" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={16} /> Pending Verifications
            </span>
            <span className="badge badge-blue">{pendingCertificates.length + pendingAchievements.length}</span>
          </div>
          <div style={{ fontSize: 12, color: "#374151" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Certificates Pending Issue:</span>
              <span style={{ fontWeight: 700 }}>{pendingCertificates.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Achievements Verification:</span>
              <span style={{ fontWeight: 700 }}>{pendingAchievements.length}</span>
            </div>
            <button
              className="btn-secondary"
              style={{ width: "100%", fontSize: 11, padding: "4px", marginTop: 6 }}
              onClick={() => navigate("/officer/certificates")}
            >
              Verify Documents <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
