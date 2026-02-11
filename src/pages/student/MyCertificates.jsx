import { FaDownload, FaTrophy, FaCertificate, FaPrint } from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { getLocalCertificates } from "../../utils/certificateStorage";
import "../../styles/Dashboard.css";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../auth/firebase";

// Generate certificate PDF via backend (optional)
const generateCertificateAPI = async (user_id, course, score) => {
  try {
    const res = await api.post("/api/certificate/add", {
      user_id,
      exam_name: course,
      score,
    });
    return res.data?.generated ? { generated: true } : { generated: false };
  } catch (err) {
    return { generated: false };
  }
};

// Merge backend certs with local, dedupe by course+date
function mergeCertificates(local, backendFormatted) {
  const keys = new Set(local.map((c) => `${c.course}|${c.date}`));
  const fromBackend = (backendFormatted || []).filter((c) => {
    const k = `${c.course}|${c.date}`;
    if (keys.has(k)) return false;
    keys.add(k);
    return true;
  });
  return [...local, ...fromBackend];
}

// ----------------------------------------------------------------------
// DEFAULT CONFIGURATION & LOCAL OVERRIDES (Frontend Only)
// ----------------------------------------------------------------------
const defaultConfig = {
  title: "Certificate of Achievement",
  authorityName: "Director of Education",
  issuerName: "Shnoor LMS", // Added default
  logoUrl: "/just_logo.svg",
  signatureUrl: "/signatures/sign.png",
  templateUrl: "", // Empty string means no background by default
};

