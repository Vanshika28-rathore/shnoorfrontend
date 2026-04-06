import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AddInstructorView from "./view";

const AddInstructor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    subject: "",
    phone: "",
    bio: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await auth.currentUser.getIdToken();

      await api.post(
        "/api/users/instructors",
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          subject: data.subject,
          phone: data.phone,
          bio: data.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Error adding instructor:", err);
      setError(err.response?.data?.message || "Failed to add instructor");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    navigate("/admin/dashboard");
  };

  const handleBulkFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
      setBulkUploadResult(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;

    setIsBulkUploading(true);
    setBulkUploadProgress(0);

    const formData = new FormData();
    formData.append("csv", bulkFile);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await api.post("/api/users/instructors/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setBulkUploadProgress(percentCompleted);
        },
      });

      setBulkUploadResult(res.data);
      setBulkFile(null);
    } catch (err) {
      console.error("Bulk upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      setBulkUploadResult({
        successCount: 0,
        errors: [{ message: errorMsg }]
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const closeBulkUpload = () => {
    setShowBulkUpload(false);
    setBulkFile(null);
    setBulkUploadResult(null);
    if (bulkUploadResult?.successCount > 0) {
      navigate("/admin/dashboard");
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <AddInstructorView
      data={data}
      loading={loading}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      showSuccessPopup={showSuccessPopup}
      setShowSuccessPopup={handleSuccessClose}
      navigate={navigate}

      // Bulk Upload
      showBulkUpload={showBulkUpload}
      setShowBulkUpload={setShowBulkUpload}
      handleBulkFileSelect={handleBulkFileSelect}
      bulkFile={bulkFile}
      handleBulkUpload={handleBulkUpload}
      bulkUploadProgress={bulkUploadProgress}
      isBulkUploading={isBulkUploading}
      bulkUploadResult={bulkUploadResult}
      closeBulkUpload={closeBulkUpload}
    />
  );
};

export default AddInstructor;