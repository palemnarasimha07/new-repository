import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, ChevronDown, User, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PRIORITY_ORDER = { Urgent: 0, Important: 1, Normal: 2 };
const PRIORITY_COLOR = { Urgent: "#991b1b", Important: "#9a3412", Normal: "#1e40af" };
const PRIORITY_BG    = { Urgent: "#fee2e2", Important: "#ffedd5", Normal: "#dbeafe" };

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [readIds, setReadIds]           = useState(() => {
    try { return JSON.parse(localStorage.getItem(`nccReadNotifs_${user?.id}`) || "[]"); }
    catch { return []; }
  });
  const notifRef = useRef(null);

  const announcements = (() => {
    try {
      return JSON.parse(localStorage.getItem("nccAnnouncements") || "[]");
    } catch { return []; }
  })().sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));

  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

  const markAllRead = () => {
    const ids = announcements.map(a => a.id);
    setReadIds(ids);
    localStorage.setItem(`nccReadNotifs_${user?.id}`, JSON.stringify(ids));
  };

  const markRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem(`nccReadNotifs_${user?.id}`, JSON.stringify(updated));
  };

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profilePath = user?.role === "cadet" ? "/cadet/profile" : null;

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="navbar-brand">
        <span className="navbar-brand-text">NCC Digital Cadet System</span>
      </div>

      <div className="navbar-right">
        {/* Notification bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button className="navbar-icon-btn" onClick={() => setNotifOpen(o => !o)}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="navbar-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <span className="notif-title">Announcements</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {unreadCount > 0 && (
                    <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
                  )}
                  <button className="modal-close" onClick={() => setNotifOpen(false)}><X size={16} /></button>
                </div>
              </div>
              <div className="notif-list">
                {announcements.length === 0 ? (
                  <div className="notif-empty">No announcements</div>
                ) : announcements.map(a => {
                  const isRead = readIds.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`notif-item ${isRead ? "notif-read" : "notif-unread"}`}
                      onClick={() => markRead(a.id)}
                    >
                      <div className="notif-item-top">
                        <span
                          className="notif-priority"
                          style={{ background: PRIORITY_BG[a.priority], color: PRIORITY_COLOR[a.priority] }}
                        >
                          {a.priority}
                        </span>
                        {!isRead && <span className="notif-dot" />}
                      </div>
                      <div className="notif-item-title">{a.title}</div>
                      <div className="notif-item-date">{a.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="navbar-avatar">
            {user?.name?.charAt(0) || "U"}
          </div>
          <span className="navbar-username">{user?.name}</span>
          <ChevronDown size={16} />

          {dropdownOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <div className="navbar-dropdown-name">{user?.name}</div>
                <div className="navbar-dropdown-role">
                  {user?.rank || user?.role}
                </div>
              </div>

              {profilePath && (
                <button
                  className="navbar-dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(profilePath);
                  }}
                >
                  <User size={15} />
                  My Profile
                </button>
              )}

              <button
                className="navbar-dropdown-item navbar-dropdown-logout"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
