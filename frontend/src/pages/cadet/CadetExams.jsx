import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Clock, CheckCircle, X, Eye, ShieldAlert, Video, Maximize, AlertCircle } from "lucide-react";

const DEFAULT_EXAMS = [
  {
    id: 1, title: "NCC General Knowledge", duration: 20, totalMarks: 50, passMark: 25, status: "published",
    questions: [
      { id: 1, text: "What does NCC stand for?", options: ["National Cadet Corps", "National Civil Corps", "National Combat Corps", "None"], answer: 0 },
      { id: 2, text: "When was NCC founded?", options: ["1948", "1950", "1947", "1952"], answer: 0 },
      { id: 3, text: "NCC motto is:", options: ["Unity and Discipline", "Serve and Protect", "Duty and Honour", "Strength and Courage"], answer: 0 },
      { id: 4, text: "NCC flag has how many colours?", options: ["3", "2", "4", "5"], answer: 0 },
      { id: 5, text: "The highest NCC certificate is:", options: ["C Certificate", "B Certificate", "A Certificate", "D Certificate"], answer: 0 },
    ],
  },
  {
    id: 2, title: "Drill & Discipline", duration: 15, totalMarks: 40, passMark: 20, status: "published",
    questions: [
      { id: 1, text: "The command 'Savdhan' means:", options: ["Attention", "Stand at ease", "Fall in", "Dismiss"], answer: 0 },
      { id: 2, text: "Parade is conducted in which formation?", options: ["Line", "Column", "Square", "All of the above"], answer: 3 },
      { id: 3, text: "'Vishram' command means:", options: ["Stand at ease", "Attention", "Fall out", "March"], answer: 0 },
    ],
  },
];

function Timer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const urgent = remaining <= 60;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 16, color: urgent ? "#991b1b" : "#174675", background: urgent ? "#fee2e2" : "#e3f0ff", padding: "8px 16px", borderRadius: 8 }}>
      <Clock size={16} />
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

