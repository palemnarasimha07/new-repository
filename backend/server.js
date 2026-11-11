import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authenticateToken, authorizeRoles } from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "ncc_digital_cadet_system_sih2026_super_secret_jwt_key";

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : "*";

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ── In-Memory Database Stores (Seeded for Prototype API) ────────────────────
let usersDB = [
  { id: 1, username: "NCC001", passwordHash: bcrypt.hashSync("9876543210", 8), role: "cadet", name: "Rahul Kumar", cadetId: "NCC001" },
  { id: 2, username: "ano", passwordHash: bcrypt.hashSync("1234", 8), role: "officer", name: "Lt. Pradeep Sharma", rank: "Lieutenant" },
  { id: 3, username: "co", passwordHash: bcrypt.hashSync("1234", 8), role: "admin", name: "Col. Rajesh Verma", rank: "Colonel" },
];

let auditLogsDB = [
  { id: 1, user: "ano", role: "officer", action: "Exam Published: NCC General Knowledge", timestamp: new Date().toISOString() },
  { id: 2, user: "co", role: "admin", action: "System Audit Log Initialized", timestamp: new Date().toISOString() },
];

// Helper to log audit actions
function logAudit(user, role, action) {
  const entry = {
    id: Date.now(),
    user: user || "system",
    role: role || "system",
    action,
    timestamp: new Date().toLocaleString(),
  };
  auditLogsDB.unshift(entry);
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "OK", service: "NCC Digital Cadet Backend API", timestamp: new Date() });
});

// ── Authentication API ───────────────────────────────────────────────────────
app.post("/api/v1/auth/login", (req, res) => {
  const { username, password, portalRole } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = usersDB.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.role === portalRole
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  logAudit(user.username, user.role, `User login successful (${user.role})`);

  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// ── Audit Logs API (Admin only) ──────────────────────────────────────────────
app.get("/api/v1/audit-logs", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.json({ logs: auditLogsDB });
});

// ── Password Reset API ───────────────────────────────────────────────────────
app.post("/api/v1/auth/reset-password", authenticateToken, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long" });
  }

  const user = usersDB.find((u) => u.id === req.user.id);
  if (user) {
    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    logAudit(req.user.username, req.user.role, "Password changed successfully");
    return res.json({ message: "Password updated successfully" });
  }

  res.status(444).json({ error: "User not found" });
});

// ── Static Frontend Serving (For Production & Unified Containers) ───────────
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const publicDistPath = path.resolve(__dirname, "public");

// Dynamic middleware for static asset serving & SPA client-side routing fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  let distDir = null;
  if (fs.existsSync(frontendDistPath)) {
    distDir = frontendDistPath;
  } else if (fs.existsSync(publicDistPath)) {
    distDir = publicDistPath;
  }

  if (distDir) {
    express.static(distDir)(req, res, () => {
      const indexPath = path.join(distDir, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 NCC Digital Cadet Backend running on port ${PORT}`);
});
