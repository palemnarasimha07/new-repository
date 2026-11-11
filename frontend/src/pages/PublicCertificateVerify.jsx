import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, XCircle, Search, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PublicCertificateVerify() {
  const { certNo } = useParams();
  const [searchCertNo, setSearchCertNo] = useState(certNo ? decodeURIComponent(certNo) : "");
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [searched, setSearched] = useState(false);

  const certificates = JSON.parse(localStorage.getItem("nccCertificates") || "[]");

  const performVerification = (query) => {
    setSearched(true);
    if (!query) {
      setVerifiedCert(null);
      return;
    }
    const cleanQuery = query.trim().toLowerCase();
    const found = certificates.find(
      (c) => c.certNo?.toLowerCase() === cleanQuery || c.id.toString() === cleanQuery
    );
    setVerifiedCert(found || null);
  };

  useEffect(() => {
    if (certNo) {
      performVerification(decodeURIComponent(certNo));
    }
  }, [certNo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performVerification(searchCertNo);
  };

  const currentVerifyUrl = window.location.href;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#174675", color: "white", padding: "16px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🇮🇳</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, color: "white", fontWeight: 800 }}>
                National Cadet Corps (NCC) Verification Portal
              </h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
                Official Public Digital Certificate & Document Verification System
              </p>
            </div>
          </div>
          <Link to="/" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Portal
          </Link>
        </div>
      </header>

      {/* Main Verification Body */}
      <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px" }}>
        {/* Search Input Box */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, color: "#174675", margin: "0 0 12px" }}>🔍 Verify NCC Certificate Authenticity</h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
            Enter the unique Certificate Number (e.g. <code>NCC/CERT/2025/001</code>) to verify official validity.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: "10px 14px", fontSize: 14 }}
              placeholder="Enter Certificate Number (e.g. NCC/CERT/2025/001)"
              value={searchCertNo}
              onChange={(e) => setSearchCertNo(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: "10px 20px" }}>
              <Search size={16} style={{ marginRight: 6 }} /> Verify Certificate
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {searched && (
          <div>
            {verifiedCert ? (
              <div
                className="card"
                style={{ border: "2px solid #22c55e", background: "#ffffff", padding: 32, textAlign: "center", position: "relative" }}
              >
                <div style={{ display: "inline-flex", background: "#dcfce7", color: "#166534", padding: 16, borderRadius: "50%", marginBottom: 16 }}>
                  <CheckCircle2 size={48} />
                </div>

                <div className="badge badge-green" style={{ fontSize: 13, padding: "6px 16px", margin: "0 auto 12px", width: "fit-content" }}>
                  OFFICIALLY VERIFIED CERTIFICATE ✅
                </div>

                <h2 style={{ color: "#174675", margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>
                  {verifiedCert.type || "NCC Certificate"}
                </h2>
                <p style={{ fontSize: 14, color: "#475569", margin: "0 0 24px" }}>
                  Certificate Number: <strong style={{ color: "#0f172a" }}>{verifiedCert.certNo}</strong>
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left", background: "#f8fafc", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Cadet Name</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{verifiedCert.cadetName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Cadet ID</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#174675" }}>{verifiedCert.rollNo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Issue Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{verifiedCert.issueDate || "August 15, 2025"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Status</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>{verifiedCert.status}</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Remarks / Description</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>{verifiedCert.remarks || "Issued under Directorate guidelines."}</div>
                  </div>
                </div>

                {/* QR Code Verification Display */}
                <div style={{ background: "#eff6ff", border: "1.5px dashed #3b82f6", borderRadius: 12, padding: 20, display: "inline-block" }}>
                  <div style={{ marginBottom: 10, fontSize: 12, color: "#1e40af", fontWeight: 700 }}>
                    Official Verification QR Code
                  </div>
                  <QRCodeSVG value={currentVerifyUrl} size={120} level="H" includeMargin={true} />
                  <div style={{ fontSize: 11, color: "#60a5fa", marginTop: 8 }}>
                    Scan to verify on official portal
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ border: "2px solid #ef4444", textAlign: "center", padding: 36 }}>
                <div style={{ display: "inline-flex", background: "#fee2e2", color: "#b91c1c", padding: 16, borderRadius: "50%", marginBottom: 16 }}>
                  <XCircle size={48} />
                </div>
                <h3 style={{ color: "#991b1b", margin: "0 0 8px", fontSize: 20 }}>Certificate Not Found</h3>
                <p style={{ color: "#64748b", maxWidth: 440, margin: "0 auto 16px", fontSize: 14 }}>
                  No verified certificate matches "<strong>{searchCertNo}</strong>". Please check the certificate number and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
