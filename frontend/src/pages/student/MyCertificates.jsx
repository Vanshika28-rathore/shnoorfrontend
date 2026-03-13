import { FaDownload, FaTrophy, FaCertificate, FaPrint } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { getLocalCertificates } from "../../utils/certificateStorage";
import "../../styles/Dashboard.css";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../auth/firebase";
import { getOrGenerateCertificateId } from "../../utils/idService";
import { exportToPDF } from "../../utils/certificatePDF";

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
  const [currentCertId, setCurrentCertId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchCertConfig = async () => {
      try {
        const docRef = doc(db, "settings", "certificateConfig");
        const docSnap = await getDoc(docRef);
        let firestoreData = docSnap.exists() ? docSnap.data() : {};

        // Handle legacy 'imageUrl'
        if (!firestoreData.signatureUrl && firestoreData.imageUrl) {
          firestoreData.signatureUrl = firestoreData.imageUrl;
        }

        const finalConfig = {
          ...defaultConfig,
          ...firestoreData,
          ...localOverrides,
          logoUrl: firestoreData.logoUrl || defaultConfig.logoUrl,
          signatureUrl: firestoreData.signatureUrl || firestoreData.imageUrl || defaultConfig.signatureUrl,
          authorityName: firestoreData.authorityName || defaultConfig.authorityName,
          title: firestoreData.title || defaultConfig.title,
        };

        setCertConfig(finalConfig);
      } catch (err) {
        console.error("Error fetching certificate configuration from Firestore:", err);
        setCertConfig(defaultConfig); // Fallback to defaults
      }
    };

    fetchCertConfig();
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

  // Fetch/Generate Unique ID when a certificate is viewed
  useEffect(() => {
    const fetchCertId = async () => {
      if (selectedCert) {
        const userId = localStorage.getItem("user_id") || "guest";
        const studentName = localStorage.getItem("full_name") || "Student";
        const certId = await getOrGenerateCertificateId(userId, selectedCert.course, studentName);
        setCurrentCertId(certId);
      } else {
        setCurrentCertId("");
      }
    };
    fetchCertId();
  }, [selectedCert]);

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
        <div className="certificate-actions no-print">
          <button className="back-btn" onClick={() => setSelectedCert(null)}>Back to My Certificates</button>
          <button
            className="download-pdf-btn"
            onClick={() => exportToPDF("certificate-to-print", `Certificate_${selectedCert.course.replace(/\s+/g, '_')}.pdf`)}
            disabled={isGenerating}
          >
            <FaDownload /> {isGenerating ? "Generating..." : "Download PDF"}
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
        <div className="certificate-paper" id="certificate-to-print">
          {/* Triangle accents */}
          <div className="triangle top-left"></div>
          <div className="triangle top-right"></div>
          <div className="triangle bottom-left"></div>
          <div className="triangle bottom-right"></div>
          {/* 1. Centered Logo */}
          {certConfig?.logoUrl && (
            <img src={certConfig.logoUrl} alt="Company Logo" className="certificate-logo" />
          )}

          {/* 2. Professional Title */}
          <h1>{certConfig?.title || "CERTIFICATE OF COMPLETION"}</h1>

          {/* 3. Intro Text */}
          <p className="this-is-to-certify">This is to certify that</p>

          {/* 4. Student Name (Bold & Centered) */}
          <h2 className="student-name-bold">{localStorage.getItem("full_name") || "Student Name"}</h2>

          {/* 5. Completion Statement */}
          <p className="program-completion-text">
            has successfully completed the training program with
          </p>
          <p className="company-name-highlight">
            SHNOOR International LLC
          </p>

          {/* 6. Issued Date */}
          <p className="issued-on-date">Issued on: {selectedCert.date}</p>

          {/* 7. Authorized Signature */}
          <div className="signature-section">
            {certConfig?.signatureUrl && (
              <img src={certConfig.signatureUrl} alt="Signature" className="signature-image" rotate="0" />
            )}
            <p className="signature-label">Authorized Signature</p>
          </div>

          {/* 8. NASSCOM Footer Logo */}
          <div className="nasscom-footer">
            <img src="/nasscom.jpg" alt="NASSCOM logo" className="nasscom-footer-logo" />
            <p className="nasscom-certified-text">Certified Member</p>
          </div>

          {/* Hidden QR and ID from "Front View" as requested */}
          <div className="qr-id-overlay">
            {currentCertId && (
              <QRCodeSVG
                value={`${window.location.origin}/verify/${currentCertId}`}
                size={40}
              />
            )}
            <span>ID: {currentCertId}</span>
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