// OPTIONAL: Override specific fields here locally without changing Firestore
// Example: { authorityName: "Chief Instructor" }
const localOverrides = {
  // authorityName: "Chief Instructor", 
};

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [certConfig, setCertConfig] = useState(null);

  useEffect(() => {
    // Real-time listener for certificate updates
    const docRef = doc(db, "settings", "certificateConfig");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      try {
        let firestoreData = {};
        if (docSnap.exists()) {
          firestoreData = docSnap.data();
        }

        // Handle legacy 'imageUrl'
        if (!firestoreData.signatureUrl && firestoreData.imageUrl) {
          firestoreData.signatureUrl = firestoreData.imageUrl;
        }

        // Intelligent Merge:
        // If Firestore has value, use it. If it's explicitly empty string, 
        // we might want to respect it OR fallback.
        // Given user complaint "doesn't show", we generally want fallback for empty strings 
        // UNLESS it's a field where empty makes sense (like templateUrl).
        // For Logo and Signature, usually we want a fallback.

        const finalConfig = {
          ...defaultConfig,
          ...firestoreData,
          ...localOverrides,
          // Explicit fallbacks ensuring defaults if Firestore sends empty strings for critical assets
          logoUrl: firestoreData.logoUrl || defaultConfig.logoUrl,
          signatureUrl: firestoreData.signatureUrl || firestoreData.imageUrl || defaultConfig.signatureUrl,
          authorityName: firestoreData.authorityName || defaultConfig.authorityName,
          title: firestoreData.title || defaultConfig.title,
        };

        setCertConfig(finalConfig);
      } catch (err) {
        console.error("Error processing config update:", err);
        setCertConfig({ ...defaultConfig, ...localOverrides });
      }
    }, (error) => {
      console.error("Error listening to certificate config:", error);
    });

    return () => unsubscribe();
  }, []);

  const loadCertificates = useCallback(async () => {
    // 1) Always show local certificates first (no backend needed)
    const local = getLocalCertificates();
    setCertificates(local);
    setLoading(false);

    // 2) Optionally merge in backend certificates if server is available
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      const meRes = await api.get("/api/auth/me", { timeout: 2000 });
      if (meRes.data?.user_id != null) {
        localStorage.setItem("user_id", String(meRes.data.user_id));
      }
    } catch (_) { }

    try {
      const res = await api.get(`/api/certificate/${userId}`);
      const data = res.data;
      if (res.status === 404 || (data?.message?.includes("not found"))) {
        setBackendUnavailable(false);
        return;
      }
      const certArray = Array.isArray(data) ? data : data ? [data] : [];
      const formatted = certArray.map((c) => ({
        id: c.id || c.certificate_id || String(Math.random()).slice(2, 11),
        course: c.exam_name,
        date: c.issued_at ? new Date(c.issued_at).toLocaleDateString() : new Date().toLocaleDateString(),
        score: c.score,
        previewColor: "#003366",
      }));
      setCertificates((prev) => mergeCertificates(prev, formatted));
      setBackendUnavailable(false);
    } catch (_) {
      setBackendUnavailable(true);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // ================= GENERATE CERTIFICATE (PDF via backend, optional) =================
  const handleGenerateCertificate = async (cert) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const result = await generateCertificateAPI(userId, cert.course, cert.score || 90);

    if (result.generated) {
      alert("Certificate generated successfully!");
      loadCertificates();
    } else {
      alert("PDF generation requires the server, or certificate already exists.");
    }
  };

  // ================= PRINT =================
  const handlePrint = () => window.print();

  if (loading) return <div className="p-8">Loading certificates…</div>;

  // ================= CERTIFICATE VIEW =================
  if (selectedCert) {
    return (
      <div className="certificate-view-container">
        <div className="no-print">
          <button onClick={() => setSelectedCert(null)}>Back</button>
          <button onClick={handlePrint}>
            <FaPrint /> Print
          </button>
        </div>

        {/*<div className="certificate-paper">start
          <img
            src="/just_logo.svg"
            alt="Company Logo"
            className="certificate-logo"
          />
          <h1>Certificate Of Achievement</h1>
          <h2>{localStorage.getItem("full_name") || "Student Name"}</h2>
          <p className="certificate-subtitle">has successfully completed</p>
          <h3>{selectedCert.course}</h3>
          <p className="certificate-score">Score: {selectedCert.score || selectedCert.score === 0 ? `${selectedCert.score}%` : 'Score not available'}</p>
          <p className="certificate-date">Date: {selectedCert.date}</p>
          <div className="certificate-signature-section">
  <div className="signature-box">
    <img
      src="/signatures/sign.png"
      alt="Authorized Signature"
      className="signature-img"
    />
    <p>Authorized Signatory</p>
  </div>
</div>
        </div> endnow*/}
        <div className="certificate-paper" style={{ position: 'relative', overflow: 'hidden' }}>
          {certConfig?.templateUrl && (
            <img
              src={certConfig.templateUrl}
              alt="Background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.1,
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />
          )}
          {/* Triangle accents */} <div className="triangle top-left"></div> <div className="triangle top-right"></div> <div className="triangle bottom-left"></div> <div className="triangle bottom-right"></div>

          <div className="certificate-logo-wrapper" style={{ position: 'relative', zIndex: 1 }}>
            {/* Conditional Rendering for Logo */}
            {certConfig?.logoUrl && (
              <img src={certConfig.logoUrl} alt="Company Logo" className="certificate-logo" />
            )}
          </div>

          <h1 style={{ position: 'relative', zIndex: 1, marginBottom: '0.5rem' }}>{certConfig?.title}</h1>
          <h2 style={{ position: 'relative', zIndex: 1 }}>{localStorage.getItem("full_name") || "Student Name"}</h2>
          <p className="certificate-subtitle" style={{ position: 'relative', zIndex: 1 }}>has successfully completed</p>
          <h3 style={{ position: 'relative', zIndex: 1 }}>{selectedCert.course}</h3>

          <p className="certificate-score" style={{ position: 'relative', zIndex: 1 }}>
            Score: {selectedCert.score || selectedCert.score === 0 ? `${selectedCert.score}%` : 'Score not available'}
          </p>

          <p className="certificate-date" style={{ position: 'relative', zIndex: 1 }}>Date: {selectedCert.date}</p>

          <div className="certificate-signature-section" style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 1 }}>
            <div className="signature-box">
              {/* Conditional Rendering for Signature */}
              {certConfig?.signatureUrl && (
                <img src={certConfig.signatureUrl} alt="Authorized Signature" className="signature-img" />
              )}
              <p className="signature-text">{certConfig?.authorityName}</p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div>
      <div className="student-page-header">
        <h3>My Certificates</h3>
        <div>
          <FaTrophy /> 0 XP
        </div>
      </div>

      {certificates.length === 0 ? (
        <div>
          <p className="text-slate-500">No certificates yet. Complete exams to earn certificates.</p>
          {backendUnavailable && (
            <p className="text-sm text-slate-400 mt-2">When the server is running, you can sync more certificates.</p>
          )}
        </div>
      ) : (
        <>
          {backendUnavailable && (
            <p className="text-sm text-slate-500 mb-4">Showing your locally saved certificates. Start the server to generate PDFs.</p>
          )}
          {certificates.map((cert) => (
            <div key={cert.id} className="certificate-item">
              <h4>{cert.course}</h4>
              <p>Date: {cert.date}</p>
              <p>Score: {cert.score}</p>

              <button onClick={() => setSelectedCert(cert)}>View</button>
              <button onClick={() => handleGenerateCertificate(cert)}>
                Generate PDF
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default MyCertificates;
