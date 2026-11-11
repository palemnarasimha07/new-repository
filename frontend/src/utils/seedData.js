// Runs once on app start — seeds localStorage with default data if keys are missing

const DEFAULT_CADETS = [
  { id: 1, name: "Rahul Kumar",  cadetId: "NCC001", rank: "Lance Corporal", wing: "Army Wing",  unit: "Unit A", year: "3rd Year", phone: "9876543210", email: "rahul@example.com",  attendance: 92, gender: "Male",   bloodGroup: "B+", institution: "GCE Bangalore" },
  { id: 2, name: "Priya Sharma", cadetId: "NCC002", rank: "Cadet",          wing: "Naval Wing", unit: "Unit A", year: "2nd Year", phone: "9876543211", email: "priya@example.com",  attendance: 88, gender: "Female", bloodGroup: "O+", institution: "GCE Bangalore" },
  { id: 3, name: "Arjun Reddy",  cadetId: "NCC003", rank: "Corporal",       wing: "Army Wing",  unit: "Unit B", year: "3rd Year", phone: "9876543212", email: "arjun@example.com",  attendance: 95, gender: "Male",   bloodGroup: "A+", institution: "BMS College" },
  { id: 4, name: "Sneha Rao",    cadetId: "NCC004", rank: "Cadet",          wing: "Air Wing",   unit: "Unit B", year: "1st Year", phone: "9876543213", email: "sneha@example.com",  attendance: 72, gender: "Female", bloodGroup: "AB+",institution: "BMS College" },
  { id: 5, name: "Vikram Singh", cadetId: "NCC005", rank: "Sergeant",       wing: "Army Wing",  unit: "Unit A", year: "3rd Year", phone: "9876543214", email: "vikram@example.com", attendance: 90, gender: "Male",   bloodGroup: "O-", institution: "GCE Bangalore" },
];

const DEFAULT_TRAININGS = [
  { id: 1, name: "Drill Training",     type: "Drill",             date: "2025-08-28", instructor: "Lt. Pradeep Sharma", location: "Parade Ground", status: "Completed", attendance: { NCC001: "Present", NCC002: "Present", NCC003: "Absent",  NCC004: "Present", NCC005: "Present" } },
  { id: 2, name: "Physical Training",  type: "Physical Training", date: "2025-08-29", instructor: "Training Officer",   location: "Sports Ground", status: "Completed", attendance: { NCC001: "Present", NCC002: "Leave",   NCC003: "Present", NCC004: "Present", NCC005: "Present" } },
  { id: 3, name: "First Aid Workshop", type: "First Aid",         date: "2025-09-05", instructor: "Medical Officer",   location: "Classroom 1",   status: "Scheduled", attendance: {} },
  { id: 4, name: "Map Reading",        type: "Map Reading",       date: "2025-09-10", instructor: "Lt. Pradeep Sharma", location: "Field Area",   status: "Scheduled", attendance: {} },
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: "Annual Training Camp Registration Open", body: "All cadets are required to register for the Annual Training Camp by 15th September.", priority: "Important", audience: "All Cadets", date: "2025-08-20", pinned: true },
  { id: 2, title: "Republic Day Parade Selection",          body: "Selection trials for Republic Day Parade will be held on 5th September at the Parade Ground.", priority: "Urgent",    audience: "All Cadets", date: "2025-08-18", pinned: true },
  { id: 3, title: "Uniform Inspection Notice",              body: "A uniform inspection will be conducted during the next parade.", priority: "Normal", audience: "All Cadets", date: "2025-08-15", pinned: false },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 1, cadetName: "Rahul Kumar",  rollNo: "NCC001", title: "Best Cadet Award",  category: "Best Cadet", date: "2025-08-15", level: "Unit",     certificateNo: "CERT001", description: "Selected as Best Cadet for outstanding performance." },
  { id: 2, cadetName: "Priya Sharma", rollNo: "NCC002", title: "Drill Competition", category: "Drill",      date: "2025-07-20", level: "District", certificateNo: "CERT002", description: "Secured 2nd position in district drill competition." },
  { id: 3, cadetName: "Arjun Reddy",  rollNo: "NCC003", title: "Sports Gold Medal", category: "Sports",     date: "2025-06-10", level: "State",    certificateNo: "CERT003", description: "Won gold medal in state-level athletics." },
];

const DEFAULT_CERTIFICATES = [
  { id: 1, cadetName: "Rahul Kumar",  rollNo: "NCC001", type: "B Certificate",          certNo: "NCC/CERT/2025/001", issueDate: "2025-08-15", status: "Issued",  remarks: "Passed with distinction." },
  { id: 2, cadetName: "Priya Sharma", rollNo: "NCC002", type: "Camp Certificate",        certNo: "NCC/CERT/2025/002", issueDate: "2025-07-10", status: "Issued",  remarks: "CATC Summer 2025." },
  { id: 3, cadetName: "Arjun Reddy",  rollNo: "NCC003", type: "Achievement Certificate", certNo: "NCC/CERT/2025/003", issueDate: "2025-06-20", status: "Issued",  remarks: "State level sports." },
  { id: 4, cadetName: "Sneha Rao",    rollNo: "NCC004", type: "A Certificate",           certNo: "NCC/CERT/2025/004", issueDate: "",           status: "Pending", remarks: "Exam pending." },
];

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

