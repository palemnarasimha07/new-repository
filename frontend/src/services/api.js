// API Abstraction Service
// Supports connecting to Node.js / Express backend with graceful fallback to LocalStorage for SIH offline demo mode

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

/**
 * Generic fetch wrapper with Authorization headers & error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("nccToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn(`[API] Fallback mode triggered for ${endpoint}:`, err.message);
    return null; // Return null so callers know backend was unreachable & can use local storage fallback
  }
}

/**
 * Audit Log API helper
 */
export async function fetchAuditLogs() {
  const res = await apiRequest("/audit-logs");
  if (res && res.logs) return res.logs;

  // Fallback local storage audit logs
  return JSON.parse(localStorage.getItem("nccAuditLogs") || "[]");
}

export function logAuditAction(action, userRole = "officer", userName = "Lt. Pradeep Sharma") {
  const logs = JSON.parse(localStorage.getItem("nccAuditLogs") || "[]");
  const newLog = {
    id: Date.now(),
    user: userName,
    role: userRole,
    action,
    timestamp: new Date().toLocaleString(),
  };
  logs.unshift(newLog);
  localStorage.setItem("nccAuditLogs", JSON.stringify(logs.slice(0, 100)));
}
