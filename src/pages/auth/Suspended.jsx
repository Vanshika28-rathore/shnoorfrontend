import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBan, FaSignOutAlt } from "react-icons/fa";
import { auth } from "../../auth/firebase";

const Suspended = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "450px",
          width: "100%",
          background: "#fff",
          borderRadius: "8px",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "28px",
          }}
        >
          <FaBan />
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>
          Account Suspended
        </h2>

        <p
          style={{
            marginTop: "12px",
            fontSize: "0.95rem",
            color: "#6b7280",
            lineHeight: "1.6",
          }}
        >
          Your account has been suspended by the administrator.
          <br />
          You no longer have access to the LMS.
        </p>

        <p
          style={{
            marginTop: "10px",
            fontSize: "0.9rem",
            color: "#6b7280",
          }}
        >
          Please contact support or the admin for further assistance.
        </p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            background: "#dc2626",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Suspended;