const DEFAULT_QUESTIONS = [
  { id: 1,  subject: "NCC", topic: "NCC Basics",  question: "What does NCC stand for?",                        optionA: "National Cadet Corps",         optionB: "National Civil Corps",    optionC: "National Command Corps",  optionD: "National Cadet Committee", answer: "A", difficulty: "Easy"   },
  { id: 2,  subject: "NCC", topic: "NCC Basics",  question: "What is the motto of NCC?",                       optionA: "Jai Hind",                     optionB: "Unity and Discipline",    optionC: "Service and Duty",        optionD: "Nation First",             answer: "B", difficulty: "Easy"   },
  { id: 3,  subject: "NCC", topic: "NCC Basics",  question: "NCC is associated with which ministry?",          optionA: "Ministry of Defence",          optionB: "Ministry of Railways",    optionC: "Ministry of Finance",     optionD: "Ministry of Agriculture",  answer: "A", difficulty: "Medium" },
  { id: 4,  subject: "NCC", topic: "Training",    question: "Which activity is common in NCC training?",       optionA: "Drill",                        optionB: "Cooking only",            optionC: "Accounting",              optionD: "Banking",                  answer: "A", difficulty: "Easy"   },
  { id: 5,  subject: "NCC", topic: "Training",    question: "What quality does NCC training develop?",         optionA: "Discipline",                   optionB: "Laziness",                optionC: "Carelessness",            optionD: "Indifference",             answer: "A", difficulty: "Easy"   },
  { id: 6,  subject: "NCC", topic: "Camps",       question: "What is the purpose of NCC camps?",               optionA: "Training and development",     optionB: "Commercial business",     optionC: "Entertainment only",      optionD: "Shopping",                 answer: "A", difficulty: "Medium" },
  { id: 7,  subject: "NCC", topic: "Leadership",  question: "Which quality is important for an NCC leader?",  optionA: "Leadership",                   optionB: "Negligence",              optionC: "Dishonesty",              optionD: "Indiscipline",             answer: "A", difficulty: "Medium" },
  { id: 8,  subject: "NCC", topic: "Discipline",  question: "What is a key principle of NCC?",                optionA: "Unity and Discipline",         optionB: "Competition only",        optionC: "Individualism",           optionD: "Relaxation",               answer: "A", difficulty: "Easy"   },
  { id: 9,  subject: "NCC", topic: "Drill",       question: "What does drill help cadets develop?",            optionA: "Discipline and coordination",  optionB: "Cooking skills",          optionC: "Typing speed",            optionD: "Accounting skills",        answer: "A", difficulty: "Medium" },
  { id: 10, subject: "NCC", topic: "First Aid",   question: "First step when helping an injured person?",     optionA: "Ensure area is safe",          optionB: "Leave immediately",       optionC: "Ignore the person",       optionD: "Take photographs",         answer: "A", difficulty: "Medium" },
  { id: 11, subject: "NCC", topic: "Leadership",  question: "A good leader should primarily:",                 optionA: "Guide the team",               optionB: "Avoid responsibility",    optionC: "Ignore team members",     optionD: "Create confusion",         answer: "A", difficulty: "Hard"   },
  { id: 12, subject: "NCC", topic: "Training",    question: "Why is physical training important for cadets?", optionA: "Improve fitness and endurance", optionB: "Avoid discipline",        optionC: "Reduce teamwork",         optionD: "Avoid activities",         answer: "A", difficulty: "Medium" },
  { id: 13, subject: "NCC", topic: "Discipline",  question: "Discipline mainly means:",                       optionA: "Following rules and self-control", optionB: "Ignoring instructions", optionC: "Avoiding duties",         optionD: "Breaking rules",           answer: "A", difficulty: "Hard"   },
  { id: 14, subject: "NCC", topic: "Leadership",  question: "Teamwork is important because it:",              optionA: "Helps work toward a common goal", optionB: "Creates isolation",     optionC: "Reduces communication",   optionD: "Prevents cooperation",     answer: "A", difficulty: "Hard"   },
  { id: 15, subject: "NCC", topic: "NCC Basics",  question: "Which value is promoted by NCC?",                optionA: "Patriotism",                   optionB: "Carelessness",            optionC: "Dishonesty",              optionD: "Indiscipline",             answer: "A", difficulty: "Hard"   },
];

const SEEDS = [
  ["nccCadets",        DEFAULT_CADETS],
  ["nccTrainings",     DEFAULT_TRAININGS],
  ["nccAnnouncements", DEFAULT_ANNOUNCEMENTS],
  ["nccAchievements",  DEFAULT_ACHIEVEMENTS],
  ["nccCertificates",  DEFAULT_CERTIFICATES],
  ["nccExams",         DEFAULT_EXAMS],
  ["nccQuestions",     DEFAULT_QUESTIONS],
];

export function seedData() {
  // Always overwrite nccCadets to ensure phone field is present for login
  localStorage.setItem("nccCadets", JSON.stringify(DEFAULT_CADETS));
  // Seed others only if missing
  SEEDS.filter(([key]) => key !== "nccCadets").forEach(([key, data]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  });
}
