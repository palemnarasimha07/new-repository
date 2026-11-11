import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Users, FileText, Trophy, Award, Tent, Megaphone,
  BarChart2, CalendarCheck, Dumbbell, ShieldCheck,
  Settings, Database, RefreshCw, Trash2, Download, Upload
} from "lucide-react";

const WING_COLORS = ["#174675", "#1a6b3c", "#7b1fa2"];

const MONTHLY_DATA = [
  { month: "Apr", cadets: 85, attendance: 78 },
  { month: "May", cadets: 88, attendance: 82 },
  { month: "Jun", cadets: 90, attendance: 79 },
  { month: "Jul", cadets: 92, attendance: 85 },
  { month: "Aug", cadets: 95, attendance: 88 },
  { month: "Sep", cadets: 98, attendance: 86 },
];

const EXAM_DATA = [
  { name: "GK",         pass: 42, fail: 8 },
  { name: "Drill",      pass: 48, fail: 2 },
  { name: "First Aid",  pass: 35, fail: 15 },
  { name: "Leadership", pass: 44, fail: 6 },
];

const DATA_KEYS = [
  { key: "nccCadets",        label: "Cadets",        icon: Users },
  { key: "nccTrainings",     label: "Trainings",     icon: Dumbbell },
  { key: "nccExams",         label: "Exams",         icon: FileText },
  { key: "nccQuestions",     label: "Questions",     icon: FileText },
  { key: "nccAchievements",  label: "Achievements",  icon: Trophy },
  { key: "nccCertificates",  label: "Certificates",  icon: Award },
  { key: "nccCamps",         label: "Camps",         icon: Tent },
  { key: "nccAnnouncements", label: "Announcements", icon: Megaphone },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Live data ──────────────────────────────────────────────────────────────
  const cadets        = JSON.parse(localStorage.getItem("nccCadets")        || "[]");
  const trainings     = JSON.parse(localStorage.getItem("nccTrainings")     || "[]");
  const exams         = JSON.parse(localStorage.getItem("nccExams")         || "[]");
  const achievements  = JSON.parse(localStorage.getItem("nccAchievements")  || "[]");
  const certs         = JSON.parse(localStorage.getItem("nccCertificates")  || "[]");
  const camps         = JSON.parse(localStorage.getItem("nccCamps")         || "[]");
  const announcements = JSON.parse(localStorage.getItem("nccAnnouncements") || "[]");

  // Wing distribution from real data
  const wingCounts = cadets.reduce((acc, c) => {
    const w = c.wing?.replace(" Wing", "") || "Army";
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});
  const wingData = Object.entries(wingCounts).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Total Cadets",     value: cadets.length,                                          icon: Users,        color: "#174675", bg: "#e3f0ff", path: "/officer/cadets" },
    { label: "Training Sessions",value: trainings.length,                                       icon: Dumbbell,     color: "#166534", bg: "#dcfce7", path: "/officer/training" },
    { label: "Exams Published",  value: exams.filter(e => e.status === "published" || e.status === "Published").length, icon: FileText, color: "#1e40af", bg: "#dbeafe", path: "/officer/examination" },
    { label: "Achievements",     value: achievements.length,                                    icon: Trophy,       color: "#9a3412", bg: "#ffedd5", path: "/officer/achievements" },
    { label: "Certificates",     value: certs.length,                                           icon: Award,        color: "#6b21a8", bg: "#f3e8ff", path: "/officer/certificates" },
    { label: "Camps",            value: camps.length,                                           icon: Tent,         color: "#0369a1", bg: "#e0f2fe", path: "/officer/camps" },
    { label: "Announcements",    value: announcements.length,                                   icon: Megaphone,    color: "#991b1b", bg: "#fee2e2", path: "/officer/announcements" },
    { label: "Avg Attendance",   value: cadets.length ? `${Math.round(cadets.reduce((s, c) => s + (c.attendance || 0), 0) / cadets.length)}%` : "—", icon: CalendarCheck, color: "#166534", bg: "#dcfce7", path: "/officer/attendance" },
  ];

  const quickLinks = [
    { label: "Manage Cadets",  icon: Users,        path: "/officer/cadets",        color: "#174675" },
    { label: "Attendance",     icon: CalendarCheck,path: "/officer/attendance",    color: "#166534" },
    { label: "Training",       icon: Dumbbell,     path: "/officer/training",      color: "#1e40af" },
    { label: "Examinations",   icon: FileText,     path: "/officer/examination",   color: "#9a3412" },
    { label: "Achievements",   icon: Trophy,       path: "/officer/achievements",  color: "#6b21a8" },
    { label: "Certificates",   icon: Award,        path: "/officer/certificates",  color: "#0369a1" },
    { label: "Camps",          icon: Tent,         path: "/officer/camps",         color: "#854d0e" },
    { label: "Announcements",  icon: Megaphone,    path: "/officer/announcements", color: "#991b1b" },
    { label: "Analytics",      icon: BarChart2,    path: "/officer/analytics",     color: "#374151" },
    { label: "Cert. Mgmt",     icon: ShieldCheck,  path: "/officer/certificates",  color: "#166534" },
  ];

  // ── Data management actions ────────────────────────────────────────────────
  const exportData = () => {
    const allData = {};
    DATA_KEYS.forEach(({ key }) => {
      const val = localStorage.getItem(key);
      if (val) allData[key] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `ncc_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast("✅ Data exported successfully");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(key, JSON.stringify(val));
        });
        showToast("✅ Data imported successfully. Refresh to see changes.");
      } catch {
        showToast("❌ Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearKey = (key, label) => {
    if (!window.confirm(`Clear all ${label} data? This cannot be undone.`)) return;
    localStorage.removeItem(key);
    showToast(`🗑️ ${label} data cleared`);
  };

  const resetAllData = () => {
    if (!window.confirm("⚠️ This will DELETE ALL system data. Are you absolutely sure?")) return;
    if (!window.confirm("Last warning: All cadets, exams, results, and records will be erased. Continue?")) return;
    DATA_KEYS.forEach(({ key }) => localStorage.removeItem(key));
    // Also clear result keys
    Object.keys(localStorage).filter(k => k.startsWith("nccResults_") || k.startsWith("nccProfile_") || k.startsWith("nccReadNotifs_"))
      .forEach(k => localStorage.removeItem(k));
    showToast("🗑️ All data cleared. Refresh the page.");
  };

  const getCount = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || "[]").length; }
    catch { return 0; }
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 9999,
          background: "#111827", color: "white", padding: "12px 20px",
          borderRadius: 10, fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "fadeIn 0.2s"
        }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Welcome, {user?.name} · {user?.rank} · {user?.unit}</p>
        </div>
        <div className="page-header-badge">🇮🇳 CO Portal</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: "overview", label: "📊 Overview" },
          { key: "audit",    label: "📋 System Audit Logs" },
          { key: "system",   label: "⚙️ System Management" },
          { key: "data",     label: "🗄️ Data Management" },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? "tab-active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate(s.path)}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Icon size={20} /></div>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                </div>
              );
            })}
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">📈 Cadet Strength & Attendance Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cadets"     stroke="#174675" strokeWidth={2} dot={{ r: 3 }} name="Cadets" />
                  <Line type="monotone" dataKey="attendance" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">🎯 Wing Distribution</div>
              {wingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={wingData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {wingData.map((_, i) => <Cell key={i} fill={WING_COLORS[i % WING_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: "40px 0" }}>
                  <div className="empty-state-icon">📊</div>
                  <div className="empty-state-sub">No cadet data yet</div>
                </div>
              )}
            </div>

            <div className="chart-card">
              <div className="chart-title">📝 Exam Pass/Fail Summary</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={EXAM_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pass" fill="#22c55e" name="Pass" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fail" fill="#ef4444" name="Fail" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">⚡ Quick Access</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              {quickLinks.map(l => {
                const Icon = l.icon;
                return (
                  <button key={l.label} onClick={() => navigate(l.path)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "white", cursor: "pointer", transition: "all 0.15s", fontSize: 13, fontWeight: 600, color: "#374151" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.color = l.color; e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "white"; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: l.color }}>
                      <Icon size={20} />
                    </div>
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── AUDIT LOGS TAB ── */}
      {tab === "audit" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, color: "#174675", fontSize: 18 }}>📋 System Audit Trail Logs</h3>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>
                Security & action audit history recorded across the system
              </p>
            </div>
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: "6px 12px" }}
              onClick={() => {
                localStorage.setItem("nccAuditLogs", JSON.stringify([
                  { id: Date.now(), user: "co", role: "admin", action: "CO Audit log review conducted", timestamp: new Date().toLocaleString() },
                  ...JSON.parse(localStorage.getItem("nccAuditLogs") || "[]")
                ]));
                showToast("Audit log refreshed");
              }}
            >
              🔄 Refresh Logs
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action Performed</th>
                </tr>
              </thead>
              <tbody>
                {(JSON.parse(localStorage.getItem("nccAuditLogs") || "[]")).length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>
                      No audit logs recorded yet. Action events like logins and edits will appear here.
                    </td>
                  </tr>
                ) : (
                  JSON.parse(localStorage.getItem("nccAuditLogs") || "[]").map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{log.timestamp}</td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{log.user}</td>
                      <td>
                        <span className={`badge ${log.role === "admin" ? "badge-red" : log.role === "officer" ? "badge-blue" : "badge-green"}`}>
                          {log.role}
                        </span>
                      </td>
                      <td style={{ fontSize: 13.5, color: "#334155" }}>{log.action}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SYSTEM MANAGEMENT TAB ── */}
      {tab === "system" && (
        <>
          {/* System info */}
          <div className="card" style={{ borderLeft: "4px solid #7b1fa2" }}>
            <h3 className="card-title">🛡️ System Information</h3>
            <div className="profile-grid">
              {[
                ["Commanding Officer", user?.name],
                ["Unit",               user?.unit],
                ["Institution",        user?.institution],
                ["Role",               "Commanding Officer"],
                ["Access Level",       "Full Admin"],
                ["Data Storage",       "Browser localStorage"],
                ["System Version",     "v3.0 — Phase 12"],
                ["Total Records",      DATA_KEYS.reduce((s, { key }) => s + getCount(key), 0)],
              ].map(([label, value]) => (
                <div key={label} className="profile-field">
                  <div className="profile-field-label">{label}</div>
                  <div className="profile-field-value">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer accounts */}
          <div className="card">
            <h3 className="card-title">👮 Officer Accounts</h3>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Username</th><th>Role</th><th>Unit</th><th>Status</th></tr>
              </thead>
              <tbody>
                {[
                  { name: "Lt. Pradeep Sharma", username: "ano", role: "Officer (ANO)", unit: "1 Karnataka Battalion", status: "Active" },
                  { name: "Col. Rajesh Verma",  username: "co",  role: "Admin (CO)",    unit: "Karnataka Directorate",  status: "Active" },
                ].map(u => (
                  <tr key={u.username}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td><code style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>{u.username}</code></td>
                    <td><span className="badge badge-blue">{u.role}</span></td>
                    <td>{u.unit}</td>
                    <td><span className="badge badge-green">{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
              ℹ️ Officer credentials are managed in the application source code (AuthContext.jsx). Default password: 1234
            </p>
          </div>

          {/* Cadet accounts */}
          <div className="card">
            <h3 className="card-title">🎖️ Cadet Accounts ({cadets.length})</h3>
            {cadets.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-sub">No cadets registered yet.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Cadet ID</th><th>Phone (Password)</th><th>Wing</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {cadets.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td><span className="cadet-id-badge">{c.cadetId}</span></td>
                        <td style={{ fontFamily: "monospace", fontSize: 13 }}>{c.phone}</td>
                        <td>{c.wing}</td>
                        <td><span className="badge badge-green">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
              ℹ️ Cadets log in using their Cadet ID as username and phone number as password.
            </p>
          </div>
        </>
      )}

      {/* ── DATA MANAGEMENT TAB ── */}
      {tab === "data" && (
        <>
          {/* Storage overview */}
          <div className="card">
            <h3 className="card-title">🗄️ Storage Overview</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {DATA_KEYS.map(({ key, label, icon: Icon }) => {
                const count = getCount(key);
                return (
                  <div key={key} style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e3f0ff", color: "#174675", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>{count}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
                    </div>
                    <button
                      className="icon-btn icon-btn-red"
                      style={{ marginLeft: "auto" }}
                      title={`Clear ${label}`}
                      onClick={() => clearKey(key, label)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export / Import */}
          <div className="card">
            <h3 className="card-title">💾 Backup & Restore</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={exportData}>
                <Download size={16} /> Export All Data
              </button>
              <label className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <Upload size={16} /> Import Backup
                <input type="file" accept=".json" style={{ display: "none" }} onChange={importData} />
              </label>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12 }}>
              Export creates a JSON backup of all system data. Import restores from a previously exported file.
            </p>
          </div>

          {/* Danger zone */}
          <div className="danger-zone">
            <div className="danger-zone-title">⚠️ Danger Zone</div>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              These actions are irreversible. All data will be permanently deleted from this browser.
            </p>
            <button className="btn-danger" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={resetAllData}>
              <RefreshCw size={16} /> Reset All System Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}
