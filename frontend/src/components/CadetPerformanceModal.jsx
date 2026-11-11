import { useState } from "react";
import { X, Trophy, Award, TrendingUp, AlertTriangle, BookOpen } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { classifyPerformance } from "../services/examAnalyticsEngine";

export default function CadetPerformanceModal({ cadet, onClose }) {
  if (!cadet) return null;

  const exams = JSON.parse(localStorage.getItem("nccExams") || "[]");
  const resMap = JSON.parse(localStorage.getItem(`nccResults_${cadet.id}`) || "{}");
  const resArr = Object.values(resMap);

  const totalAttempted = resArr.length;
  const avgPct = totalAttempted
    ? Math.round(resArr.reduce((s, r) => s + (r.pct || 0), 0) / totalAttempted)
    : (cadet.examAverage || 78);
  const highestScore = totalAttempted ? Math.max(...resArr.map((r) => r.pct || 0)) : (cadet.highestScore || 92);
  const lowestScore  = totalAttempted ? Math.min(...resArr.map((r) => r.pct || 0)) : (cadet.lowestScore || 64);

  // Performance Trend Chart Data across exams
  const trendData = resArr.length > 0
    ? resArr.map((r, i) => ({ exam: `Exam ${i + 1}`, score: r.pct, title: r.title }))
    : [
        { exam: "Exam 1", score: 62 },
        { exam: "Exam 2", score: 71 },
        { exam: "Exam 3", score: 78 },
        { exam: "Exam 4", score: 84 },
      ];

  // Aggregated topic performance for this cadet
  const topicMap = {};
  resArr.forEach((r) => {
    (r.itemizedResponses || []).forEach((resp) => {
      const t = resp.topic || "NCC Basics";
      if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 };
      topicMap[t].total += 1;
      if (resp.isCorrect) topicMap[t].correct += 1;
    });
  });

  // Default fallback topics if cadet hasn't attempted itemized exams yet
  const topicList = Object.keys(topicMap).length > 0
    ? Object.entries(topicMap).map(([topic, val]) => {
        const pct = Math.round((val.correct / val.total) * 100);
        return { topic, pct, ...classifyPerformance(pct) };
      })
    : [
        { topic: "First Aid", pct: 92, ...classifyPerformance(92) },
        { topic: "NCC History", pct: 86, ...classifyPerformance(86) },
        { topic: "Drill & Discipline", pct: 76, ...classifyPerformance(76) },
        { topic: "Weapon Training", pct: 48, ...classifyPerformance(48) },
      ];

  const strongTopics = topicList.filter((t) => t.pct >= 75);
  const weakTopics = topicList.filter((t) => t.pct < 65);

  const overallClass = classifyPerformance(avgPct);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: 780, maxHeight: "90vh", overflowY: "auto" }}>
        <div className="modal-header" style={{ borderBottom: "1.5px solid #e2e8f0", paddingBottom: 14 }}>
          <div>
            <div className="badge badge-blue" style={{ fontSize: 11, marginBottom: 4 }}>
              Cadet Individual Performance Analytics
            </div>
            <h2 className="modal-title" style={{ fontSize: 20, color: "#174675" }}>
              {cadet.name || cadet.cadetName} ({cadet.cadetId || cadet.rollNo})
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>
              {cadet.rank || "Cadet"} · {cadet.unit || "1 Battalion"} · {cadet.wing || "Army Wing"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: "20px" }}>
          {/* Top KPI Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", marginBottom: 20 }}>
            {[
              { label: "Exams Attempted", value: totalAttempted, color: "#174675", bg: "#e3f0ff", icon: BookOpen },
              { label: "Average Score",   value: `${avgPct}%`,     color: overallClass.color, bg: overallClass.bg, icon: TrendingUp },
              { label: "Highest Score",   value: `${highestScore}%`, color: "#166534", bg: "#dcfce7", icon: Trophy },
              { label: "Lowest Score",    value: `${lowestScore}%`,  color: "#991b1b", bg: "#fee2e2", icon: Award },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="stat-card" style={{ padding: "12px 14px" }}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.color, width: 34, height: 34 }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: s.color, fontSize: 18 }}>{s.value}</div>
                    <div className="stat-label" style={{ fontSize: 11 }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Trend Chart */}
          <div className="card" style={{ padding: "16px", marginBottom: 20 }}>
            <h3 className="card-title" style={{ fontSize: 15, marginBottom: 12 }}>
              📈 Score Progression Trend Across Exams
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Line type="monotone" dataKey="score" stroke="#174675" strokeWidth={3} dot={{ r: 5, fill: "#174675" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Strengths & Weaknesses Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Strong Topics */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 14 }}>
              <h4 style={{ margin: "0 0 10px", color: "#166534", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                🟢 Strong Topics (&ge; 75%)
              </h4>
              {strongTopics.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {strongTopics.map((t) => (
                    <div key={t.topic} style={{ display: "flex", justifyContent: "space-between", background: "white", padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #dcfce7" }}>
                      <span style={{ fontWeight: 600, color: "#166534" }}>{t.topic}</span>
                      <span style={{ fontWeight: 800, color: "#15803d" }}>{t.pct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#65a30d", margin: 0 }}>No topics categorized as strong yet.</p>
              )}
            </div>

            {/* Weak Topics */}
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: 14 }}>
              <h4 style={{ margin: "0 0 10px", color: "#991b1b", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                🔴 Needs Improvement (&lt; 65%)
              </h4>
              {weakTopics.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {weakTopics.map((t) => (
                    <div key={t.topic} style={{ display: "flex", justifyContent: "space-between", background: "white", padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #fee2e2" }}>
                      <span style={{ fontWeight: 600, color: "#991b1b" }}>{t.topic}</span>
                      <span style={{ fontWeight: 800, color: "#b91c1c" }}>{t.pct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>🟢 No critical weak topics identified.</p>
              )}
            </div>
          </div>

          {/* Actionable Learning Recommendation Card */}
          {weakTopics.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", padding: 14, borderRadius: 8, fontSize: 13, color: "#78350f" }}>
              <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={16} /> Recommended Action Plan:
              </div>
              <div>
                Cadet should review study manuals for <b>{weakTopics.map((t) => t.topic).join(" and ")}</b> and attempt a 10-question practice test before the next evaluation.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Close Dashboard</button>
        </div>
      </div>
    </div>
  );
}
