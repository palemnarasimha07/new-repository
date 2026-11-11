import { useState } from "react";
import { calculateCadetReadiness } from "../services/readinessCalculator";
import { ShieldCheck, ChevronDown, ChevronUp, Settings } from "lucide-react";

export default function CadetReadinessCard({ cadet, userRole = "cadet" }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showConfig, setShowConfig]   = useState(false);

  const [weights, setWeights] = useState({
    attendance: 20,
    training: 25,
    examination: 25,
    physical: 15,
    achievements: 15,
  });

  const readiness = calculateCadetReadiness(cadet || {}, { weights });

  return (
    <div className="card" style={{ border: `2px solid ${readiness.overallScore >= 75 ? "#166534" : "#991b1b"}`, background: "#ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: readiness.bg, color: readiness.color, padding: 12, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: 13, textTransform: "uppercase", tracking: 1, color: "#6b7280", fontWeight: 700 }}>
              Transparent Cadet Readiness Index
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 2 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: readiness.color }}>{readiness.overallScore}%</span>
              <span className="badge" style={{ background: readiness.bg, color: readiness.color, fontSize: 12, padding: "4px 10px" }}>
                {readiness.rating}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {userRole === "admin" && (
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings size={14} /> Weights Config
            </button>
          )}
          <button
            className="btn-secondary"
            style={{ fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {showDetails ? "Hide Score Why" : "Why 78%? Score Breakdown"}
          </button>
        </div>
      </div>

      {/* Admin weight customization overlay */}
      {showConfig && userRole === "admin" && (
        <div style={{ marginTop: 16, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "#1e293b" }}>⚙️ Configure Weight Distribution (%)</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {Object.keys(weights).map((key) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{key}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights[key]}
                  onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparent Component Breakdown */}
      {showDetails && (
        <div style={{ marginTop: 16, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
            📊 Score Calculation Breakdown (Weighted Weighted Formula):
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {readiness.breakdown.map((item) => (
              <div key={item.component} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "#334155" }}>
                    {item.icon} {item.component} ({item.weight}% weight)
                  </span>
                  <span style={{ fontWeight: 700, color: item.score >= 75 ? "#166534" : "#991b1b" }}>
                    Score: {item.score}% → Adds +{item.weightedVal}% to overall
                  </span>
                </div>
                <div style={{ height: 6, background: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${item.score}%`,
                      height: "100%",
                      background: item.score >= 75 ? "#22c55e" : item.score >= 60 ? "#f59e0b" : "#ef4444",
                      borderRadius: 10,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
