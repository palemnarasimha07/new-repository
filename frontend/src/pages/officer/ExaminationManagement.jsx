import { useState, useEffect, useRef } from "react";
import { Plus, X, FileText, BookOpen, Trash2, CheckSquare, Square, ArrowRight, Sparkles, RefreshCw, Upload, FileCheck, Layers, AlertTriangle, TrendingUp, BarChart2, UserCheck, Printer, Eye, CheckCircle, Award, Radio, ShieldAlert, Lock, ShieldCheck, CheckCircle2, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import CadetPerformanceModal from "../../components/CadetPerformanceModal";
import ExamReportModal from "../../components/ExamReportModal";
import { getExamDetailedAnalytics, getBatchOverallAnalytics } from "../../services/examAnalyticsEngine";

// ── DEFAULT QUESTION BANK ───────────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
  { id: 1,  subject: "NCC", topic: "NCC Basics",         question: "What does NCC stand for?",                        optionA: "National Cadet Corps", optionB: "National Civil Corps",    optionC: "National Command Corps",  optionD: "National Cadet Committee", answer: "A", difficulty: "Easy"   },
  { id: 2,  subject: "NCC", topic: "NCC Basics",         question: "What is the motto of NCC?",                       optionA: "Jai Hind",             optionB: "Unity and Discipline",    optionC: "Service and Duty",        optionD: "Nation First",             answer: "B", difficulty: "Easy"   },
  { id: 3,  subject: "NCC", topic: "NCC Basics",         question: "NCC is associated with which ministry?",          optionA: "Ministry of Defence",  optionB: "Ministry of Railways",    optionC: "Ministry of Finance",     optionD: "Ministry of Agriculture",  answer: "A", difficulty: "Medium" },
  { id: 4,  subject: "NCC", topic: "Drill & Discipline", question: "Which activity is common in NCC training?",       optionA: "Drill",                optionB: "Cooking only",            optionC: "Accounting",              optionD: "Banking",                  answer: "A", difficulty: "Easy"   },
  { id: 5,  subject: "NCC", topic: "Drill & Discipline", question: "What quality does NCC training develop?",         optionA: "Discipline",           optionB: "Laziness",                optionC: "Carelessness",            optionD: "Indifference",             answer: "A", difficulty: "Easy"   },
  { id: 6,  subject: "NCC", topic: "NCC History",        question: "In which year was the NCC established in India?", optionA: "1948",                 optionB: "1950",                    optionC: "1947",                    optionD: "1952",                     answer: "A", difficulty: "Medium" },
  { id: 7,  subject: "NCC", topic: "Leadership",         question: "Which quality is important for an NCC leader?",  optionA: "Leadership",           optionB: "Negligence",              optionC: "Dishonesty",              optionD: "Indiscipline",             answer: "A", difficulty: "Medium" },
  { id: 8,  subject: "NCC", topic: "Drill & Discipline", question: "What is a key principle of NCC?",                optionA: "Unity and Discipline", optionB: "Competition only",        optionC: "Individualism",           optionD: "Relaxation",               answer: "A", difficulty: "Easy"   },
  { id: 9,  subject: "NCC", topic: "Drill & Discipline", question: "What does drill help cadets develop?",            optionA: "Discipline and coordination", optionB: "Cooking skills",  optionC: "Typing speed",            optionD: "Accounting skills",        answer: "A", difficulty: "Medium" },
  { id: 10, subject: "NCC", topic: "First Aid",          question: "First step when helping an injured person?",     optionA: "Ensure area is safe",  optionB: "Leave immediately",       optionC: "Ignore the person",       optionD: "Take photographs",         answer: "A", difficulty: "Medium" },
  { id: 11, subject: "NCC", topic: "Leadership",         question: "A good leader should primarily:",                 optionA: "Guide the team",       optionB: "Avoid responsibility",    optionC: "Ignore team members",     optionD: "Create confusion",         answer: "A", difficulty: "Hard"   },
  { id: 12, subject: "NCC", topic: "Weapon Training",    question: "What is the caliber of the standard .22 Deluxe Rifle used in NCC?", optionA: ".22 inches", optionB: "7.62 mm",           optionC: "5.56 mm",                 optionD: "9 mm",                     answer: "A", difficulty: "Medium" },
  { id: 13, subject: "NCC", topic: "Weapon Training",    question: "What is the effective range of a .22 Deluxe Rifle?", optionA: "25 yards",          optionB: "100 yards",               optionC: "500 yards",               optionD: "1000 yards",               answer: "A", difficulty: "Medium" },
  { id: 14, subject: "NCC", topic: "Leadership",         question: "Teamwork is important because it:",              optionA: "Helps work toward a common goal", optionB: "Creates isolation", optionC: "Reduces communication", optionD: "Prevents cooperation",     answer: "A", difficulty: "Hard"   },
  { id: 15, subject: "NCC", topic: "NCC History",        question: "Who was the first Director General of NCC?",     optionA: "Col. G.G. Bewoor",     optionB: "Gen. K.M. Cariappa",      optionC: "Gen. Sam Manekshaw",      optionD: "Adm. R.D. Katari",         answer: "A", difficulty: "Hard"   },
];

