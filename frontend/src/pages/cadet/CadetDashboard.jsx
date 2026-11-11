import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, BookOpen, Trophy, Award, TrendingUp, Bell, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import CadetReadinessCard from "../../components/CadetReadinessCard";
import { generateCadetRecommendations } from "../../services/recommendationEngine";

const PRIORITY_BADGE = {
  Urgent:    "badge-red",
  Important: "badge-orange",
  Normal:    "badge-blue",
};

const DEFAULT_TRAININGS = [
  { id: 1, name: "Drill Training",    date: "2025-08-28", attendance: { NCC001: "Present", NCC002: "Present", NCC003: "Absent" } },
  { id: 2, name: "Physical Training", date: "2025-08-29", attendance: { NCC001: "Present", NCC002: "Leave",   NCC003: "Present" } },
  { id: 3, name: "First Aid",         date: "2025-09-05", attendance: {} },
  { id: 4, name: "Map Reading",       date: "2025-09-10", attendance: {} },
];

const DEFAULT_EXAMS = [
  { id: 1, title: "NCC General Knowledge", duration: 20, totalMarks: 50, passMark: 25, status: "published" },
  { id: 2, title: "Drill & Discipline",    duration: 15, totalMarks: 40, passMark: 20, status: "published" },
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: "Annual Training Camp Registration Open", priority: "Important", date: "2025-08-20" },
  { id: 2, title: "Republic Day Parade Selection",          priority: "Urgent",    date: "2025-08-18" },
  { id: 3, title: "Uniform Inspection Notice",              priority: "Normal",    date: "2025-08-15" },
];

