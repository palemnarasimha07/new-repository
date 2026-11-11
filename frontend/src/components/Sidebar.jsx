import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, ClipboardList, Dumbbell,
  FileText, Trophy, Award, Tent, Megaphone,
  BarChart2, LogOut, X, User, BookOpen, Medal,
  ShieldCheck, CalendarCheck,
} from "lucide-react";

// ─── Nav items per role ───────────────────────────────────────────────────────
const OFFICER_NAV = [
  { to: "/officer/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/officer/cadets",       icon: Users,           label: "Cadets" },
  { to: "/officer/attendance",   icon: CalendarCheck,   label: "Attendance" },
  { to: "/officer/training",     icon: Dumbbell,        label: "Training" },
  { to: "/officer/examination",  icon: FileText,        label: "Examination" },
  { to: "/officer/achievements", icon: Trophy,          label: "Achievements" },
  { to: "/officer/certificates", icon: Award,           label: "Certificates" },
  { to: "/officer/camps",        icon: Tent,            label: "Camps" },
  { to: "/officer/announcements",icon: Megaphone,       label: "Announcements" },
  { to: "/officer/analytics",    icon: BarChart2,       label: "Analytics" },
];

const CADET_NAV = [
  { to: "/cadet/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/cadet/profile",      icon: User,            label: "My Profile" },
  { to: "/cadet/attendance",   icon: CalendarCheck,   label: "My Attendance" },
  { to: "/cadet/training",     icon: Dumbbell,        label: "My Training" },
  { to: "/cadet/exams",        icon: BookOpen,        label: "Examinations" },
  { to: "/cadet/achievements", icon: Medal,           label: "My Achievements" },
  { to: "/cadet/certificates", icon: Award,           label: "My Certificates" },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/officer/cadets",     icon: Users,           label: "Cadets" },
  { to: "/officer/examination",icon: FileText,        label: "Examinations" },
  { to: "/officer/analytics",  icon: BarChart2,       label: "Analytics" },
  { to: "/officer/certificates",icon: ShieldCheck,   label: "Certificates" },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === "cadet"
      ? CADET_NAV
      : user?.role === "admin"
      ? ADMIN_NAV
      : OFFICER_NAV;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel =
    user?.role === "cadet"
      ? "Cadet Portal"
      : user?.role === "admin"
      ? "Admin Portal"
      : "Officer Portal";

  const roleColor =
    user?.role === "cadet"
      ? "#1a6b3c"
      : user?.role === "admin"
      ? "#7b1fa2"
      : "#174675";

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 998,
            display: "none",
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        style={{ "--role-color": roleColor }}
      >
        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🇮🇳</span>
            <div>
              <div className="sidebar-logo-title">NCC Digital</div>
              <div className="sidebar-logo-sub">{roleLabel}</div>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ── User info ── */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">
              {user?.rank || user?.role}
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
