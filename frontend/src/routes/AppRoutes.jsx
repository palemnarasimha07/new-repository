import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Public
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import PublicCertificateVerify from "../pages/PublicCertificateVerify";

// Layout
import MainLayout from "../layouts/MainLayout";

// Officer pages
import OfficerDashboard from "../pages/officer/OfficerDashboard";
import CadetManagement from "../pages/officer/CadetManagement";
import TrainingManagement from "../pages/officer/TrainingManagement";
import ExaminationManagement from "../pages/officer/ExaminationManagement";
import AchievementsManagement from "../pages/officer/AchievementsManagement";
import AttendanceManagement from "../pages/officer/AttendanceManagement";
import CertificateManagement from "../pages/officer/CertificateManagement";
import CampManagement from "../pages/officer/CampManagement";
import Announcements from "../pages/officer/Announcements";
import PerformanceAnalytics from "../pages/officer/PerformanceAnalytics";

// Cadet pages
import CadetDashboard     from "../pages/cadet/CadetDashboard";
import CadetProfile      from "../pages/cadet/CadetProfile";
import CadetAttendance   from "../pages/cadet/CadetAttendance";
import CadetTraining     from "../pages/cadet/CadetTraining";
import CadetExams        from "../pages/cadet/CadetExams";
import CadetAchievements from "../pages/cadet/CadetAchievements";
import CadetCertificates from "../pages/cadet/CadetCertificates";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";

// ── Simple placeholder for pages not yet built ────────────────────────────────
function ComingSoon({ title }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div style={{
        background: "white", borderRadius: "12px", padding: "60px 40px",
        textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
        <h2 style={{ color: "#174675", margin: "0 0 8px" }}>{title}</h2>
        <p style={{ color: "#666" }}>This module will be built in the next phase.</p>
      </div>
    </div>
  );
}

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return children;
}

function getDashboardPath(role) {
  if (role === "cadet") return "/cadet/dashboard";
  if (role === "officer") return "/officer/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

// ── App Routes ────────────────────────────────────────────────────────────────
export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/verify-certificate" element={<PublicCertificateVerify />} />
      <Route path="/verify-certificate/:certNo" element={<PublicCertificateVerify />} />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={getDashboardPath(user?.role)} replace />
            : <Login />
        }
      />

      {/* ── Officer / Admin Routes ── */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRoles={["officer", "admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<OfficerDashboard />} />
        <Route path="cadets"       element={<CadetManagement />} />
        <Route path="attendance"   element={<AttendanceManagement />} />
        <Route path="training"     element={<TrainingManagement />} />
        <Route path="examination"  element={<ExaminationManagement />} />
        <Route path="achievements" element={<AchievementsManagement />} />
        <Route path="certificates" element={<CertificateManagement />} />
        <Route path="camps"        element={<CampManagement />} />
        <Route path="announcements"element={<Announcements />} />
        <Route path="analytics"    element={<PerformanceAnalytics />} />
      </Route>

      {/* ── Cadet Routes ── */}
      <Route
        path="/cadet"
        element={
          <ProtectedRoute allowedRoles={["cadet"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<CadetDashboard />} />
        <Route path="profile"      element={<CadetProfile />} />
        <Route path="attendance"   element={<CadetAttendance />} />
        <Route path="training"     element={<CadetTraining />} />
        <Route path="exams"        element={<CadetExams />} />
        <Route path="achievements" element={<CadetAchievements />} />
        <Route path="certificates" element={<CadetCertificates />} />
      </Route>

      {/* ── Admin Routes ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h1 style={{ color: "#c62828" }}>⛔ Access Denied</h1>
            <p>You do not have permission to view this page.</p>
            <button
              onClick={() => window.history.back()}
              style={{
                marginTop: "20px", padding: "12px 24px",
                background: "#174675", color: "white",
                border: "none", borderRadius: "8px",
                cursor: "pointer", fontSize: "15px",
              }}
            >
              Go Back
            </button>
          </div>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
