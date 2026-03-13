import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { storage, db, auth } from "../../../auth/firebase";
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
  const [uploadingField, setUploadingField] = useState(null);
  const [error, setError] = useState("");

  /* =========================
     FETCH CONFIG FROM FIRESTORE
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
        setConfig((prev) => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching certificate config from Firestore:", err);
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

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 2MB.");
      return;
    }

    setUploadingField(fieldName);

    try {
      console.log(`Attempting Firebase Storage upload for ${fieldName}...`);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Storage timeout")), 15000)
      );

      const storageRef = ref(storage, `certificates/${fieldName}_${Date.now()}`);
      const uploadTask = uploadBytes(storageRef, file);

      const snapshot = await Promise.race([uploadTask, timeout]);
      const url = await getDownloadURL(snapshot.ref);

      updateField(fieldName, url);
      alert(`Image uploaded successfully! Don't forget to SAVE.`);

    } catch (err) {
      console.warn("Storage upload failed, switching to Base64 fallback:", err);

      try {
        const base64String = await fileToBase64(file);
        updateField(fieldName, base64String);
        alert(`Image uploaded via Backup Mode! Don't forget to SAVE.`);
      } catch (fallbackErr) {
        console.error("Base64 fallback failed:", fallbackErr);
        alert(`Upload failed completely. Please try a different image.`);
      }
    } finally {
      setUploadingField(null);
    }
  };

  /* =========================
     SAVE CONFIG TO FIRESTORE
  ========================= */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in as an admin to save changes.");
      }

      // Save to Firestore
      const docRef = doc(db, "settings", "certificateConfig");
      await setDoc(docRef, config, { merge: true });

      alert("Certificate configuration saved successfully!");
      setLoading(false);
    } catch (err) {
      console.error("Error saving config:", err);
      const friendlyMessage = err.message || "Failed to save configuration.";
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
