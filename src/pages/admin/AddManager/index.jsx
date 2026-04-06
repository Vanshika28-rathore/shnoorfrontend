import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AddManagerView from "./view";

const AddManager = () => {
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
    college: "",
    phone: "",
    password: "",
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
        "/api/users/managers",
        {
          fullName: data.fullName,
          email: data.email,
          college: data.college,
          phone: data.phone,
          password: data.password,
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
      console.error("Error adding manager:", err);
      setError(err.response?.data?.message || "Failed to add manager");
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
      const res = await api.post("/api/users/managers/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setBulkUploadProgress(percentCompleted);
        },
      });

      setBulkUploadResult({
        successCount: res.data?.summary?.successful ?? 0,
        errors: res.data?.errors || [],
      });
      setBulkFile(null);
    } catch (err) {
      console.error("Bulk manager upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      setBulkUploadResult({
        successCount: 0,
        errors: err.response?.data?.errors || [{ message: errorMsg }],
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

  return (
    <AddManagerView
      data={data}
      loading={loading}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      navigate={navigate}
      showSuccessPopup={showSuccessPopup}
      setShowSuccessPopup={handleSuccessClose}
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

export default AddManager;
