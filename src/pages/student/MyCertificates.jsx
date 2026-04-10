import { FaDownload, FaTrophy, FaCertificate, FaMedal, FaCalendarAlt, FaChartBar, FaEye } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import "../../styles/Dashboard.css";
import { exportToPDF } from "../../utils/certificatePDF";

// ----------------------------------------------------------------------
// DEFAULT CONFIGURATION & LOCAL OVERRIDES (Frontend Only)
// ----------------------------------------------------------------------
const defaultConfig = {
  title: "Certificate of Achievement",
  authorityName: "Director of Education",
  issuerName: "Shnoor International LLC",
  logoUrl: "/shnoor_certificate_logo.png",
  signatureUrl: "/signatures/sign.png",
  templateUrl: "",
};

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
    const fetchCertConfig = async () => {
      try {
        const res = await api.get("/api/certificate/settings/config");
        const firestoreData = res.data || {};

        const finalConfig = {
          ...defaultConfig,
          ...firestoreData,
          ...localOverrides,
          logoUrl: (() => {
            const raw = String(firestoreData.logoUrl || defaultConfig.logoUrl).replace('/public/', '/');
            return (raw && !raw.startsWith('/') && !raw.startsWith('http')) ? `/${raw}` : raw;
          })(),
          signatureUrl: String(firestoreData.signatureUrl || firestoreData.imageUrl || defaultConfig.signatureUrl).replace('/public/', '/'),
          authorityName: firestoreData.authorityName || defaultConfig.authorityName,
          title: firestoreData.title || defaultConfig.title,
        };

        setCertConfig(finalConfig);
      } catch (err) {
        console.error("Error fetching certificate configuration:", err);
        setCertConfig(defaultConfig);
      }
    };

    fetchCertConfig();
  }, []);

  const loadCertificates = useCallback(async () => {
    try {
      const meRes = await api.get("/api/auth/me", { timeout: 2000 });
      if (meRes.data?.full_name) {
        localStorage.setItem("full_name", String(meRes.data.full_name));
      }
    } catch (_) { }

    try {
      const res = await api.get(`/api/certificate/my`);
      const data = res.data;
      const certArray = Array.isArray(data) ? data : data ? [data] : [];
      const formatted = certArray.map((c) => ({
        id: c.id || c.certificate_id,
        course: c.exam_name || "Exam",
        date: c.issued_at ? new Date(c.issued_at).toLocaleDateString() : new Date().toLocaleDateString(),
        score: c.score,
        certificate_id: c.certificate_id,
        previewColor: "#003366",
      }));
      setCertificates(formatted);
      setBackendUnavailable(false);
    } catch (_) {
      setCertificates([]);
      setBackendUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  if (loading) return <div className="p-8">Loading certificates…</div>;

  if (selectedCert) {
    return (
      <div className="w-full min-h-screen bg-slate-50 p-3 sm:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-4xl mx-auto mb-6 sm:mb-8">
          <button 
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2" 
            onClick={() => setSelectedCert(null)}
          >
            Back to My Certificates
          </button>
          <button
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            onClick={() => exportToPDF("certificate-to-print", `Certificate_${selectedCert.course.replace(/\s+/g, '_')}.pdf`)}
          >
            <FaDownload /> Download PDF
          </button>
        </div>

        <div className="certificate-paper" id="certificate-to-print">
          <div className="triangle top-left"></div>
          <div className="triangle top-right"></div>
          <div className="triangle bottom-left"></div>
          <div className="triangle bottom-right"></div>

          {certConfig?.logoUrl ? (
            <img src={certConfig.logoUrl} alt="Company Logo" className="certificate-logo" />
          ) : (
            <img src="/shnoor_certificate_logo.png" alt="Company Logo" className="certificate-logo" />
          )}

          <h1>{certConfig?.title || "CERTIFICATE OF COMPLETION"}</h1>

          <p className="this-is-to-certify">This is to certify that</p>

          <h2 className="student-name-bold">{localStorage.getItem("full_name") || "Student Name"}</h2>

          <p className="program-completion-text">
            has successfully completed the training program with
          </p>
          <p className="company-name-highlight">
            {certConfig?.issuerName || "SHNOOR International LLC"}
          </p>

          <p className="issued-on-date">Issued on: {selectedCert.date}</p>

          <div className="signature-section">
            {certConfig?.signatureUrl ? (
              <img src={certConfig.signatureUrl} alt="Signature" className="signature-image" />
            ) : (
              <img src="/signatures/sign.png" alt="Signature" className="signature-image" />
            )}
            <p className="signature-label">Authorized Signature</p>
            <p className="authority-name-text" style={{ fontSize: '10px', marginTop: '2px', color: '#64748b' }}>
              {certConfig?.authorityName || "Director of Education"}
            </p>
          </div>

          <div className="nasscom-footer">
            <img src="/nasscom.jpg" alt="NASSCOM logo" className="nasscom-footer-logo" />
            <p className="nasscom-certified-text">Certified Member</p>
          </div>

          <div className="qr-id-overlay">
            {selectedCert.certificate_id && (
              <QRCodeSVG
                value={`${window.location.origin}/verify/${selectedCert.certificate_id}`}
                size={40}
              />
            )}
            <span>ID: {selectedCert.certificate_id || "N/A"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <FaMedal size={24} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">My Certificates</h1>
              <p className="text-slate-400 text-sm mt-0.5">Your earned achievements and credentials.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
            <FaTrophy className="text-amber-300" size={16} />
            <span className="text-white font-bold text-sm">{certificates.length} Earned</span>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      </div>

      {backendUnavailable && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
          Unable to load generated certificates right now. Please try again.
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <FaMedal className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Certificates Yet</h3>
          <p className="text-sm text-slate-400">Complete exams to earn certificates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:border-indigo-200 hover:shadow-md transition-all duration-300 group"
            >
              <div
                className="h-36 flex flex-col items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)' }}
              >
                <FaMedal className="text-amber-400/60 group-hover:text-amber-400/90 transition-colors" size={52} />
                {cert.certificate_id && (
                  <span className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400/70">
                    {cert.certificate_id}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {cert.course}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400 mb-5">
                  <div className="flex items-center gap-1.5">
                    <FaCalendarAlt size={11} className="text-slate-400" />
                    {cert.date}
                  </div>
                  {cert.score != null && (
                    <div className="flex items-center gap-1.5">
                      <FaChartBar size={11} className="text-emerald-500" />
                      <span className="font-bold text-slate-600">{cert.score}%</span>
                    </div>
                  )}
                </div>

                <button
                  className="mt-auto w-full text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                  onClick={() => setSelectedCert(cert)}
                >
                  <FaEye size={13} /> View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;