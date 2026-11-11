import { X, Printer, Award, FileText, CheckCircle } from "lucide-react";
import { getExamDetailedAnalytics } from "../services/examAnalyticsEngine";

export default function ExamReportModal({ examId, onClose }) {
  if (!examId) return null;

  const data = getExamDetailedAnalytics(examId);
  if (!data) return null;

  const {
    exam,
    totalAssigned,
    completedCount,
    notAttemptedCount,
    completionRatePct,
    avgMarks,
    avgPct,
    highestMarks,
    lowestMarks,
    passRatePct,
    cadetResults,
    topicAnalysis,
    difficultyAnalysis,
    aiInsights,
  } = data;

  // Rank Cadets by Score / Percentage
  const rankedCadets = [...cadetResults].sort((a, b) => (b.score || 0) - (a.score || 0));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: 840, maxHeight: "90vh", overflowY: "auto" }} id="printable-exam-report">
        <div className="modal-header" style={{ borderBottom: "2px solid #174675", paddingBottom: 14 }}>
          <div>
            <div className="badge badge-blue" style={{ fontSize: 11, marginBottom: 4 }}>
              Official Evaluation & Analytics Report
            </div>
            <h2 className="modal-title" style={{ fontSize: 20, color: "#174675" }}>
              📄 {exam.title || exam.examName} Report
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
              Generated on {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })} · NCC Digital Cadet System
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: 24, fontSize: 13.5, color: "#334155" }}>
          {/* Executive Overview KPI Header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Assigned Cadets", value: totalAssigned, color: "#174675", bg: "#e3f0ff" },
              { label: "Completed",       value: `${completedCount} (${completionRatePct}%)`, color: "#166534", bg: "#dcfce7" },
              { label: "Not Attempted",   value: notAttemptedCount, color: "#991b1b", bg: "#fee2e2" },
              { label: "Average Marks",   value: `${avgMarks} / ${exam.totalMarks}`, color: "#1d4ed8", bg: "#dbeafe" },
              { label: "Highest Marks",   value: `${highestMarks}`, color: "#166534", bg: "#dcfce7" },
              { label: "Lowest Marks",    value: `${lowestMarks}`,  color: "#c2410c", bg: "#ffedd5" },
              { label: "Pass Rate",       value: `${passRatePct}%`, color: "#15803d", bg: "#dcfce7" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: kpi.bg, padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Difficulty-wise Performance Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, color: "#174675", borderBottom: "1.5px solid #cbd5e1", paddingBottom: 6, marginBottom: 12 }}>
              🎯 Difficulty-wise Accuracy Analysis
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {difficultyAnalysis.map((d) => (
                <div key={d.difficulty} style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>{d.difficulty} Questions</span>
                    <span style={{ fontWeight: 800, color: d.accuracyPct >= 70 ? "#166534" : "#991b1b" }}>
                      {d.accuracyPct}%
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                    {d.questionCount} Questions in exam · {d.correctCount} correct responses
                  </div>
                  <div style={{ height: 6, background: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${d.accuracyPct}%`, height: "100%", background: d.accuracyPct >= 70 ? "#22c55e" : "#ef4444", borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic-wise Performance Breakdown Table */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, color: "#174675", borderBottom: "1.5px solid #cbd5e1", paddingBottom: 6, marginBottom: 12 }}>
              📚 Topic-wise Performance & Classification
            </h3>
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Topic / Curriculum Module</th>
                  <th>Questions</th>
                  <th>Total Attempts</th>
                  <th>Correct / Incorrect</th>
                  <th>Average %</th>
                  <th>Performance Level</th>
                </tr>
              </thead>
              <tbody>
                {topicAnalysis.map((t) => (
                  <tr key={t.topic}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{t.topic}</td>
                    <td>{t.questionCount}</td>
                    <td>{t.totalAttempts}</td>
                    <td>
                      <span style={{ color: "#166534", fontWeight: 700 }}>{t.correctAnswers}</span> /{" "}
                      <span style={{ color: "#dc2626" }}>{t.incorrectAnswers}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: t.color }}>{t.avgPct}%</td>
                    <td>
                      <span className="badge" style={{ background: t.bg, color: t.color, fontSize: 12 }}>
                        {t.performance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cadet Ranking Leaderboard */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, color: "#174675", borderBottom: "1.5px solid #cbd5e1", paddingBottom: 6, marginBottom: 12 }}>
              🏆 Cadet Performance Ranking
            </h3>
            {rankedCadets.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No cadet exam attempts recorded yet.</p>
            ) : (
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Cadet Name</th>
                    <th>Cadet ID</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCadets.map((c, idx) => (
                    <tr key={c.cadetId}>
                      <td style={{ fontWeight: 800, color: idx === 0 ? "#b45309" : "#475569" }}>
                        {idx === 0 ? "🥇 1st" : idx === 1 ? "🥈 2nd" : idx === 2 ? "🥉 3rd" : `#${idx + 1}`}
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.cadetName}</td>
                      <td><span className="cadet-id-badge">{c.cadetId}</span></td>
                      <td style={{ fontWeight: 700 }}>{c.score} / {exam.totalMarks}</td>
                      <td style={{ fontWeight: 700, color: c.passed ? "#166534" : "#991b1b" }}>{c.pct}%</td>
                      <td>
                        <span className={`badge ${c.passed ? "badge-green" : "badge-red"}`}>
                          {c.passed ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Empirical AI Insights Box */}
          <div style={{ background: "#f0f9ff", border: "1.5px solid #0284c7", borderRadius: 10, padding: 16 }}>
            <h4 style={{ margin: "0 0 8px", color: "#0369a1", fontSize: 14, fontWeight: 800 }}>
              💡 AI-Generated Exam Insights & Action Plan
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {aiInsights.map((insight, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#0f172a" }}>
                  <span>•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Printer size={16} /> Print Exam Report
          </button>
          <button className="btn-primary" onClick={onClose}>Close Report</button>
        </div>
      </div>
    </div>
  );
}
