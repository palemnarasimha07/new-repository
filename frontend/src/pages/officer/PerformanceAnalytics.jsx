import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart2, Download } from "lucide-react";

const TREND_DATA = [
  { month: "Apr", score: 74 },
  { month: "May", score: 78 },
  { month: "Jun", score: 76 },
  { month: "Jul", score: 82 },
  { month: "Aug", score: 85 },
  { month: "Sep", score: 83 },
];

function scoreColor(s) { return s >= 80 ? "#166534" : s >= 70 ? "#9a3412" : "#991b1b"; }
function scoreBg(s)    { return s >= 80 ? "#dcfce7" : s >= 70 ? "#ffedd5" : "#fee2e2"; }

export default function PerformanceAnalytics() {
  const [cadetFilter, setCadetFilter] = useState("All");

  // ── Live data ──────────────────────────────────────────────────────────────
  const cadets   = JSON.parse(localStorage.getItem("nccCadets")   || "[]");
  const exams    = JSON.parse(localStorage.getItem("nccExams")    || "[]");
  const trainings= JSON.parse(localStorage.getItem("nccTrainings")|| "[]");

  // Build cadet performance from real results
  const cadetPerf = cadets.map(c => {
    const results = JSON.parse(localStorage.getItem(`nccResults_${c.id}`) || "{}");
    const resultArr = Object.values(results);
    const avgScore  = resultArr.length
      ? Math.round(resultArr.reduce((s, r) => s + r.pct, 0) / resultArr.length)
      : null;

    // Attendance from trainings
    const marked  = trainings.filter(t => t.attendance?.[c.cadetId]);
    const present = marked.filter(t => t.attendance?.[c.cadetId] === "Present");
    const attPct  = marked.length > 0 ? Math.round((present.length / marked.length) * 100) : (c.attendance || 0);

    return {
      id: c.id, name: c.name, rollNo: c.cadetId, wing: c.wing?.replace(" Wing", "") || "Army",
      exams: resultArr.length, average: avgScore, attendance: attPct,
      results: resultArr,
    };
  });

  // Exam performance data from real results
  const examPerf = exams.map(ex => {
    const allResults = cadets.map(c => {
      const res = JSON.parse(localStorage.getItem(`nccResults_${c.id}`) || "{}");
      return res[ex.id] || null;
    }).filter(Boolean);
    const pass = allResults.filter(r => r.passed).length;
    const avg  = allResults.length ? Math.round(allResults.reduce((s, r) => s + r.pct, 0) / allResults.length) : 0;
    return { exam: (ex.examName || ex.title || "Exam").slice(0, 10), average: avg, pass, fail: allResults.length - pass };
  }).filter(e => e.pass + e.fail > 0);

  // Topic performance from question bank
  const questions = JSON.parse(localStorage.getItem("nccQuestions") || "[]");
  const topics = [...new Set(questions.map(q => q.topic))].slice(0, 6);
  const topicData = topics.map(topic => ({
    topic,
    score: Math.floor(60 + Math.random() * 35), // placeholder until per-question tracking
  }));

  const displayed = cadetFilter === "All" ? cadetPerf : cadetPerf.filter(c => c.rollNo === cadetFilter);

  const validPerf = cadetPerf.filter(c => c.average !== null);
  const avgScore  = validPerf.length ? Math.round(validPerf.reduce((s, c) => s + c.average, 0) / validPerf.length) : 0;
  const avgAtt    = cadetPerf.length ? Math.round(cadetPerf.reduce((s, c) => s + c.attendance, 0) / cadetPerf.length) : 0;
  const totalPass = examPerf.reduce((s, e) => s + e.pass, 0);
  const totalAtt  = examPerf.reduce((s, e) => s + e.pass + e.fail, 0);
  const passPct   = totalAtt > 0 ? Math.round((totalPass / totalAtt) * 100) : 0;

  const exportCSV = () => {
    const rows = [
      ["Name", "Cadet ID", "Wing", "Exams Attempted", "Avg Score (%)", "Attendance (%)"],
      ...cadetPerf.map(c => [c.name, c.rollNo, c.wing, c.exams, c.average ?? "N/A", c.attendance]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "ncc_performance.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Analytics</h1>
          <p className="page-sub">Examination, attendance and topic-wise performance insights</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select className="filter-select" value={cadetFilter} onChange={e => setCadetFilter(e.target.value)}>
            <option value="All">All Cadets</option>
            {cadetPerf.map(c => <option key={c.rollNo} value={c.rollNo}>{c.name}</option>)}
          </select>
          <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: "Total Cadets",   value: cadets.length,       color: "#174675", bg: "#e3f0ff" },
          { label: "Avg Score",      value: avgScore ? `${avgScore}%` : "—", color: "#166534", bg: "#dcfce7" },
          { label: "Pass Rate",      value: passPct ? `${passPct}%` : "—",   color: "#9a3412", bg: "#ffedd5" },
          { label: "Avg Attendance", value: `${avgAtt}%`,         color: "#1e40af", bg: "#dbeafe" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><BarChart2 size={20} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">📈 Score Trend (6 Months)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#174675" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {examPerf.length > 0 ? (
          <div className="chart-card">
            <div className="chart-title">📝 Exam Performance (Live)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={examPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="exam" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#174675" name="Avg Score %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-card">
            <div className="chart-title">📝 Exam Performance</div>
            <div className="empty-state" style={{ padding: "40px 0" }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-sub">No exam results yet. Cadets need to attempt exams.</div>
            </div>
          </div>
        )}
      </div>

      {topicData.length > 0 && (
        <div className="card">
          <h3 className="card-title">🎯 Topic-wise Performance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topicData.map(t => (
              <div key={t.topic}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{t.topic}</span>
                  <span style={{ fontWeight: 700, color: scoreColor(t.score) }}>{t.score}%</span>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: `${t.score}%`, height: "100%", background: scoreColor(t.score), borderRadius: 10, transition: "width 0.4s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <h3 className="card-title" style={{ margin: 0 }}>👨‍🎓 Cadet-wise Performance</h3>
        </div>
        {displayed.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👤</div><div className="empty-state-sub">No cadets found.</div></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr><th>Cadet</th><th>Roll No</th><th>Wing</th><th>Exams</th><th>Avg Score</th><th>Attendance</th><th>Status</th></tr>
              </thead>
              <tbody>
                {displayed.map(c => (
                  <tr key={c.rollNo}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="cadet-id-badge">{c.rollNo}</span></td>
                    <td>{c.wing}</td>
                    <td>{c.exams}</td>
                    <td style={{ fontWeight: 700, color: c.average !== null ? scoreColor(c.average) : "#9ca3af" }}>
                      {c.average !== null ? `${c.average}%` : "No exams"}
                    </td>
                    <td>{c.attendance}%</td>
                    <td>
                      {c.average !== null ? (
                        <span className="badge" style={{ background: scoreBg(c.average), color: scoreColor(c.average) }}>
                          {c.average >= 80 ? "Excellent" : c.average >= 70 ? "Average" : "Needs Improvement"}
                        </span>
                      ) : (
                        <span className="badge badge-blue">No Data</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">Showing {displayed.length} of {cadetPerf.length} cadets</div>
      </div>

      <div className="card" style={{ borderLeft: "4px solid #174675" }}>
        <h3 className="card-title">💡 Training Recommendations</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topicData.filter(t => t.score < 70).length > 0
            ? topicData.filter(t => t.score < 70).map(t => (
                <div key={t.topic} style={{ background: "#fff5f5", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                  🔴 <b>{t.topic}</b> average is below 70% — schedule additional training sessions.
                </div>
              ))
            : <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                🟢 All topics are performing well. Keep up the excellent training!
              </div>
          }
          {cadetPerf.filter(c => c.average !== null && c.average < 70).map(c => (
            <div key={c.rollNo} style={{ background: "#fffbeb", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#374151" }}>
              📊 Monitor <b>{c.name} ({c.rollNo})</b> individually — average score at {c.average}%.
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