// ── Answer Review ─────────────────────────────────────────────────────────────
function AnswerReview({ exam, userAnswers, onClose }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Answer Review — {exam.title}</h1>
          <p className="page-sub">See correct answers and your responses</p>
        </div>
        <button className="btn-secondary" onClick={onClose}>← Back to Results</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {exam.questions.map((q, qi) => {
          const userAns = userAnswers?.[q.id];
          const isCorrect = userAns === q.answer;
          const isSkipped = userAns === undefined || userAns === null;
          const statusClass = isSkipped ? "skipped" : isCorrect ? "correct" : "wrong";
          return (
            <div key={q.id} className={`review-q ${statusClass}`}>
              <p style={{ fontWeight: 600, color: "#111827", marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: "#174675", marginRight: 8 }}>Q{qi + 1}.</span>{q.text}
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: isSkipped ? "#b45309" : isCorrect ? "#166534" : "#991b1b" }}>
                  {isSkipped ? "⚠️ Skipped" : isCorrect ? "✅ Correct" : "❌ Wrong"}
                </span>
              </p>
              {q.options.map((opt, oi) => {
                const isCorrectOpt = oi === q.answer;
                const isUserOpt    = oi === userAns;
                let cls = "normal";
                if (isCorrectOpt) cls = "correct-ans";
                else if (isUserOpt && !isCorrect) cls = "wrong-ans";
                return (
                  <div key={oi} className={`review-opt ${cls}`}>
                    <span style={{ fontWeight: 700, minWidth: 20 }}>{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {isCorrectOpt && <span style={{ marginLeft: "auto", fontSize: 12 }}>✅ Correct</span>}
                    {isUserOpt && !isCorrect && <span style={{ marginLeft: "auto", fontSize: 12 }}>← Your answer</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CadetExams() {
  const { user } = useAuth();

  const exams = (() => {
    const s = localStorage.getItem("nccExams");
    return s ? JSON.parse(s) : DEFAULT_EXAMS;
  })().filter(e => e.status === "published");

  const [results, setResults] = useState(() => {
    const s = localStorage.getItem(`nccResults_${user?.id}`);
    return s ? JSON.parse(s) : {};
  });

  const [activeExam, setActiveExam]       = useState(null);
  const [answers, setAnswers]             = useState({});
  const [submitted, setSubmitted]         = useState(false);
  const [resultData, setResultData]       = useState(null);
  const [reviewExam, setReviewExam]       = useState(null);
  const [tabViolations, setTabViolations] = useState(0);
  const [securityWarning, setSecurityWarning] = useState(false);

  const startExam = (exam) => {
    setActiveExam(exam);
    setAnswers({});
    setSubmitted(false);
    setResultData(null);
    setReviewExam(null);
    setTabViolations(0);
    setSecurityWarning(false);

    // Initial Live Monitoring session setup
    if (user) {
      localStorage.setItem(`nccActiveExamSession_${user.id}`, JSON.stringify({
        cadetId: user.cadetId || user.username,
        cadetName: user.name,
        examId: exam.id,
        examTitle: exam.title || exam.examName,
        startTime: Date.now(),
        answeredCount: 0,
        totalQuestions: exam.questions?.length || 0,
        tabViolations: 0,
        status: "In Progress"
      }));
    }
  };

  const submitExam = useCallback(() => {
    if (!activeExam) return;
    let score = 0;
    const perQMarks = Math.round(activeExam.totalMarks / (activeExam.questions.length || 1));

    const itemizedResponses = activeExam.questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.answer;
      const qScore = isCorrect ? perQMarks : 0;
      if (isCorrect) score += perQMarks;

      return {
        questionId: q.id,
        text: q.text,
        topic: q.topic || "NCC Basics",
        difficulty: q.difficulty || "Medium",
        selectedAnswer: selected !== undefined ? selected : null,
        correctAnswer: q.answer,
        isCorrect,
        marksObtained: qScore,
        maxMarks: perQMarks,
        submissionTime: new Date().toLocaleTimeString(),
      };
    });

    score = Math.min(score, activeExam.totalMarks);
    const pct    = Math.round((score / activeExam.totalMarks) * 100);
    const passed = score >= activeExam.passMark;

    const result = {
      examId: activeExam.id,
      title: activeExam.title || activeExam.examName,
      score,
      total: activeExam.totalMarks,
      pct,
      passed,
      date: new Date().toLocaleDateString(),
      tabViolations,
      answers: { ...answers },
      itemizedResponses,
    };

    const updated = { ...results, [activeExam.id]: result };
    setResults(updated);
    localStorage.setItem(`nccResults_${user?.id}`, JSON.stringify(updated));
    if (user) {
      localStorage.removeItem(`nccActiveExamSession_${user.id}`);
    }

    setResultData(result);
    setSubmitted(true);
  }, [activeExam, answers, results, user, tabViolations]);

  const closeExam = () => {
    if (user) {
      localStorage.removeItem(`nccActiveExamSession_${user.id}`);
    }
    setActiveExam(null);
    setSubmitted(false);
    setResultData(null);
    setTabViolations(0);
    setSecurityWarning(false);
  };

  // ── Tab Switch Listener for Security Enforcement ────────────────────────────
  useEffect(() => {
    if (!activeExam || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const next = prev + 1;
          const maxAllowed = activeExam.security?.maxTabSwitches || 3;

          if (user) {
            localStorage.setItem(`nccActiveExamSession_${user.id}`, JSON.stringify({
              cadetId: user.cadetId || user.username,
              cadetName: user.name,
              examId: activeExam.id,
              examTitle: activeExam.title || activeExam.examName,
              startTime: Date.now(),
              answeredCount: Object.keys(answers).length,
              totalQuestions: activeExam.questions.length,
              tabViolations: next,
              status: "In Progress"
            }));
          }

          if (next >= maxAllowed && activeExam.security?.autoSubmitOnTabLimit !== false) {
            submitExam();
          } else {
            setSecurityWarning(true);
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeExam, submitted, answers, user, submitExam]);

  // ── Answer review mode ──────────────────────────────────────────────────────
  if (reviewExam) {
    return (
      <AnswerReview
        exam={reviewExam.exam}
        userAnswers={reviewExam.answers}
        onClose={() => setReviewExam(null)}
      />
    );
  }

  // ── Exam list view ──────────────────────────────────────────────────────────
  if (!activeExam) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Examinations</h1>
            <p className="page-sub">Available exams and your results</p>
          </div>
        </div>

        <div className="stats-grid">
          {[
            { label: "Available",  value: exams.length,                                                    color: "#174675", bg: "#e3f0ff" },
            { label: "Attempted",  value: Object.keys(results).length,                                     color: "#166534", bg: "#dcfce7" },
            { label: "Passed",     value: Object.values(results).filter(r => r.passed).length,             color: "#1e40af", bg: "#dbeafe" },
            { label: "Avg Score",  value: Object.values(results).length ? `${Math.round(Object.values(results).reduce((s, r) => s + r.pct, 0) / Object.values(results).length)}%` : "—", color: "#9a3412", bg: "#ffedd5" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}><BookOpen size={20} /></div>
              <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {exams.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No Exams Available</div>
              <div className="empty-state-sub">No published exams yet. Check back later.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {exams.map(exam => {
              const result = results[exam.id];
              return (
                <div key={exam.id} className="card" style={{ borderTop: `4px solid ${result ? (result.passed ? "#22c55e" : "#ef4444") : "#174675"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, color: "#111827", fontSize: 16 }}>{exam.title}</h3>
                    {result && (
                      <span className="badge" style={{ background: result.passed ? "#dcfce7" : "#fee2e2", color: result.passed ? "#166534" : "#991b1b" }}>
                        {result.passed ? "PASS" : "FAIL"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", marginBottom: 16, flexWrap: "wrap" }}>
                    <span>⏱ {exam.duration} min</span>
                    <span>📊 {exam.totalMarks} marks</span>
                    <span>✅ Pass: {exam.passMark}</span>
                    <span>❓ {exam.questions?.length || 0} questions</span>
                  </div>
                  {result && (
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Your Score:</span>
                        <span style={{ fontWeight: 700, color: result.passed ? "#166534" : "#991b1b" }}>{result.score}/{result.total} ({result.pct}%)</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Attempted on {result.date}</div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => startExam(exam)}>
                      {result ? "Retake Exam" : "Start Exam"}
                    </button>
                    {result && exam.questions && (
                      <button
                        className="btn-secondary"
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                        onClick={() => setReviewExam({ exam, answers: result.answers || {} })}
                      >
                        <Eye size={15} /> Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Result view ─────────────────────────────────────────────────────────────
  if (submitted && resultData) {
    return (
      <div className="page">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{resultData.passed ? "🎉" : "😔"}</div>
          <h2 style={{ color: resultData.passed ? "#166534" : "#991b1b", margin: "0 0 8px" }}>
            {resultData.passed ? "Congratulations! You Passed!" : "Better Luck Next Time"}
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>{resultData.title}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              ["Score", `${resultData.score} / ${resultData.total}`],
              ["Percentage", `${resultData.pct}%`],
              ["Status", resultData.passed ? "PASS ✅" : "FAIL ❌"],
              ["Date", resultData.date],
            ].map(([label, value]) => (
              <div key={label} className="profile-field">
                <div className="profile-field-label">{label}</div>
                <div className="profile-field-value" style={{ color: label === "Status" ? (resultData.passed ? "#166534" : "#991b1b") : "#111827" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 12, background: "#e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ width: `${resultData.pct}%`, height: "100%", background: resultData.passed ? "#22c55e" : "#ef4444", borderRadius: 10 }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" style={{ flex: 1 }}
              onClick={() => setReviewExam({ exam: activeExam, answers: { ...answers } })}
            >
              <Eye size={15} style={{ marginRight: 6 }} />Review Answers
            </button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={closeExam}>Back to Exams</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Exam taking view ────────────────────────────────────────────────────────
  const answered = Object.keys(answers).length;
  const total    = activeExam.questions.length;

  return (
    <div className="page">
      {/* Security Proctoring Status Header Bar */}
      <div style={{ background: "#0f172a", color: "white", padding: "10px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, background: "#166534", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
            <Video size={14} /> AI Camera Proctoring Active
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, background: tabViolations > 0 ? "#991b1b" : "#1e293b", padding: "4px 10px", borderRadius: 6, border: "1px solid #334155" }}>
            <ShieldAlert size={14} /> Tab Switches: <b>{tabViolations} / {activeExam.security?.maxTabSwitches || 3}</b>
          </span>
        </div>
        <button
          className="btn-secondary"
          style={{ fontSize: 11, padding: "4px 10px", background: "#334155", color: "white", border: "none" }}
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen();
          }}
        >
          <Maximize size={13} style={{ marginRight: 4 }} /> Toggle Fullscreen
        </button>
      </div>

      {/* Security Warning Modal Overlay */}
      {securityWarning && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal" style={{ maxWidth: 440, border: "2px solid #dc2626" }}>
            <div className="modal-header" style={{ background: "#fee2e2", color: "#991b1b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={22} />
                <h3 style={{ margin: 0, fontSize: 16 }}>⚠️ Security Violation Warning</h3>
              </div>
            </div>
            <div className="modal-body" style={{ padding: 20 }}>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#1e293b" }}>
                You switched tabs or lost window focus.
              </p>
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: 12, borderRadius: 8, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                Tab Switch Count: {tabViolations} of {activeExam.security?.maxTabSwitches || 3} Allowed.
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 12, color: "#64748b" }}>
                Reaching the maximum allowed tab switches will result in immediate automatic exam submission.
              </p>
            </div>
            <div className="modal-footer" style={{ padding: "12px 20px" }}>
              <button className="btn-primary" style={{ background: "#dc2626", width: "100%" }} onClick={() => setSecurityWarning(false)}>
                I Understand & Return to Exam
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: "#111827", fontSize: 17 }}>{activeExam.title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{answered}/{total} answered · {activeExam.totalMarks} marks</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Timer seconds={activeExam.duration * 60} onExpire={submitExam} />
            <button className="btn-secondary" onClick={closeExam}><X size={15} /></button>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 6, background: "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ width: `${(answered / total) * 100}%`, height: "100%", background: "#174675", borderRadius: 10, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {activeExam.questions.map((q, qi) => (
          <div key={q.id} className="card">
            <p style={{ fontWeight: 600, color: "#111827", marginBottom: 14, fontSize: 15 }}>
              <span style={{ color: "#174675", marginRight: 8 }}>Q{qi + 1}.</span>{q.text}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button key={oi} onClick={() => setAnswers(a => ({ ...a, [q.id]: oi }))}
                    style={{
                      textAlign: "left", padding: "12px 16px", borderRadius: 8,
                      border: `2px solid ${selected ? "#174675" : "#e5e7eb"}`,
                      background: selected ? "#e3f0ff" : "white",
                      color: selected ? "#174675" : "#374151",
                      fontWeight: selected ? 600 : 400, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontWeight: 700, marginRight: 10, color: selected ? "#174675" : "#9ca3af" }}>
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            {answered < total
              ? `⚠️ ${total - answered} question(s) unanswered`
              : <span style={{ color: "#166534" }}>✅ All questions answered</span>}
          </p>
          <button className="btn-primary" onClick={submitExam} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={16} />Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}