export default function CadetDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cadetId  = user?.cadetId || "NCC001";

  // ── Dynamic Recommendations ────────────────────────────────────────────────
  const recData = generateCadetRecommendations(cadetId, user?.id);

  // ── Live data from localStorage ──────────────────────────────────────────
  const trainings     = JSON.parse(localStorage.getItem("nccTrainings")     || "null") || DEFAULT_TRAININGS;
  const exams         = (JSON.parse(localStorage.getItem("nccExams")        || "null") || DEFAULT_EXAMS).filter(e => e.status === "published");
  const announcements = (JSON.parse(localStorage.getItem("nccAnnouncements")|| "null") || DEFAULT_ANNOUNCEMENTS).sort((a, b) => {
    const pri = { Urgent: 0, Important: 1, Normal: 2 };
    return (pri[a.priority] ?? 3) - (pri[b.priority] ?? 3);
  }).slice(0, 5);
  const achievements  = (JSON.parse(localStorage.getItem("nccAchievements") || "[]")).filter(a => a.rollNo === cadetId);
  const certs         = (JSON.parse(localStorage.getItem("nccCertificates") || "[]")).filter(c => c.rollNo === cadetId && c.status === "Issued");
  const results       = JSON.parse(localStorage.getItem(`nccResults_${user?.id}`) || "{}");

  // ── Attendance calculation ────────────────────────────────────────────────
  const marked   = trainings.filter(t => (t.attendance || {})[cadetId] && (t.attendance || {})[cadetId] !== "Not Marked");
  const present  = marked.filter(t => (t.attendance || {})[cadetId] === "Present");
  const attPct   = marked.length > 0 ? Math.round((present.length / marked.length) * 100) : 0;

  const attData  = [{ name: "Attendance", value: attPct, fill: "#174675" }];

  // ── Recent results ────────────────────────────────────────────────────────
  const recentResults = Object.values(results).slice(-3).reverse();

  // ── Upcoming exams (not yet attempted or retakeable) ─────────────────────
  const upcomingExams = exams.slice(0, 3);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(" ")[0]}! 👋</h1>
          <p className="page-sub">{user?.rank} · {user?.unit} · {user?.wing}</p>
        </div>
        <div className="cadet-id-badge">Cadet ID: <strong>{cadetId}</strong></div>
      </div>

      {/* Attendance Risk Banner Alert if <75% */}
      {attPct < 75 && (
        <div style={{ background: "#fee2e2", border: "2px solid #ef4444", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle size={24} style={{ color: "#dc2626" }} />
          <div>
            <div style={{ fontWeight: 800, color: "#991b1b", fontSize: 14 }}>
              ⚠️ ATTENDANCE RISK WARNING ({attPct}% Attendance)
            </div>
            <div style={{ fontSize: 12.5, color: "#7f1d1d" }}>
              Your parade attendance is currently below the mandatory 75% threshold. Please attend upcoming parades to maintain certificate eligibility.
            </div>
          </div>
        </div>
      )}

      {/* Transparent Cadet Readiness Score Card */}
      <div style={{ marginBottom: 20 }}>
        <CadetReadinessCard cadet={user || {}} userRole="cadet" />
      </div>

      {/* Personalized Learning Recommendation Box */}
      {recData.recommendations.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid #3b82f6", background: "#f0f9ff", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Lightbulb size={22} style={{ color: "#0284c7" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0369a1", fontWeight: 800 }}>
                💡 AI-Assisted Personalized Learning Recommendations
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#0284c7" }}>
                Targeted practice based on your topic performance
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recData.recommendations.map((rec) => (
              <div key={rec.id} style={{ background: "white", padding: 14, borderRadius: 8, border: "1px solid #bae6fd", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>🎯 {rec.topic}</span>
                    <span className={`badge ${rec.urgency === "Critical" ? "badge-red" : "badge-orange"}`} style={{ fontSize: 11 }}>
                      {rec.currentScore}% Score
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>
                    {rec.recommendationText}
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}
                  onClick={() => navigate("/cadet/exams")}
                >
                  {rec.suggestedAction} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: CalendarCheck, label: "Attendance",   value: `${attPct}%`,              color: "#174675", bg: "#e3f0ff" },
          { icon: BookOpen,      label: "Exams",        value: exams.length,               color: "#2e7d32", bg: "#e8f5e9" },
          { icon: TrendingUp,    label: "Attempted",    value: Object.keys(results).length,color: "#ef6c00", bg: "#fff3e0" },
          { icon: Trophy,        label: "Achievements", value: achievements.length,         color: "#7b1fa2", bg: "#f3e5f5" },
          { icon: Award,         label: "Certificates", value: certs.length,                color: "#c62828", bg: "#ffebee" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}><Icon size={22} /></div>
            <div><div className="stat-value" style={{ color }}>{value}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Attendance gauge */}
        <div className="card">
          <h3 className="card-title">📅 Attendance Overview</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ResponsiveContainer width={140} height={140}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={attData}>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#e3f0ff" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#174675" }}>{attPct}%</div>
              <div style={{ color: "#666", marginBottom: 8 }}>Overall Attendance</div>
              <span className={`badge ${attPct >= 75 ? "badge-green" : "badge-red"}`}>
                {attPct >= 75 ? "✅ Good Standing" : "⚠️ Below Required"}
              </span>
            </div>
          </div>
          <div className="attendance-breakdown">
            {[
              { label: "Sessions", pct: attPct },
              { label: "Present",  pct: marked.length > 0 ? Math.round((present.length / marked.length) * 100) : 0 },
            ].map(a => (
              <div key={a.label} className="attendance-row">
                <span>{a.label}</span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${a.pct}%`, background: a.pct >= 75 ? "#22c55e" : "#ef4444" }} />
                </div>
                <span>{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming exams */}
        <div className="card">
          <h3 className="card-title">📝 Available Examinations</h3>
          {upcomingExams.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 14 }}>No exams available.</p>
          ) : upcomingExams.map(exam => (
            <div key={exam.id} className="exam-item">
              <div>
                <div className="exam-name">{exam.title}</div>
                <div className="exam-meta">⏱ {exam.duration} min &nbsp;·&nbsp; 📊 {exam.totalMarks} marks &nbsp;·&nbsp; Pass: {exam.passMark}</div>
              </div>
              <button className="btn-primary btn-sm" onClick={() => navigate("/cadet/exams")}>
                {results[exam.id] ? "Retake" : "Start"}
              </button>
            </div>
          ))}
          <button style={{ marginTop: 12, fontSize: 13, color: "#174675", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/cadet/exams")}>
            View all exams →
          </button>
        </div>

        {/* Recent results */}
        <div className="card">
          <h3 className="card-title">📊 Recent Results</h3>
          {recentResults.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 14 }}>No exam results yet. Take an exam to see results here.</p>
          ) : recentResults.map((r, i) => (
            <div key={i} className="result-item">
              <div className="result-name">{r.title}</div>
              <div className="result-score">{r.score}/{r.total}</div>
              <span className={`badge ${r.passed ? "badge-green" : "badge-red"}`}>{r.pct}%</span>
              <span className={`badge ${r.passed ? "badge-green" : "badge-red"}`}>{r.passed ? "PASS" : "FAIL"}</span>
            </div>
          ))}
        </div>

        {/* Announcements */}
        <div className="card">
          <h3 className="card-title"><Bell size={16} style={{ marginRight: 6 }} />Announcements</h3>
          {announcements.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 14 }}>No announcements.</p>
          ) : announcements.map(a => (
            <div key={a.id} className="announcement-item">
              <div>
                <div className="announcement-title">{a.title}</div>
                <div className="announcement-date">{a.date}</div>
              </div>
              <span className={`badge ${PRIORITY_BADGE[a.priority] || "badge-blue"}`}>{a.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
