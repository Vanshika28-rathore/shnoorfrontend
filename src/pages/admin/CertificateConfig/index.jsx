import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../auth/firebase";
import CertificateConfigView from "./view";

const CertificateConfig = () => {
  const [config, setConfig] = useState({
    title: "Certificate of Achievement",
    logoUrl: "",
    templateUrl: "",
    signatureUrl: "",
    authorityName: "Director of Education",
    issuerName: "Shnoor LMS",
  });

  const [loading, setLoading] = useState(true);
  // Track which specific field is currently uploading (e.g., 'logoUrl', 'signatureUrl')
  const [uploadingField, setUploadingField] = useState(null);
  const [error, setError] = useState("");

  /* =========================
     FETCH CONFIG
  ========================= */
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "settings", "certificateConfig");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        // Default settings if nothing exists
        setConfig({
          title: "Certificate of Achievement",
          logoUrl: "",
          templateUrl: "",
          signatureUrl: "",
          authorityName: "Director of Education",
          issuerName: "Shnoor LMS",
        });
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
  /* =========================
     HELPER: File to Base64
  ========================= */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /* =========================
     HANDLE FILE UPLOAD
  ========================= */
  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    // Validate file size (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 2MB.");
      return;
    }

    setUploadingField(fieldName);

    try {
      // Try Firebase Storage first
      console.log(`Attempting Firebase Storage upload for ${fieldName}...`);

      // 15 seconds timeout for Storage
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Storage timeout")), 15000)
      );

      const storageRef = ref(storage, `certificates/${fieldName}_${Date.now()}`);
      const uploadTask = uploadBytes(storageRef, file);

      const snapshot = await Promise.race([uploadTask, timeout]);
      const url = await getDownloadURL(snapshot.ref);

      updateField(fieldName, url);
      alert(`${fieldName === 'logoUrl' ? 'Logo' : fieldName === 'signatureUrl' ? 'Signature' : 'Image'} uploaded successfully! Don't forget to SAVE.`);

    } catch (err) {
      console.warn("Storage upload failed, switching to Base64 fallback:", err);

      try {
        // Fallback: Convert to Base64
        const base64String = await fileToBase64(file);
        updateField(fieldName, base64String);
        alert(`${fieldName === 'logoUrl' ? 'Logo' : fieldName === 'signatureUrl' ? 'Signature' : 'Image'} uploaded via Backup Mode! Don't forget to SAVE.`);
      } catch (fallbackErr) {
        console.error("Base64 fallback failed:", fallbackErr);
        alert(`Upload failed completely. Please try a different image.`);
      }
    } finally {
      setUploadingField(null);
    }
  };

  /* =========================
     SAVE CONFIG
  ========================= */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      await setDoc(doc(db, "settings", "certificateConfig"), config);

      alert("Certificate configuration saved successfully!");
      setLoading(false);
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Failed to save settings: " + err.message);
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
