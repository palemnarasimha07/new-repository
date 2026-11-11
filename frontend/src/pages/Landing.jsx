import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "👨🎓", title: "Cadet Management", desc: "Complete cadet profiles, ranks, wings, units and enrollment management." },
  { icon: "📅", title: "Attendance Tracking", desc: "Parade, training and camp attendance with automatic percentage calculation." },
  { icon: "🎯", title: "Training Modules", desc: "Drill, weapon training, map reading, first aid, leadership and more." },
  { icon: "📝", title: "Online Examinations", desc: "Auto-generated MCQ exams with timer, instant evaluation and grading." },
  { icon: "🏆", title: "Achievements", desc: "Track sports, drill, camp and national-level cadet achievements." },
  { icon: "📜", title: "Certificates", desc: "Issue and verify NCC participation, training and achievement certificates." },
  { icon: "⛺", title: "Camp Management", desc: "ATC, CATC, NIC, Republic Day and other NCC camp records." },
  { icon: "📊", title: "Analytics & Reports", desc: "Performance dashboards, attendance reports and examination analytics." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-logo">
            <span>🇮🇳</span>
            <span>NCC Digital Cadet System</span>
          </div>
          <button
            className="landing-nav-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-badge">🇮🇳 National Cadet Corps</div>
          <h1 className="landing-hero-title">
            NCC Digital<br />Cadet System
          </h1>
          <p className="landing-hero-sub">
            Empowering Cadets Through Digital Management,<br />
            Training, Examination and Performance Analytics.
          </p>
          <div className="landing-hero-btns">
            <button
              className="landing-btn-primary"
              onClick={() => navigate("/login")}
            >
              👨🎓 Cadet Login
            </button>
            <button
              className="landing-btn-secondary"
              onClick={() => navigate("/login")}
            >
              🎖️ Officer Login
            </button>
          </div>

          {/* Stats */}
          <div className="landing-stats">
            {[
              { value: "500+", label: "Cadets Enrolled" },
              { value: "3", label: "NCC Wings" },
              { value: "50+", label: "Training Modules" },
              { value: "100%", label: "Digital Records" },
            ].map((s) => (
              <div key={s.label} className="landing-stat">
                <div className="landing-stat-value">{s.value}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="landing-section-inner">
          <div className="landing-section-badge">Platform Features</div>
          <h2 className="landing-section-title">
            Everything You Need to Manage NCC Cadets
          </h2>
          <p className="landing-section-sub">
            A complete digital platform for NCC units to manage cadets,
            training, examinations and achievements.
          </p>

          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wings ── */}
      <section className="landing-wings">
        <div className="landing-section-inner">
          <h2 className="landing-section-title" style={{ color: "white" }}>
            NCC Wings Supported
          </h2>
          <div className="landing-wings-grid">
            {[
              { icon: "🪖", name: "Army Wing", color: "#2e7d32" },
              { icon: "⚓", name: "Naval Wing", color: "#1565c0" },
              { icon: "✈️", name: "Air Wing",   color: "#6a1b9a" },
            ].map((w) => (
              <div
                key={w.name}
                className="landing-wing-card"
                style={{ borderTop: `4px solid ${w.color}` }}
              >
                <div className="landing-wing-icon">{w.icon}</div>
                <div className="landing-wing-name">{w.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-section-inner">
          <h2 className="landing-cta-title">Ready to Get Started?</h2>
          <p className="landing-cta-sub">
            Login to your portal and manage your NCC journey digitally.
          </p>
          <button
            className="landing-btn-primary"
            onClick={() => navigate("/login")}
          >
            🔐 Login Now
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>© 2025 NCC Digital Cadet System. Built for National Cadet Corps.</p>
      </footer>
    </div>
  );
}
