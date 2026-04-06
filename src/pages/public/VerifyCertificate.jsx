import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { FaCheckCircle, FaTimesCircle, FaCertificate, FaArrowLeft } from "react-icons/fa";
import "../../styles/Dashboard.css";

const VerifyCertificate = () => {
    const { certId } = useParams();
    const [loading, setLoading] = useState(true);
    const [certData, setCertData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyCert = async () => {
            if (!certId) {
                setError("Invalid Certificate ID");
                setLoading(false);
                return;
            }

            try {
                const res = await api.get(`/api/certificate/verify/${encodeURIComponent(certId)}`);
                setCertData(res.data);
            } catch (err) {
                if (err?.response?.status === 404) {
                    setError("Invalid Certificate: Record not found in our system.");
                } else {
                    console.error("Verification error:", err);
                    setError("An error occurred during verification. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        verifyCert();
    }, [certId]);

    if (loading) {
        return (
            <div className="verify-container">
                <div className="verify-card loading">
                    <div className="spinner"></div>
                    <p>Verifying Certificate Authenticity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-container">
            <div className="verify-card">
                <div className="verify-header">
                    <FaCertificate className="verify-icon-bg" />
                    <h2>Shnoor LMS</h2>
                    <p className="verify-tagline">Official Verification Portal</p>
                </div>

                {certData ? (
                    <div className="verify-result success">
                        <FaCheckCircle className="status-icon" />
                        <h3>Certificate Verified</h3>
                        <div className="cert-details">
                            <div className="detail-row">
                                <span className="label">Student Name:</span>
                                <span className="value">{certData.student_name || "N/A"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Course Name:</span>
                                <span className="value">{certData.exam_name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Certificate ID:</span>
                                <span className="value highlight">{certData.certificate_id}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Issue Date:</span>
                                <span className="value">
                                    {certData.issued_at ? new Date(certData.issued_at).toLocaleDateString() : "Present"}
                                </span>
                            </div>
                        </div>
                        <p className="verification-note">
                            This certificate is authentic and was officially issued by Shnoor LMS.
                        </p>
                    </div>
                ) : (
                    <div className="verify-result failure">
                        <FaTimesCircle className="status-icon" />
                        <h3>Verification Failed</h3>
                        <p className="error-msg">{error}</p>
                        <p className="verification-note">
                            If you believe this is an error, please contact our support team.
                        </p>
                    </div>
                )}

                <div className="verify-footer">
                    <Link to="/" className="back-home-link">
                        <FaArrowLeft /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyCertificate;