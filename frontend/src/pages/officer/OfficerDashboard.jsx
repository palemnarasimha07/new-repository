import { useAuth } from "../../context/AuthContext";
import { Users, CalendarCheck, FileText, Trophy, Award, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import AttentionRequiredWidget from "../../components/AttentionRequiredWidget";

const attendanceData = [
  { month: "Mar", attendance: 88 },
  { month: "Apr", attendance: 91 },
  { month: "May", attendance: 85 },
  { month: "Jun", attendance: 93 },
  { month: "Jul", attendance: 87 },
  { month: "Aug", attendance: 95 },
];

const examData = [
  { exam: "NCC Basics", avg: 84 },
  { exam: "Drill", avg: 91 },
  { exam: "First Aid", avg: 72 },
  { exam: "Leadership", avg: 88 },
  { exam: "Map Reading", avg: 65 },
];

const wingData = [
  { name: "Army", value: 45, color: "#2e7d32" },
  { name: "Naval", value: 30, color: "#1565c0" },
  { name: "Air",   value: 25, color: "#6a1b9a" },
];

export default function OfficerDashboard() {
  const { user } = useAuth();

  const cadets      = JSON.parse(localStorage.getItem("nccCadets")       || "[]");
  const exams       = JSON.parse(localStorage.getItem("nccExams")        || "[]");
  const certs       = JSON.parse(localStorage.getItem("nccCertificates") || "[]");
  const achievements= JSON.parse(localStorage.getItem("nccAchievements")|| "[]");

  const avgAtt = cadets.length ? Math.round(cadets.reduce((s, c) => s + Number(c.attendance || 0), 0) / cadets.length) : 89;

  const STATS = [
    { icon: Users,         label: "Total Cadets",       value: cadets.length || 124, color: "#174675", bg: "#e3f0ff" },
    { icon: CalendarCheck, label: "Avg Attendance",      value: `${avgAtt}%`,        color: "#2e7d32", bg: "#e8f5e9" },
    { icon: FileText,      label: "Exams Conducted",     value: exams.length || 12,  color: "#ef6c00", bg: "#fff3e0" },
    { icon: Trophy,        label: "Achievements",        value: achievements.length || 38, color: "#7b1fa2", bg: "#f3e5f5" },
    { icon: Award,         label: "Certificates Issued", value: certs.length || 56,  color: "#c62828", bg: "#ffebee" },
    { icon: TrendingUp,    label: "Training Completion", value: "84%",               color: "#00695c", bg: "#e0f2f1" },
  ];

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Officer Dashboard</h1>
          <p className="page-sub">Welcome back, {user?.name} · {user?.unit}</p>
        </div>
        <div className="page-header-badge">
          {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Attention Required Officer Decision Support Widget */}
      <div style={{ marginBottom: 20 }}>
        <AttentionRequiredWidget />
      </div>

      {/* Charts row */}
      <div className="charts-grid">
        {/* Attendance trend */}
        <div className="chart-card">
          <h3 className="chart-title">📅 Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 13 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#174675"
                strokeWidth={3}
                dot={{ r: 5, fill: "#174675" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exam performance */}
        <div className="chart-card">
          <h3 className="chart-title">📝 Exam Average Scores</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={examData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="exam" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 13 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="avg" fill="#174675" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wing distribution */}
        <div className="chart-card chart-card-sm">
          <h3 className="chart-title">🪖 Wing Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={wingData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {wingData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <h3 className="card-title">🕐 Recent Activity</h3>
        <div className="activity-list">
          {[
            { icon: "👨🎓", text: "New cadet Vikram Singh enrolled in Army Wing", time: "2 hours ago" },
            { icon: "📝", text: "NCC Basics examination published for all cadets", time: "5 hours ago" },
            { icon: "🏆", text: "Priya Sharma awarded Best Cadet — District Level", time: "Yesterday" },
            { icon: "📅", text: "Parade attendance marked for 48 cadets", time: "Yesterday" },
            { icon: "📜", text: "5 training certificates issued", time: "2 days ago" },
          ].map((item, i) => (
            <div key={i} className="activity-item">
              <span className="activity-icon">{item.icon}</span>
              <div className="activity-text">{item.text}</div>
              <div className="activity-time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