const TOPIC_PRESETS = [
  "NCC History",
  "Drill & Discipline",
  "Weapon Training",
  "Leadership",
  "Map Reading",
  "First Aid",
  "Fieldcraft & Battlecraft",
  "Health & Hygiene",
  "Military History",
  "Obstacle Training"
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const DIFF_COLORS = {
  Easy: { bg: "#dcfce7", color: "#166534" },
  Medium: { bg: "#fef9c3", color: "#854d0e" },
  Hard: { bg: "#fee2e2", color: "#991b1b" }
};

const EMPTY_Q = { subject: "NCC", topic: "", question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A", difficulty: "Easy" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate dynamic fallback MCQs for a topic if question pool is short
function generateDynamicTopicQuestions(topicName, requiredCount, currentQuestions) {
  const existing = currentQuestions.filter(q => q.topic.toLowerCase() === topicName.toLowerCase());
  if (existing.length >= requiredCount) return existing;

  const needed = requiredCount - existing.length;
  const newGenerated = [];
  
  const templates = [
    { q: `What is a primary objective of studying ${topicName}?`, a: `Developing practical knowledge and cadet skills in ${topicName}`, b: "Commercial sales", c: "Entertainment", d: "Accounting", ans: "A" },
    { q: `Which key principle governs effective execution of ${topicName}?`, a: "Strict adherence to safety guidelines and rules", b: "Individual guesswork", c: "Ignoring officer instructions", d: "Informal procedures", ans: "A" },
    { q: `In NCC training, ${topicName} is essential for building:`, a: "Discipline, teamwork, and operational readiness", b: "Financial investments", c: "Personal isolation", d: "Random activities", ans: "A" },
    { q: `What is the standard procedure when practicing ${topicName}?`, a: "Follow command orders and safety protocols", b: "Act without supervision", c: "Skip basic instructions", d: "Leave early", ans: "A" },
    { q: `Cadets undergoing training in ${topicName} are assessed on:`, a: "Accuracy, discipline, and execution quality", b: "Typing speed", c: "Speed eating", d: "Loudness only", ans: "A" },
    { q: `During field exercises, ${topicName} principles ensure:`, a: "Safety and coordinated team movement", b: "Confusion and delay", c: "Individual competition", d: "Disorganization", ans: "A" },
    { q: `Which certificate exam heavily tests concepts of ${topicName}?`, a: "NCC 'B' and 'C' Certificate Exams", b: "Driving License Exam", c: "Bank PO Exam", d: "SAT Exam", ans: "A" },
    { q: `What quality should a senior cadet display during ${topicName} sessions?`, a: "Exemplary conduct and guidance to juniors", b: "Indifference", c: "Absenteeism", d: "Strict silence without action", ans: "A" },
    { q: `What is the recommended frequency for ${topicName} practice parades?`, a: "Regular weekly parade sessions", b: "Once every 5 years", c: "Never", d: "Only during vacations", ans: "A" },
    { q: `How does mastery in ${topicName} benefit a cadet's overall personality?`, a: "Fosters confidence, leadership, and national service mindset", b: "Causes fatigue only", c: "No benefit", d: "Promotes laziness", ans: "A" },
  ];

  for (let i = 0; i < needed; i++) {
    const tmpl = templates[i % templates.length];
    newGenerated.push({
      id: Date.now() + Math.floor(Math.random() * 100000) + i,
      subject: "NCC",
      topic: topicName,
      question: tmpl.q,
      optionA: tmpl.a,
      optionB: tmpl.b,
      optionC: tmpl.c,
      optionD: tmpl.d,
      answer: tmpl.ans,
      difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard"
    });
  }

  return [...existing, ...newGenerated];
}

export default function ExaminationManagement() {
  const [tab, setTab] = useState("generator");
  
  // Persistent state
  const [questions, setQuestions] = useState(() => {
    const s = localStorage.getItem("nccQuestions");
    return s ? JSON.parse(s) : DEFAULT_QUESTIONS;
  });

  const [exams, setExams] = useState(() => {
    const s = localStorage.getItem("nccExams");
    return s ? JSON.parse(s) : [];
  });

  // Persistent Material Analysis state (shared across tab refresh & Exam Generator)
  const [materials, setMaterials] = useState(() => {
    const s = localStorage.getItem("nccAnalyzedMaterials");
    if (s) {
      try { return JSON.parse(s); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Generator Mode toggle inside Exam Generator tab: "topic" | "standard"
  const [generatorMode, setGeneratorMode] = useState("topic");

  // Exam generator settings
  const [wizardStep, setWizardStep] = useState(1);
  const [settings, setSettings] = useState({
    examName: "",
    subject: "NCC",
    totalQuestions: 10,
    marksPerQuestion: 2,
    passMarkPct: 40,
    easy: 4,
    medium: 4,
    hard: 2,
    duration: 30,
    security: {
      maxTabSwitches: 3,
      autoSubmitOnTabLimit: true,
      forceFullscreen: false,
      shuffleQuestions: true,
      proctoringCamera: true
    }
  });

  const [paper, setPaper]       = useState(null);
  const [genError, setGenError] = useState("");
  // Analytics & Report Modals state
  const [selectedCadetForModal, setSelectedCadetForModal] = useState(null);
  const [selectedExamForReport, setSelectedExamForReport] = useState(null);
  const [analyticsExamId, setAnalyticsExamId]             = useState(null);
  const [cadetSearchQuery, setCadetSearchQuery]           = useState("");
  const [cadetSortFilter, setCadetSortFilter]             = useState("all");

  // Question Bank search/filter/modal
  const [showQForm, setShowQForm] = useState(false);
  const [qForm, setQForm]         = useState(EMPTY_Q);
  const [qSearch, setQSearch]     = useState("");
  const [qDiff, setQDiff]         = useState("All");

  // Material upload temporary state
  const fileInputRef                    = useRef(null);
  const [matFile, setMatFile]           = useState(null);
  const [matAnalyzing, setMatAnalyzing] = useState(false);
  const [matError, setMatError]         = useState("");

  // Sync states to localStorage
  useEffect(() => { localStorage.setItem("nccQuestions", JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem("nccExams", JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem("nccAnalyzedMaterials", JSON.stringify(materials)); }, [materials]);

  // ── DYNAMIC DOCUMENT TOPIC ANALYSIS ─────────────────────────────────────────
  const extractTopicsFromDocument = (text, fileName) => {
    const lowerText = text.toLowerCase();
    const detected = [];

    // 1. Check matching presets & question bank topics against text
    const allKnownTopics = [...new Set([...TOPIC_PRESETS, ...questions.map(q => q.topic).filter(Boolean)])];
    
    allKnownTopics.forEach(topic => {
      const keywords = topic.toLowerCase().split(/\s+/).filter(k => k.length > 2);
      let occurrences = 0;
      keywords.forEach(kw => {
        const matches = lowerText.match(new RegExp(kw, "g"));
        if (matches) occurrences += matches.length;
      });

      const avail = questions.filter(q => q.topic.toLowerCase() === topic.toLowerCase()).length;
      
      if (occurrences > 0 || avail > 0) {
        detected.push({
          topic,
          occurrences,
          available: Math.max(avail, 5),
          selected: true,
          qCount: avail >= 5 ? 5 : avail > 0 ? avail : 5
        });
      }
    });

    // 2. If no topics matched via keywords, fall back to core NCC topics
    if (detected.length === 0) {
      ["NCC History", "Drill & Discipline", "Weapon Training", "Leadership"].forEach(tName => {
        const avail = questions.filter(q => q.topic.toLowerCase() === tName.toLowerCase()).length;
        detected.push({
          topic: tName,
          occurrences: 1,
          available: Math.max(avail, 5),
          selected: true,
          qCount: 5
        });
      });
    }

    // Sort topics by relevance/frequency
    detected.sort((a, b) => b.occurrences - a.occurrences);

    // Return structured material object
    return {
      id: "mat_" + Date.now(),
      fileName: fileName || "NCC Study Document.pdf",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      fileSize: `${Math.max(12, Math.round(text.length / 1024))} KB`,
      topics: detected.map((t, idx) => ({
        id: `top_${idx}_${Date.now()}`,
        topic: t.topic,
        available: t.available,
        selected: true,
        qCount: t.qCount
      }))
    };
  };

  // Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMatFile(file);
    setMatError("");
    setMatAnalyzing(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result || "";
      setTimeout(() => {
        const newMaterial = extractTopicsFromDocument(text, file.name);
        setMaterials(prev => [newMaterial, ...prev.filter(m => m.fileName !== file.name)]);
        setMatAnalyzing(false);
      }, 700);
    };
    reader.onerror = () => {
      setMatAnalyzing(false);
      setMatError("Could not read file. Please upload a .txt or .pdf (text-based) file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Toggle topic selection inside a specific material
  const toggleMaterialTopic = (docId, topicId) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== docId) return m;
      return {
        ...m,
        topics: m.topics.map(t => t.id === topicId ? { ...t, selected: !t.selected } : t)
      };
    }));
  };

  // Set topic question count inside a specific material
  const setMaterialTopicQCount = (docId, topicId, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setMaterials(prev => prev.map(m => {
      if (m.id !== docId) return m;
      return {
        ...m,
        topics: m.topics.map(t => t.id === topicId ? { ...t, qCount: num } : t)
      };
    }));
  };

  // Select / Deselect all topics for a document
  const toggleAllTopicsForDoc = (docId, selectState) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== docId) return m;
      return {
        ...m,
        topics: m.topics.map(t => ({ ...t, selected: selectState }))
      };
    }));
  };

  // Delete an analyzed document
  const deleteMaterial = (docId) => {
    if (window.confirm("Remove this analyzed material and its detected topics?")) {
      setMaterials(prev => prev.filter(m => m.id !== docId));
    }
  };

  // Gather all selected topics across all materials for the Exam Generator
  const allSelectedMaterialTopics = materials.flatMap(m =>
    m.topics.filter(t => t.selected).map(t => ({
      ...t,
      docId: m.id,
      docName: m.fileName
    }))
  );

  // Total questions sum across all selected topics
  const totalSuggestedQuestionsSum = allSelectedMaterialTopics.reduce((sum, t) => sum + (parseInt(t.qCount) || 0), 0);

  // ── DUAL BLUEPRINT VALIDATION ────────────────────────────────────────────────
  const diffSum = Number(settings.easy) + Number(settings.medium) + Number(settings.hard);
  const targetTotal = Number(settings.totalQuestions);
  const isDifficultyValid = diffSum === targetTotal;
  const isTopicSumValid   = totalSuggestedQuestionsSum === targetTotal;
  const isBlueprintValid  = isDifficultyValid && isTopicSumValid;

  // ── GENERATE EXAM FROM SELECTED TOPICS ─────────────────────────────────────
  const generateExamFromTopics = () => {
    setGenError("");

    if (!settings.examName.trim()) {
      setGenError("Please enter an exam title.");
      return;
    }

    if (allSelectedMaterialTopics.length === 0) {
      setGenError("Please select at least one topic from the uploaded material.");
      return;
    }

    if (!isTopicSumValid) {
      setGenError(`Topic Question Sum (${totalSuggestedQuestionsSum}) does not match Total Questions (${targetTotal}). Adjust topic question counts.`);
      return;
    }

    if (!isDifficultyValid) {
      setGenError(`Difficulty Question Sum (${diffSum}: Easy ${settings.easy} + Medium ${settings.medium} + Hard ${settings.hard}) does not match Total Questions (${targetTotal}). Adjust difficulty values.`);
      return;
    }

    let examQuestionPool = [];
    let updatedQuestionsBank = [...questions];

    for (const item of allSelectedMaterialTopics) {
      const numRequested = parseInt(item.qCount) || 0;
      if (numRequested <= 0) continue;

      // Ensure question bank has enough questions for this topic
      const topicQs = generateDynamicTopicQuestions(item.topic, numRequested, updatedQuestionsBank);
      
      // Update local question bank state if new questions were auto-generated
      if (topicQs.length > updatedQuestionsBank.filter(q => q.topic.toLowerCase() === item.topic.toLowerCase()).length) {
        const newlyAdded = topicQs.filter(tq => !updatedQuestionsBank.some(uq => uq.id === tq.id));
        updatedQuestionsBank = [...updatedQuestionsBank, ...newlyAdded];
      }

      // Pick required number of questions randomly for this topic
      const picked = shuffle(topicQs).slice(0, numRequested);
      examQuestionPool = [...examQuestionPool, ...picked];
    }

    // Assign difficulty ratio proportionally to final questions
    const finalQuestions = shuffle(examQuestionPool).map((q, idx) => {
      let assignedDiff = q.difficulty || "Medium";
      if (idx < Number(settings.easy)) assignedDiff = "Easy";
      else if (idx < Number(settings.easy) + Number(settings.medium)) assignedDiff = "Medium";
      else assignedDiff = "Hard";

      return {
        ...q,
        difficulty: assignedDiff,
        questionNumber: idx + 1
      };
    });

    if (updatedQuestionsBank.length > questions.length) {
      setQuestions(updatedQuestionsBank);
    }

    const examTitle = settings.examName.trim() || `NCC Blueprint Exam (${new Date().toLocaleDateString()})`;
    const marksPerQ = parseInt(settings.marksPerQuestion) || 2;
    const durationMins = parseInt(settings.duration) || 30;

    const newPaper = {
      id: Date.now(),
      examName: examTitle,
      subject: "NCC",
      duration: durationMins,
      marksPerQuestion: marksPerQ,
      totalQuestions: finalQuestions.length,
      totalMarks: finalQuestions.length * marksPerQ,
      easy: Number(settings.easy),
      medium: Number(settings.medium),
      hard: Number(settings.hard),
      questions: finalQuestions,
      topicBreakdown: allSelectedMaterialTopics.map(t => ({ topic: t.topic, count: t.qCount, source: t.docName })),
      createdAt: new Date().toLocaleString(),
      status: "Draft",
      generatorType: "Material & Difficulty Blueprint"
    };

    setPaper(newPaper);
  };

  // ── STANDARD DIFFICULTY GENERATOR ──────────────────────────────────────────
  const easyCount   = questions.filter(q => q.difficulty === "Easy").length;
  const mediumCount = questions.filter(q => q.difficulty === "Medium").length;
  const hardCount   = questions.filter(q => q.difficulty === "Hard").length;

  const totalDiff = Number(settings.easy) + Number(settings.medium) + Number(settings.hard);
  const totalMarks = Number(settings.totalQuestions) * Number(settings.marksPerQuestion);

  const generateStandardPaper = () => {
    setGenError("");
    const { examName, subject, totalQuestions, easy, medium, hard, marksPerQuestion, duration } = settings;
    const t = Number(totalQuestions), e = Number(easy), m = Number(medium), h = Number(hard);

    if (!examName.trim()) { setGenError("Please enter exam name."); return; }
    if (e + m + h !== t)  { setGenError(`Easy(${e}) + Medium(${m}) + Hard(${h}) must equal Total(${t}).`); return; }

    const eQ = shuffle(questions.filter(q => q.difficulty === "Easy"   && q.subject === subject));
    const mQ = shuffle(questions.filter(q => q.difficulty === "Medium" && q.subject === subject));
    const hQ = shuffle(questions.filter(q => q.difficulty === "Hard"   && q.subject === subject));

    if (eQ.length < e) { setGenError(`Not enough Easy questions. Available: ${eQ.length}`); return; }
    if (mQ.length < m) { setGenError(`Not enough Medium questions. Available: ${mQ.length}`); return; }
    if (hQ.length < h) { setGenError(`Not enough Hard questions. Available: ${hQ.length}`); return; }

    const final = shuffle([...eQ.slice(0, e), ...mQ.slice(0, m), ...hQ.slice(0, h)])
      .map((q, i) => ({ ...q, questionNumber: i + 1 }));

    const newPaper = {
      id: Date.now(),
      examName,
      subject,
      duration: Number(duration),
      marksPerQuestion: Number(marksPerQuestion),
      totalQuestions: t,
      totalMarks,
      easy: e, medium: m, hard: h,
      questions: final,
      createdAt: new Date().toLocaleString(),
      status: "Draft",
      generatorType: "Standard Difficulty"
    };
    setPaper(newPaper);
  };

  // Publish Paper
  const publishExam = () => {
    if (!paper) return;

    // Convert questions format to CadetExams schema format
    const formattedQuestions = paper.questions.map((q, idx) => ({
      id: q.id || idx + 1,
      text: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      answer: q.answer === "A" ? 0 : q.answer === "B" ? 1 : q.answer === "C" ? 2 : 3,
      topic: q.topic,
      difficulty: q.difficulty
    }));

    const published = {
      id: paper.id,
      title: paper.examName,
      examName: paper.examName,
      subject: paper.subject || "NCC",
      duration: paper.duration,
      totalMarks: paper.totalMarks,
      passMark: Math.ceil(paper.totalMarks * ((settings.passMarkPct || 40) / 100)),
      totalQuestions: paper.totalQuestions,
      marksPerQuestion: paper.marksPerQuestion,
      questions: formattedQuestions,
      status: "published",
      createdAt: paper.createdAt,
      source: paper.generatorType,
      security: settings.security || {
        maxTabSwitches: 3,
        autoSubmitOnTabLimit: true,
        forceFullscreen: false,
        shuffleQuestions: true,
        proctoringCamera: true
      }
    };

    setExams(prev => [published, ...prev]);

    // Append audit log
    try {
      const logs = JSON.parse(localStorage.getItem("nccAuditLogs") || "[]");
      localStorage.setItem("nccAuditLogs", JSON.stringify([
        {
          id: Date.now(),
          user: "Officer",
          role: "officer",
          action: `Published Exam "${published.title}" (${published.totalQuestions} Qs, ${published.totalMarks} Marks, Security Monitored)`,
          timestamp: new Date().toLocaleString("en-IN")
        },
        ...logs
      ]));
    } catch (e) {
      console.error(e);
    }

    setPaper(null);
    alert("🚀 Exam published successfully with Security & Proctoring controls enabled! Cadets can now attempt this exam in their portal.");
  };

  const deleteExam = (id) => {
    if (window.confirm("Delete this exam?")) setExams(exams.filter(e => e.id !== id));
  };

  const saveQuestion = (e) => {
    e.preventDefault();
    if (!qForm.question || !qForm.optionA || !qForm.optionB || !qForm.optionC || !qForm.optionD) {
      alert("Please fill all fields."); return;
    }
    setQuestions([...questions, { id: Date.now(), ...qForm }]);
    setQForm(EMPTY_Q);
    setShowQForm(false);
  };

  const deleteQuestion = (id) => {
    if (window.confirm("Delete this question?")) setQuestions(questions.filter(q => q.id !== id));
  };

  const filteredQ = questions.filter(q => {
    const matchSearch = `${q.question} ${q.topic}`.toLowerCase().includes(qSearch.toLowerCase());
    const matchDiff = qDiff === "All" || q.difficulty === qDiff;
    return matchSearch && matchDiff;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Examination Management</h1>
          <p className="page-sub">Analyze study material, create topic-based exams, and publish tests for Cadets</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        {[
          { key: "generator", label: "⚡ Exam Generator & Blueprint" },
          { key: "live",      label: "📡 Live Monitoring" },
          { key: "analytics", label: "📊 Exam Analytics & Reports" },
          { key: "material",  label: `📄 Material Analysis (${materials.length})` },
          { key: "exams",     label: `📝 Published Exams (${exams.length})` },
          { key: "bank",      label: `📚 Question Bank (${questions.length})` },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? "tab-active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EXAM GENERATOR TAB ── */}
      {tab === "generator" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Mode Switcher */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: "#174675" }}>⚡ Exam Generation Method</h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Select how you want to build your NCC examination paper</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`btn-${generatorMode === "topic" ? "primary" : "secondary"}`}
                  style={{ padding: "8px 16px", fontSize: 13 }}
                  onClick={() => setGeneratorMode("topic")}
                >
                  <Sparkles size={15} style={{ marginRight: 6 }} /> Suggested Topics (From Uploaded Material)
                </button>
                <button
                  className={`btn-${generatorMode === "standard" ? "primary" : "secondary"}`}
                  style={{ padding: "8px 16px", fontSize: 13 }}
                  onClick={() => setGeneratorMode("standard")}
                >
                  <Layers size={15} style={{ marginRight: 6 }} /> Standard Difficulty Distribution
                </button>
              </div>
            </div>
          </div>

          {/* MODE 1: SUGGESTED TOPICS FROM UPLOADED MATERIAL */}
          {generatorMode === "topic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* NO MATERIAL ANALYZED EMPTY STATE */}
              {materials.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                  <h3 style={{ color: "#174675", margin: "0 0 8px", fontSize: 18 }}>Upload and analyze study material first to get topic suggestions.</h3>
                  <p style={{ color: "#6b7280", maxWidth: 520, margin: "0 auto 20px", fontSize: 14 }}>
                    Upload your NCC study material (PDF/TXT) in the Material Analysis section. The system will automatically extract chapters and topics so you can generate targeted exams.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ padding: "10px 24px" }}
                    onClick={() => setTab("material")}
                  >
                    <Upload size={16} style={{ marginRight: 8 }} /> Go to Material Analysis & Upload PDF
                  </button>
                </div>
              ) : (
                <>
                  {/* TOPIC SELECTION & QUESTION DISTRIBUTION BY DOCUMENT */}
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <h3 className="card-title" style={{ margin: 0 }}>📚 Suggested Topics from Uploaded Material</h3>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                          Select topics from your uploaded documents and enter the required question count for each topic.
                        </p>
                      </div>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: "6px 14px" }}
                        onClick={() => setTab("material")}
                      >
                        <Plus size={14} style={{ marginRight: 4 }} /> Upload Another Document
                      </button>
                    </div>

                    {/* LOOP OVER UPLOADED DOCUMENTS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {materials.map(doc => {
                        const docSelectedCount = doc.topics.filter(t => t.selected).length;
                        const docTotalQ = doc.topics.filter(t => t.selected).reduce((s, t) => s + (parseInt(t.qCount) || 0), 0);

                        return (
                          <div key={doc.id} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "white" }}>
                            {/* Document Header */}
                            <div style={{ background: "#f8fafc", padding: "12px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <FileText size={18} style={{ color: "#174675" }} />
                                <div>
                                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{doc.fileName}</span>
                                  <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 10 }}>Uploaded {doc.uploadedAt} • {doc.fileSize}</span>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 13, color: "#1e40af", fontWeight: 600 }}>
                                  {docSelectedCount} of {doc.topics.length} topics selected ({docTotalQ} Qs)
                                </span>
                                <button
                                  className="btn-secondary"
                                  style={{ fontSize: 11, padding: "4px 10px" }}
                                  onClick={() => toggleAllTopicsForDoc(doc.id, true)}
                                >Select All</button>
                                <button
                                  className="btn-secondary"
                                  style={{ fontSize: 11, padding: "4px 10px" }}
                                  onClick={() => toggleAllTopicsForDoc(doc.id, false)}
                                >Deselect All</button>
                              </div>
                            </div>

                            {/* Topics Table */}
                            <div style={{ overflowX: "auto" }}>
                              <table className="data-table" style={{ margin: 0 }}>
                                <thead>
                                  <tr>
                                    <th style={{ width: 44 }}>Select</th>
                                    <th>Detected Topic / Chapter</th>
                                    <th>Available Questions</th>
                                    <th style={{ width: 220 }}>Number of Questions Required</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {doc.topics.map(t => (
                                    <tr key={t.id} style={{ background: t.selected ? "#ffffff" : "#f9fafb", opacity: t.selected ? 1 : 0.5 }}>
                                      <td>
                                        <button
                                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: t.selected ? "#174675" : "#9ca3af" }}
                                          onClick={() => toggleMaterialTopic(doc.id, t.id)}
                                        >
                                          {t.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                      </td>
                                      <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <span className="badge badge-blue" style={{ fontSize: 13, padding: "4px 10px" }}>{t.topic}</span>
                                          <span style={{ fontSize: 12, color: "#9ca3af" }}>from {doc.fileName}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <span style={{ fontSize: 13, color: "#374151" }}>{t.available} available</span>
                                      </td>
                                      <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <input
                                            type="number"
                                            min="0"
                                            disabled={!t.selected}
                                            value={t.qCount}
                                            onChange={e => setMaterialTopicQCount(doc.id, t.id, e.target.value)}
                                            style={{
                                              width: 85,
                                              padding: "6px 10px",
                                              border: "1.5px solid #d1d5db",
                                              borderRadius: 6,
                                              fontSize: 14,
                                              fontWeight: 600,
                                              background: t.selected ? "white" : "#e5e7eb"
                                            }}
                                          />
                                          <span style={{ fontSize: 13, color: "#6b7280" }}>questions</span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* EXAM BLUEPRINT CONFIGURATION BOX */}
                  <div className="card" style={{ background: "#f8fafc", border: "2px solid #174675" }}>
                    <h3 className="card-title" style={{ fontSize: 16, color: "#174675", margin: "0 0 4px" }}>
                      📋 Exam Blueprint & Question Distribution Settings
                    </h3>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
                      Define total question count, difficulty distribution, and topic allocations before paper generation.
                    </p>

                    {/* Settings Inputs */}
                    <div className="form-grid">
                      <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">Exam Title *</label>
                        <input
                          className="form-input"
                          placeholder="e.g. NCC Annual Certificate Evaluation 2026"
                          value={settings.examName}
                          onChange={e => setSettings({ ...settings, examName: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Total Questions (T) *</label>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={settings.totalQuestions}
                          onChange={e => setSettings({ ...settings, totalQuestions: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Duration (Minutes)</label>
                        <input
                          className="form-input"
                          type="number"
                          min="5"
                          value={settings.duration}
                          onChange={e => setSettings({ ...settings, duration: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Marks Per Question</label>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={settings.marksPerQuestion}
                          onChange={e => setSettings({ ...settings, marksPerQuestion: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    {/* Difficulty Distribution Blueprint Section */}
                    <h4 style={{ margin: "20px 0 10px", fontSize: 14, color: "#0f172a" }}>
                      🎯 1. Difficulty Level Distribution
                    </h4>
                    <div className="form-grid">
                      <div className="form-field">
                        <label className="form-label">🟢 Easy Questions</label>
                        <input
                          className="form-input"
                          type="number"
                          min="0"
                          value={settings.easy}
                          onChange={e => setSettings({ ...settings, easy: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">🟡 Medium Questions</label>
                        <input
                          className="form-input"
                          type="number"
                          min="0"
                          value={settings.medium}
                          onChange={e => setSettings({ ...settings, medium: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">🔴 Hard Questions</label>
                        <input
                          className="form-input"
                          type="number"
                          min="0"
                          value={settings.hard}
                          onChange={e => setSettings({ ...settings, hard: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    {/* Topic Question Distribution Breakdown */}
                    <h4 style={{ margin: "20px 0 10px", fontSize: 14, color: "#0f172a" }}>
                      📚 2. Topic Allocation Distribution
                    </h4>
                    {allSelectedMaterialTopics.length === 0 ? (
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>No topics selected. Select topics above to assign question counts.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {allSelectedMaterialTopics.map(t => (
                          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "white", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }}>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>• {t.topic} ({t.docName})</span>
                            <span style={{ fontWeight: 700, color: "#174675" }}>{t.qCount || 0} questions</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dual Validation Status Box */}
                    <div style={{ background: "white", padding: 14, borderRadius: 8, border: "1.5px solid #cbd5e1", margin: "16px 0" }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 8 }}>
                        ⚙️ Blueprint Validation Controls:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>1. Difficulty Sum (Easy {settings.easy} + Medium {settings.medium} + Hard {settings.hard} = {diffSum}):</span>
                          <span className={`badge ${isDifficultyValid ? "badge-green" : "badge-red"}`}>
                            {isDifficultyValid ? `✅ Matches Total (${targetTotal})` : `⚠️ Sum is ${diffSum} (Must be ${targetTotal})`}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>2. Topic Allocation Sum (Selected Topics = {totalSuggestedQuestionsSum}):</span>
                          <span className={`badge ${isTopicSumValid ? "badge-green" : "badge-red"}`}>
                            {isTopicSumValid ? `✅ Matches Total (${targetTotal})` : `⚠️ Sum is ${totalSuggestedQuestionsSum} (Must be ${targetTotal})`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {genError && <div className="login-error" style={{ marginBottom: 14 }}>⚠️ {genError}</div>}

                    <button
                      className="btn-primary"
                      style={{ width: "100%", padding: "12px", fontSize: 15 }}
                      onClick={generateExamFromTopics}
                      disabled={!isBlueprintValid || !settings.examName.trim()}
                    >
                      ⚡ Validate Blueprint & Generate Question Paper ({targetTotal} Questions)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MODE 2: STANDARD DIFFICULTY GENERATOR */}
          {generatorMode === "standard" && (
            <div className="card">
              <h3 className="card-title">📝 Exam Settings</h3>
              <div className="form-grid">
                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Exam Name *</label>
                  <input className="form-input" placeholder="e.g. NCC General Knowledge Exam" value={settings.examName} onChange={e => setSettings({ ...settings, examName: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Total Questions</label>
                  <input className="form-input" type="number" min="1" value={settings.totalQuestions} onChange={e => setSettings({ ...settings, totalQuestions: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Marks Per Question</label>
                  <input className="form-input" type="number" min="1" value={settings.marksPerQuestion} onChange={e => setSettings({ ...settings, marksPerQuestion: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Duration (minutes)</label>
                  <input className="form-input" type="number" min="1" value={settings.duration} onChange={e => setSettings({ ...settings, duration: e.target.value })} />
                </div>
              </div>

              <h3 className="card-title" style={{ marginTop: 20 }}>🎯 Difficulty Distribution</h3>
              <div className="form-grid">
                {[
                  { key: "easy",   label: "🟢 Easy Questions",   count: easyCount   },
                  { key: "medium", label: "🟡 Medium Questions", count: mediumCount },
                  { key: "hard",   label: "🔴 Hard Questions",   count: hardCount   },
                ].map(d => (
                  <div key={d.key} className="form-field">
                    <label className="form-label">{d.label} <span style={{ color: "#9ca3af", fontWeight: 400 }}>(Available: {d.count})</span></label>
                    <input className="form-input" type="number" min="0" value={settings[d.key]} onChange={e => setSettings({ ...settings, [d.key]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div style={{ background: "#f0f4f8", borderRadius: 8, padding: "14px 16px", marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14 }}>
                <span><b>Total Questions:</b> {settings.totalQuestions}</span>
                <span style={{ color: totalDiff === Number(settings.totalQuestions) ? "#166534" : "#991b1b", fontWeight: 700 }}>
                  <b>Difficulty Sum:</b> {totalDiff} {totalDiff !== Number(settings.totalQuestions) ? "⚠️ Must equal total" : "✅"}
                </span>
                <span><b>Total Marks:</b> {totalMarks}</span>
                <span><b>Duration:</b> {settings.duration} min</span>
              </div>

              {genError && <div className="login-error" style={{ marginTop: 12 }}>⚠️ {genError}</div>}

              <button className="btn-primary" style={{ marginTop: 16 }} onClick={generateStandardPaper}>
                ⚡ Generate Question Paper
              </button>
            </div>
          )}

          {/* GENERATED QUESTION PAPER PREVIEW */}
          {paper && (
            <div className="card" id="question-paper" style={{ border: "2px solid #174675" }}>
              <div style={{ textAlign: "center", borderBottom: "2px solid #174675", paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 36 }}>🇮🇳</div>
                <h2 style={{ color: "#174675", margin: "8px 0 4px" }}>National Cadet Corps (NCC)</h2>
                <h3 style={{ margin: "0 0 8px" }}>{paper.examName}</h3>
                <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", fontSize: 14, color: "#374151" }}>
                  <span>📝 Questions: {paper.totalQuestions}</span>
                  <span>📊 Total Marks: {paper.totalMarks}</span>
                  <span>⏱ Duration: {paper.duration} min</span>
                </div>
                {paper.topicBreakdown && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#174675", background: "#e3f0ff", padding: "6px 12px", borderRadius: 6, display: "inline-block" }}>
                    Topics Included: {paper.topicBreakdown.map(t => `${t.topic} (${t.count})`).join(" • ")}
                  </div>
                )}
              </div>

              {paper.questions.map(q => (
                <div key={q.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "#111827" }}>
                    {q.questionNumber}. {q.question}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14, color: "#374151" }}>
                    <div>A. {q.optionA}</div>
                    <div>B. {q.optionB}</div>
                    <div>C. {q.optionC}</div>
                    <div>D. {q.optionD}</div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button className="btn-primary" onClick={publishExam}>🚀 Publish Exam for Cadets</button>
                <button className="btn-secondary" onClick={() => window.print()}>🖨️ Print Question Paper</button>
                <button className="btn-secondary" onClick={() => setPaper(null)}>✖ Clear Preview</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LIVE MONITORING TAB ── */}
      {tab === "live" && (() => {
        const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
        const publishedExams = exams.filter(e => e.status === "published" || e.status === "Published");

        // Construct live session records per cadet
        const liveSessions = cadets.map(c => {
          const activeSessionKey = `nccActiveExamSession_${c.id}`;
          const activeData = JSON.parse(localStorage.getItem(activeSessionKey) || "null");
          const resMap = JSON.parse(localStorage.getItem(`nccResults_${c.id}`) || "{}");
          const latestRes = Object.values(resMap).pop();

          if (activeData) {
            return {
              cadetId: c.cadetId,
              cadetName: c.name,
              wing: c.wing,
              unit: c.unit,
              examTitle: activeData.examTitle || "NCC Exam",
              status: "In Progress",
              progress: `${activeData.answeredCount || 0}/${activeData.totalQuestions || 10}`,
              tabViolations: activeData.tabViolations || 0,
              startTime: activeData.startTime ? new Date(activeData.startTime).toLocaleTimeString() : "Just now",
              sessionId: activeSessionKey,
              userId: c.id
            };
          } else if (latestRes) {
            return {
              cadetId: c.cadetId,
              cadetName: c.name,
              wing: c.wing,
              unit: c.unit,
              examTitle: latestRes.title || "NCC Exam",
              status: latestRes.passed ? "Completed (Passed)" : "Completed (Failed)",
              progress: `${latestRes.score}/${latestRes.total} Marks (${latestRes.pct}%)`,
              tabViolations: latestRes.tabViolations || 0,
              startTime: latestRes.date || "Completed",
              sessionId: null,
              userId: c.id
            };
          } else {
            return {
              cadetId: c.cadetId,
              cadetName: c.name,
              wing: c.wing,
              unit: c.unit,
              examTitle: publishedExams.length ? (publishedExams[0].title || publishedExams[0].examName) : "No Active Exam",
              status: "Not Started",
              progress: "0/0",
              tabViolations: 0,
              startTime: "—",
              sessionId: null,
              userId: c.id
            };
          }
        });

        const activeCount = liveSessions.filter(s => s.status === "In Progress").length;
        const completedCount = liveSessions.filter(s => s.status.includes("Completed")).length;
        const totalViolations = liveSessions.reduce((sum, s) => sum + (s.tabViolations || 0), 0);

        const handleForceSubmit = (sessionId, cadetName) => {
          if (window.confirm(`Force submit exam session for Cadet ${cadetName}?`)) {
            localStorage.removeItem(sessionId);
            alert(`⚠️ Exam session force-submitted for ${cadetName}.`);
            setTab("live");
          }
        };

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              {[
                { label: "LIVE IN PROGRESS", value: activeCount, color: "#0284c7", bg: "#e0f2fe", icon: Radio },
                { label: "COMPLETED ATTEMPTS", value: completedCount, color: "#166534", bg: "#dcfce7", icon: CheckCircle },
                { label: "SECURITY ALERTS / TAB SWITCHES", value: totalViolations, color: totalViolations > 0 ? "#dc2626" : "#166534", bg: totalViolations > 0 ? "#fee2e2" : "#dcfce7", icon: ShieldAlert },
                { label: "ENROLLED CADETS", value: cadets.length, color: "#174675", bg: "#e3f0ff", icon: UserCheck }
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="stat-card" style={{ padding: 14 }}>
                    <div className="stat-icon" style={{ background: s.bg, color: s.color, width: 36, height: 36 }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="stat-value" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
                      <div className="stat-label" style={{ fontSize: 11 }}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: "#174675" }}>📡 Real-Time Proctoring & Live Candidate Monitoring</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Monitors live candidate activity, focus/tab switches, and attempt progress</p>
                </div>
                <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setTab("live")}>
                  <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh Feed
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cadet Name</th>
                      <th>Cadet ID</th>
                      <th>Assigned Exam</th>
                      <th>Status</th>
                      <th>Progress / Score</th>
                      <th>Tab Switch Violations</th>
                      <th>Start Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveSessions.length === 0 ? (
                      <tr><td colSpan={8} className="table-empty">No cadets enrolled for monitoring.</td></tr>
                    ) : liveSessions.map(s => (
                      <tr key={s.cadetId}>
                        <td style={{ fontWeight: 600, color: "#0f172a" }}>{s.cadetName}</td>
                        <td><span className="cadet-id-badge">{s.cadetId}</span></td>
                        <td style={{ fontSize: 13 }}>{s.examTitle}</td>
                        <td>
                          <span className={`badge ${s.status === "In Progress" ? "badge-blue" : s.status.includes("Passed") ? "badge-green" : s.status.includes("Failed") ? "badge-red" : "badge-gray"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{s.progress}</td>
                        <td>
                          <span className={`badge ${s.tabViolations > 0 ? "badge-red" : "badge-green"}`}>
                            {s.tabViolations > 0 ? `⚠️ ${s.tabViolations}/3 Switches` : "🟢 Clean"}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "#64748b" }}>{s.startTime}</td>
                        <td>
                          {s.sessionId ? (
                            <button
                              className="btn-danger"
                              style={{ fontSize: 11, padding: "4px 8px" }}
                              onClick={() => handleForceSubmit(s.sessionId, s.cadetName)}
                            >
                              Force Submit
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EXAM ANALYTICS & REPORTS TAB ── */}
      {tab === "analytics" && (() => {
        const batchData = getBatchOverallAnalytics();
        const activeExamId = analyticsExamId || (exams.length ? exams[0].id : null);
        const examAnalytics = activeExamId ? getExamDetailedAnalytics(activeExamId) : null;

        // Cadet filtering logic
        let filteredCadets = examAnalytics ? examAnalytics.cadetResults : [];
        if (cadetSearchQuery) {
          const q = cadetSearchQuery.toLowerCase();
          filteredCadets = filteredCadets.filter((c) =>
            `${c.cadetName} ${c.cadetId}`.toLowerCase().includes(q)
          );
        }

        if (cadetSortFilter === "highest") {
          filteredCadets.sort((a, b) => (b.score || 0) - (a.score || 0));
        } else if (cadetSortFilter === "lowest") {
          filteredCadets.sort((a, b) => (a.score || 0) - (b.score || 0));
        } else if (cadetSortFilter === "passed") {
          filteredCadets = filteredCadets.filter((c) => c.passed);
        } else if (cadetSortFilter === "failed") {
          filteredCadets = filteredCadets.filter((c) => !c.passed);
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Batch Overall KPI Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              {[
                { label: "EXAMS CONDUCTED",   value: batchData.totalExams,     color: "#174675", bg: "#e3f0ff", icon: BookOpen },
                { label: "CADETS PARTICIPATED", value: batchData.totalCadets,   color: "#166534", bg: "#dcfce7", icon: UserCheck },
                { label: "AVERAGE BATCH SCORE", value: `${batchData.batchAvgScore}%`, color: "#1d4ed8", bg: "#dbeafe", icon: TrendingUp },
                { label: "HIGHEST BATCH SCORE", value: `${batchData.batchHighestScore}%`, color: "#9a3412", bg: "#ffedd5", icon: Award },
                { label: "HIGH PERFORMERS (&ge;80%)", value: batchData.highPerformersCount, color: "#15803d", bg: "#dcfce7", icon: Sparkles },
                { label: "NEEDS IMP. (&lt;60%)", value: batchData.cadetsNeedingImpCount, color: "#b91c1c", bg: "#fee2e2", icon: AlertTriangle },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="stat-card" style={{ padding: "14px" }}>
                    <div className="stat-icon" style={{ background: k.bg, color: k.color, width: 36, height: 36 }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="stat-value" style={{ color: k.color, fontSize: 20 }}>{k.value}</div>
                      <div className="stat-label" style={{ fontSize: 11 }}>{k.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Exam Selector Dropdown Header */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: "#174675" }}>📊 Conducted Exam Detailed Analytics</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Select an exam to analyze topic-wise performance, difficulty accuracy, and rankings</p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <select
                    className="filter-select"
                    style={{ minWidth: 240, padding: "8px 12px", fontWeight: 600 }}
                    value={activeExamId || ""}
                    onChange={(e) => setAnalyticsExamId(e.target.value)}
                  >
                    {exams.length === 0 && <option value="">No exams conducted yet</option>}
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title || ex.examName} ({ex.createdAt || "Published"})
                      </option>
                    ))}
                  </select>

                  {activeExamId && (
                    <button
                      className="btn-primary"
                      style={{ fontSize: 13, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}
                      onClick={() => setSelectedExamForReport(activeExamId)}
                    >
                      <FileText size={15} /> Generate Exam Report
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Analytics Dashboard for Selected Exam */}
            {examAnalytics ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Exam Completion & Participation Chart Card */}
                <div className="card" style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1" }}>
                  <h3 className="card-title" style={{ fontSize: 15, color: "#0f172a", marginBottom: 12 }}>
                    ⏱️ Exam Completion & Participation Rate
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                    <div style={{ background: "white", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Assigned Cadets</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#174675" }}>{examAnalytics.totalAssigned}</div>
                    </div>
                    <div style={{ background: "white", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Completed</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>{examAnalytics.completedCount}</div>
                    </div>
                    <div style={{ background: "white", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Not Attempted</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>{examAnalytics.notAttemptedCount}</div>
                    </div>
                    <div style={{ background: "#e0f2fe", padding: 14, borderRadius: 8, border: "1px solid #7dd3fc" }}>
                      <div style={{ fontSize: 12, color: "#0369a1", fontWeight: 700 }}>Completion Rate</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#0284c7" }}>{examAnalytics.completionRatePct}%</div>
                    </div>
                  </div>
                </div>

                {/* Difficulty-wise Performance Analysis */}
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: 15, color: "#174675", marginBottom: 12 }}>
                    🎯 Difficulty-wise Performance & Accuracy
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {examAnalytics.difficultyAnalysis.map((d) => (
                      <div key={d.difficulty} style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: "#1e293b" }}>{d.difficulty} Questions</span>
                          <span style={{ fontWeight: 800, color: d.accuracyPct >= 70 ? "#166534" : "#991b1b" }}>
                            {d.accuracyPct}% Accuracy
                          </span>
                        </div>
                        <div style={{ height: 8, background: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: `${d.accuracyPct}%`, height: "100%", background: d.accuracyPct >= 70 ? "#22c55e" : "#ef4444", borderRadius: 10 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic-wise Performance Table & Recharts Bar Chart */}
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: 15, color: "#174675", marginBottom: 12 }}>
                    📚 Topic-wise Performance Analysis & Classification
                  </h3>

                  {/* Recharts Topic Bar Chart */}
                  {examAnalytics.topicAnalysis.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={examAnalytics.topicAnalysis}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v) => `${v}%`} />
                          <Bar dataKey="avgPct" fill="#174675" name="Average Score %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Topic</th>
                          <th>Questions</th>
                          <th>Correct Answers</th>
                          <th>Incorrect Answers</th>
                          <th>Average Score %</th>
                          <th>Performance Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examAnalytics.topicAnalysis.map((t) => (
                          <tr key={t.topic}>
                            <td style={{ fontWeight: 600, color: "#0f172a" }}>{t.topic}</td>
                            <td>{t.questionCount}</td>
                            <td style={{ color: "#166534", fontWeight: 700 }}>{t.correctAnswers}</td>
                            <td style={{ color: "#dc2626" }}>{t.incorrectAnswers}</td>
                            <td style={{ fontWeight: 800, color: t.color }}>{t.avgPct}%</td>
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
                </div>

                {/* Exam-wise Cadet Performance Table with Sort & Search */}
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: "#174675" }}>👨‍🎓 Cadet Exam Performance List</h3>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Click any cadet row to view their complete performance dashboard</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <input
                        className="search-input"
                        style={{ paddingLeft: 12, width: 200 }}
                        placeholder="Search Cadet Name/ID..."
                        value={cadetSearchQuery}
                        onChange={(e) => setCadetSearchQuery(e.target.value)}
                      />
                      <select
                        className="filter-select"
                        value={cadetSortFilter}
                        onChange={(e) => setCadetSortFilter(e.target.value)}
                      >
                        <option value="all">All Cadets</option>
                        <option value="highest">Highest Score First</option>
                        <option value="lowest">Lowest Score First</option>
                        <option value="passed">Passed Cadets</option>
                        <option value="failed">Failed Cadets</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Cadet Name</th>
                          <th>Cadet ID</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Correct / Incorrect</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCadets.length === 0 ? (
                          <tr><td colSpan={7} className="table-empty">No cadet attempts match the filter criteria.</td></tr>
                        ) : (
                          filteredCadets.map((c) => (
                            <tr key={c.cadetId} style={{ cursor: "pointer" }} onClick={() => setSelectedCadetForModal(c)}>
                              <td style={{ fontWeight: 600, color: "#0f172a" }}>{c.cadetName}</td>
                              <td><span className="cadet-id-badge">{c.cadetId}</span></td>
                              <td style={{ fontWeight: 700 }}>{c.score} / {examAnalytics.exam.totalMarks}</td>
                              <td style={{ fontWeight: 800, color: c.passed ? "#166534" : "#991b1b" }}>{c.pct}%</td>
                              <td>
                                <span style={{ color: "#166534", fontWeight: 700 }}>{(c.itemizedResponses || []).filter(r => r.isCorrect).length}</span> /{" "}
                                <span style={{ color: "#dc2626" }}>{(c.itemizedResponses || []).filter(r => !r.isCorrect).length}</span>
                              </td>
                              <td>
                                <span className={`badge ${c.passed ? "badge-green" : "badge-red"}`}>
                                  {c.passed ? "PASS" : "FAIL"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn-secondary"
                                  style={{ fontSize: 11, padding: "4px 10px" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCadetForModal(c);
                                  }}
                                >
                                  View Drilldown →
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI-Based Learning Insights Box */}
                <div style={{ background: "#f0f9ff", border: "1.5px solid #0284c7", borderRadius: 10, padding: 16 }}>
                  <h4 style={{ margin: "0 0 8px", color: "#0369a1", fontSize: 14, fontWeight: 800 }}>
                    💡 AI-Generated Exam Insights & Action Plan
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {examAnalytics.aiInsights.map((insight, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#0f172a" }}>
                        <span>•</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <div className="empty-state-title">No Exam Selected for Analytics</div>
                  <div className="empty-state-sub">Select an exam from the dropdown above to view analytics.</div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── MATERIAL ANALYSIS TAB ── */}
      {tab === "material" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* UPLOAD CARD */}
          <div className="card">
            <h3 className="card-title">📄 Upload & Analyze NCC Study Material</h3>
            <p style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 16 }}>
              Upload any PDF or text study material. The system will scan the document, divide it into topics, and connect the detected topics to the Exam Generator.
            </p>

            <div
              style={{ border: "2px dashed #3b82f6", borderRadius: 12, padding: "36px 24px", textAlign: "center", background: "#eff6ff", cursor: "pointer" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: 42, marginBottom: 8 }}>📂</div>
              <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 4, fontSize: 15 }}>
                {matFile ? matFile.name : "Click to select PDF or TXT Study Material"}
              </div>
              <div style={{ fontSize: 12, color: "#60a5fa" }}>
                {matFile ? `${(matFile.size / 1024).toFixed(1)} KB` : "Supports PDF and Text documents"}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
            </div>

            {matAnalyzing && (
              <div style={{ textAlign: "center", padding: "20px", marginTop: 12 }}>
                <div style={{ fontWeight: 600, color: "#174675" }}>🔍 Analyzing document text and extracting chapters/topics...</div>
              </div>
            )}

            {matError && <div className="login-error" style={{ marginTop: 12 }}>⚠️ {matError}</div>}
          </div>

          {/* LIST OF ANALYZED DOCUMENTS & TOPICS */}
          {materials.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-title">No Materials Analyzed Yet</div>
                <div className="empty-state-sub">Upload a PDF or TXT file above to analyze topics.</div>
              </div>
            </div>
          ) : (
            materials.map(doc => (
              <div key={doc.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #f1f5f9", paddingBottom: 14, marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FileText size={22} style={{ color: "#174675" }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>{doc.fileName}</h3>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Uploaded {doc.uploadedAt} • {doc.fileSize}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="badge badge-blue">{doc.topics.length} Topics Detected</span>
                    <button
                      className="btn-primary"
                      style={{ fontSize: 12, padding: "6px 14px" }}
                      onClick={() => {
                        setGeneratorMode("topic");
                        setTab("generator");
                      }}
                    >
                      ⚡ Send Topics to Exam Generator <ArrowRight size={14} style={{ marginLeft: 4 }} />
                    </button>
                    <button className="icon-btn icon-btn-red" onClick={() => deleteMaterial(doc.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Detected topics badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {doc.topics.map(t => (
                    <div key={t.id} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{t.topic}</span>
                      <span className="badge badge-green" style={{ fontSize: 11 }}>{t.available} Available Qs</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PUBLISHED EXAMS TAB ── */}
      {tab === "exams" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {exams.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">No Exams Published Yet</div>
                <div className="empty-state-sub">Generate and publish an exam from the Exam Generator tab.</div>
              </div>
            </div>
          ) : exams.map(ex => {
            const cadets = JSON.parse(localStorage.getItem("nccCadets") || "[]");
            const cadetResults = cadets.map(c => {
              const res = JSON.parse(localStorage.getItem(`nccResults_${c.id}`) || "{}");
              return res[ex.id] ? { ...c, result: res[ex.id] } : null;
            }).filter(Boolean);
            const passCount = cadetResults.filter(c => c.result.passed).length;
            const avgScore  = cadetResults.length
              ? Math.round(cadetResults.reduce((s, c) => s + c.result.pct, 0) / cadetResults.length)
              : null;

            return (
              <div key={ex.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px", color: "#111827" }}>{ex.examName || ex.title}</h3>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", flexWrap: "wrap" }}>
                      <span>❓ {ex.totalQuestions} questions</span>
                      <span>📊 {ex.totalMarks} marks</span>
                      <span>⏱ {ex.duration} min</span>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>Published {ex.createdAt}</span>
                      {ex.source && <span className="badge badge-blue" style={{ fontSize: 11 }}>{ex.source}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge badge-green">Published</span>
                    <button className="icon-btn icon-btn-red" onClick={() => deleteExam(ex.id)}><Trash2 size={15} /></button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                  {[
                    { label: "Attempted", value: cadetResults.length, color: "#174675", bg: "#e3f0ff" },
                    { label: "Passed",    value: passCount,            color: "#166534", bg: "#dcfce7" },
                    { label: "Failed",    value: cadetResults.length - passCount, color: "#991b1b", bg: "#fee2e2" },
                    { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", color: "#9a3412", bg: "#ffedd5" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, color: s.color, padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      {s.value} <span style={{ fontWeight: 400, opacity: 0.8 }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {cadetResults.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Cadet Name</th><th>Cadet ID</th><th>Score</th><th>Percentage</th><th>Status</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {cadetResults.map(c => (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                            <td><span className="cadet-id-badge">{c.cadetId}</span></td>
                            <td style={{ fontWeight: 700 }}>{c.result.score}/{c.result.total}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className="mini-progress">
                                  <div className="mini-progress-fill" style={{ width: `${c.result.pct}%`, background: c.result.passed ? "#22c55e" : "#ef4444" }} />
                                </div>
                                <span style={{ fontWeight: 600, color: c.result.passed ? "#166534" : "#991b1b" }}>{c.result.pct}%</span>
                              </div>
                            </td>
                            <td><span className={`badge ${c.result.passed ? "badge-green" : "badge-red"}`}>{c.result.passed ? "PASS" : "FAIL"}</span></td>
                            <td style={{ fontSize: 12, color: "#9ca3af" }}>{c.result.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "12px 0" }}>No cadets have attempted this exam yet.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── QUESTION BANK TAB ── */}
      {tab === "bank" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="stats-grid">
            {[
              { label: "Total Questions", value: questions.length, color: "#174675", bg: "#e3f0ff" },
              { label: "Easy",   value: easyCount,   color: "#166534", bg: "#dcfce7" },
              { label: "Medium", value: mediumCount, color: "#854d0e", bg: "#fef9c3" },
              { label: "Hard",   value: hardCount,   color: "#991b1b", bg: "#fee2e2" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}><BookOpen size={20} /></div>
                <div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                <input className="search-input" style={{ paddingLeft: 12 }} placeholder="Search questions..." value={qSearch} onChange={e => setQSearch(e.target.value)} />
              </div>
              <select className="filter-select" value={qDiff} onChange={e => setQDiff(e.target.value)}>
                <option value="All">All Difficulties</option>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
              <button className="btn-primary" onClick={() => setShowQForm(true)}>
                <Plus size={16} style={{ marginRight: 6 }} />Add Question
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Question</th><th>Topic</th><th>Difficulty</th><th>Answer</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredQ.length === 0 ? (
                    <tr><td colSpan={6} className="table-empty">No questions found.</td></tr>
                  ) : filteredQ.map((q, i) => (
                    <tr key={q.id}>
                      <td style={{ color: "#9ca3af", fontSize: 13 }}>{i + 1}</td>
                      <td style={{ maxWidth: 320, fontSize: 13 }}>{q.question}</td>
                      <td><span className="badge badge-blue">{q.topic}</span></td>
                      <td><span className="badge" style={DIFF_COLORS[q.difficulty]}>{q.difficulty}</span></td>
                      <td style={{ fontWeight: 700, color: "#166534" }}>{q.answer}</td>
                      <td>
                        <button className="icon-btn icon-btn-red" onClick={() => deleteQuestion(q.id)}><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">Showing {filteredQ.length} of {questions.length} questions</div>
          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showQForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Add Question</h2>
              <button className="modal-close" onClick={() => setShowQForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={saveQuestion}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Question *</label>
                    <textarea className="form-input" rows={3} placeholder="Enter question..." value={qForm.question} onChange={e => setQForm({ ...qForm, question: e.target.value })} style={{ resize: "vertical" }} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Option A *</label>
                    <input className="form-input" value={qForm.optionA} onChange={e => setQForm({ ...qForm, optionA: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Option B *</label>
                    <input className="form-input" value={qForm.optionB} onChange={e => setQForm({ ...qForm, optionB: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Option C *</label>
                    <input className="form-input" value={qForm.optionC} onChange={e => setQForm({ ...qForm, optionC: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Option D *</label>
                    <input className="form-input" value={qForm.optionD} onChange={e => setQForm({ ...qForm, optionD: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Correct Answer</label>
                    <select className="form-input" value={qForm.answer} onChange={e => setQForm({ ...qForm, answer: e.target.value })}>
                      {["A","B","C","D"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Difficulty</label>
                    <select className="form-input" value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })}>
                      {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Topic</label>
                    <input className="form-input" placeholder="e.g. NCC Basics" value={qForm.topic} onChange={e => setQForm({ ...qForm, topic: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowQForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CADET PERFORMANCE DRILLDOWN MODAL */}
      {selectedCadetForModal && (
        <CadetPerformanceModal
          cadet={selectedCadetForModal}
          onClose={() => setSelectedCadetForModal(null)}
        />
      )}

      {/* COMPREHENSIVE EXAM REPORT MODAL */}
      {selectedExamForReport && (
        <ExamReportModal
          examId={selectedExamForReport}
          onClose={() => setSelectedExamForReport(null)}
        />
      )}
    </div>
  );
}
