import { useEffect, useState } from "react";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import CertificateConfigView from "./view";

const CertificateConfig = () => {
  const [config, setConfig] = useState({
    title: "Certificate of Achievement",
    logoUrl: "/shnoor_certificate_logo.png",
    templateUrl: "",
    signatureUrl: "",
    authorityName: "Director of Education",
    issuerName: "Shnoor International LLC",
  });

  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null);
  const [error, setError] = useState("");

  /* =========================
     FETCH CONFIG FROM BACKEND BRIDGE
  ========================= */
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/certificate/settings/config");
      if (res.data) {
        setConfig((prev) => ({ ...prev, ...res.data }));
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching certificate config:", err);
      setError("Failed to load certificate configuration");
      setLoading(false);
    }
  };

  /* =========================
     UPDATE FIELDS
  ========================= */
  const updateField = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================
     HANDLE FILE UPLOAD
  ========================= */
  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 2MB.");
      return;
    }

    setUploadingField(fieldName);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = await auth.currentUser.getIdToken();
      const res = await api.post("/api/certificate/settings/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      updateField(fieldName, res.data.url);
      alert(`Image uploaded successfully! Don't forget to SAVE.`);
    } catch (err) {
      console.error("Upload failed:", err);
      const friendlyMessage =
        err.response?.data?.message || err.message || "Failed to upload file.";
      alert(`Upload failed: ${friendlyMessage}`);
    } finally {
      setUploadingField(null);
    }
  };

  /* =========================
     SAVE CONFIG TO BACKEND BRIDGE
  ========================= */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/certificate/settings/config", config);

      if (res.data?.success) {
        alert("Certificate configuration saved successfully via Secure Bridge!");
      } else {
        alert("Configuration saved successfully!");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error saving config:", err);
      const friendlyMessage = err.response?.data?.message || err.message || "Failed to save configuration.";
      setError(friendlyMessage);
      alert("Failed to save: " + friendlyMessage);
      setLoading(false);
    }
  };

  return (
    <CertificateConfigView
      loading={loading}
      uploadingField={uploadingField}
      error={error}
      config={config}
      updateField={updateField}
      handleSave={handleSave}
      handleFileUpload={handleFileUpload}
    />
  );
};

export default CertificateConfig;