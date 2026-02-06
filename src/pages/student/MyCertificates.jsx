import { FaDownload, FaTrophy, FaCertificate, FaPrint } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import "../../styles/Dashboard.css";

// Generate certificate API
const generateCertificateAPI = async (user_id, course, score) => {
  try {
    const response = await fetch("http://localhost:5000/api/certificate/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        exam_name: course,
        score,
      }),
    });

    const data = await response.json();

    // Backend should return { generated: true/false }
    return data.generated ? { generated: true } : { generated: false };

  } catch (err) {
    console.error("Certificate API Error:", err);
    return { generated: false };
  }
};

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  // ================= FETCH CERTIFICATES =================
  const fetchCertificates = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      console.log("User not logged in");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/certificate/${userId}`
      );
      const data = await response.json();

      // Handle backend returning object or array
      const certArray = Array.isArray(data) ? data : [data];

      const formatted = certArray.map((c) => ({
        id: c.id || c.certificate_id || Math.random().toString(36).substr(2, 9),
        course: c.exam_name,
        date: c.issued_at
          ? new Date(c.issued_at).toLocaleDateString()
          : new Date().toLocaleDateString(),
        score: c.score,
        previewColor: "#003366",
      }));

      setCertificates(formatted);
      setLoading(false);
    } catch (error) {
      console.log("Fetch certificate error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // ================= GENERATE CERTIFICATE =================
  const handleGenerateCertificate = async (cert) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const result = await generateCertificateAPI(userId, cert.course, cert.score || 90);

    if (result.generated) {
      alert("Certificate generated successfully!");
      fetchCertificates(); // refresh list
    } else {
      alert("Certificate already exists or not eligible.");
    }
  };

  // ================= PRINT =================
  const handlePrint = () => window.print();

  if (loading) return <div className="p-8">Loading certificates...</div>;

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

        <div className="certificate-paper">
          <h1>Certificate Of Achievement</h1>
          <h2>{localStorage.getItem("full_name") || "Student Name"}</h2>
          <p className="certificate-subtitle">has successfully completed</p>
          <h3>{selectedCert.course}</h3>
          <p className="certificate-score">Score: {selectedCert.score || selectedCert.score === 0 ? `${selectedCert.score}%` : 'Score not available'}</p>
          <p className="certificate-date">Date: {selectedCert.date}</p>
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
        <p>No certificates found</p>
      ) : (
        certificates.map((cert) => (
          <div key={cert.id} className="certificate-item">
            <h4>{cert.course}</h4>
            <p>Date: {cert.date}</p>
            <p>Score: {cert.score}</p>

            <button onClick={() => setSelectedCert(cert)}>View</button>
            <button onClick={() => handleGenerateCertificate(cert)}>
              Generate PDF
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyCertificates;
