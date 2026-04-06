import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AddCourseView from "./view";

export const AddCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get("edit");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
    level: "",
    customCategory: "",
    status: "draft",
    modules: [],
    validity_value: "",
    validity_unit: "days",
    scheduleDate: "",
    isPaid: false,
    price: "",
    prereq_description: "",
    prereq_video_urls: [""], // Changed to array with one empty string
    prereq_pdf_url: "",
    // Learning Path
    isLearningPath: false,
    learningPathId: "",       // existing path id
    newLearningPathName: "", // or create new
    learningPathOrder: 1,
  });

  const [moduleForm, setModuleForm] = useState({
    title: "",
    type: "video", // Default to video
    url: "",
    duration: "",
    notes: "",
    pdfUrl: "",
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoInputType, setVideoInputType] = useState("url");
  const [pdfInputType, setPdfInputType] = useState("url");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

  // Learning Path State
  const [myLearningPaths, setMyLearningPaths] = useState([]);
  const [isCreatingNewPath, setIsCreatingNewPath] = useState(false);

  // Module Bulk Upload State
  const [showModuleBulkUpload, setShowModuleBulkUpload] = useState(false);
  const [moduleBulkFile, setModuleBulkFile] = useState(null);
  const [moduleResourceFiles, setModuleResourceFiles] = useState([]);
  const [isModuleBulkUploading, setIsModuleBulkUploading] = useState(false);
  const [moduleBulkUploadProgress, setModuleBulkUploadProgress] = useState(0);
  const [moduleBulkUploadResult, setModuleBulkUploadResult] = useState(null);

  // Fetch instructor's existing learning paths
  useEffect(() => {
    const fetchLearningPaths = async () => {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await api.get("/api/learning-paths/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyLearningPaths(res.data || []);
      } catch (err) {
        console.error("Failed to fetch learning paths:", err);
      }
    };
    fetchLearningPaths();
  }, []);


  // Preview State
  const [previewModuleId, setPreviewModuleId] = useState(null);

  const addVideoUrl = () => {
    setCourseData((prev) => ({
      ...prev,
      prereq_video_urls: [...prev.prereq_video_urls, ""],
    }));
  };

  const removeVideoUrl = (index) => {
    setCourseData((prev) => ({
      ...prev,
      prereq_video_urls: prev.prereq_video_urls.filter((_, i) => i !== index),
    }));
  };

  const updateVideoUrl = (index, value) => {
    setCourseData((prev) => ({
      ...prev,
      prereq_video_urls: prev.prereq_video_urls.map((url, i) =>
        i === index ? value : url,
      ),
    }));
  };

  useEffect(() => {
    if (location.state?.courseData) {
      const data = location.state.courseData;
      setCourseData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        thumbnail: data.thumbnail || "",
        level: data.level || "",
        status: data.status || "draft",
        modules: data.modules || [],
        customCategory: "",
        validity_value: data.validity_value || "",
        validity_unit: data.validity_unit || "days",
        scheduledDate: data.scheduled_start_at || "",
        isPaid: data.is_paid || false,
        price: data.price || "",
      });
    }
  }, [editCourseId, location.state]);

  /* =========================
     HANDLERS
     ========================= */
  const handleCourseChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      if (value === "custom") {
        setIsCustomCategory(true);
        setCourseData((p) => ({ ...p, category: "" }));
      } else {
        setIsCustomCategory(false);
        setCourseData((p) => ({ ...p, category: value }));
      }
    } else {
      setCourseData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setModuleForm((p) => ({ ...p, [name]: value }));
  };

  const addModule = () => {
    if (!moduleForm.title || !moduleForm.url) return;

    setCourseData((p) => ({
      ...p,
      modules: [
        ...p.modules,
        {
          id: Date.now().toString(),
          ...moduleForm,
          duration: moduleForm.type === "pdf" ? 0 : moduleForm.duration || 0,
        },
      ],
    }));

    setModuleForm({
      title: "",
      type: "video",
      url: "",
      duration: "",
      notes: "",
      pdfUrl: "",
    });
  };

  const removeModule = (id) => {
    setCourseData((p) => ({
      ...p,
      modules: p.modules.filter((m) => m.id !== id),
    }));
  };

  const moveModule = (index, direction) => {
    setCourseData((p) => {
      const mods = [...p.modules];
      const target = index + direction;
      if (target < 0 || target >= mods.length) return p;
      const [moved] = mods.splice(index, 1);
      mods.splice(target, 0, moved);
      return { ...p, modules: mods };
    });
  };

  {/*const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    // OPTIONAL: size check
    if (file.size > 100 * 1024 * 1024) {
      alert("File too large (max 100MB)");
      return;
    }

    // TEMP: if you're not uploading yet, just simulate
    // (prevents crash and keeps flow working)
    setUploading(true);

    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      setModuleForm((prev) => ({
        ...prev,
        [fieldName]: fakeUrl,
      }));
      setUploading(false);
      setUploadProgress(100);
    }, 800);
  };*/}

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      alert("File too large (max 500MB)");
      return;
    }

    setUploading(true);
    setUploadProgress(0); // Optional: if you implement progress tracking

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted =
            Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setModuleForm((prev) => ({
        ...prev,
        [fieldName]: res.data.url,
      }));

      const displayType = fieldName === 'notes' ? 'Notes PDF' : 
                         moduleForm.type === 'pdf' ? 'PDF' : 
                         // 🚫 COMMENTED OUT: Video and text stream support removed
                         // moduleForm.type === 'video' ? 'Video' : 
                         // moduleForm.type === 'text_stream' ? 'Text Stream' : 
                         'File';
      
      alert(`${displayType} uploaded successfully!`);

    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to upload file.";
      alert(`Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
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
    formData.append("file", bulkFile);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await api.post("/api/courses/bulk-upload", formData, {
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
      setBulkFile(null); // Clear file after upload
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
    // Optionally refresh list if needed, but we are in AddCourse page. 
    // Maybe navigate to dashboard if success?
    if (bulkUploadResult?.successCount > 0) {
      navigate("/instructor/dashboard");
    }
  };

  /* =========================
     MODULE BULK UPLOAD HANDLERS
     ========================= */
  const handleModuleBulkFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setModuleBulkFile(e.target.files[0]);
      setModuleBulkUploadResult(null);
    }
  };

  const handleModuleResourceFilesSelect = (e) => {
    if (e.target.files) {
      setModuleResourceFiles(Array.from(e.target.files));
    }
  };

  const handleModuleBulkUpload = async () => {
    if (!moduleBulkFile) return;

    if (!editCourseId && !courseData.id) {
      alert("Please save the course as a 'Draft' first to use Bulk Upload.");
      return;
    }

    const targetCourseId = editCourseId || courseData.id; // Assuming courseData might have ID if saved but URL not updated

    setIsModuleBulkUploading(true);
    setModuleBulkUploadProgress(0);

    const formData = new FormData();
    formData.append("courseId", targetCourseId);
    formData.append("file", moduleBulkFile);

    if (moduleResourceFiles.length > 0) {
      moduleResourceFiles.forEach(f => {
        formData.append("resources", f);
      });
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await api.post("/api/modules/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setModuleBulkUploadProgress(percentCompleted);
        },
      });

      setModuleBulkUploadResult(res.data);

      // Refresh Modules List
      const modulesRes = await api.get(`/api/courses/${targetCourseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourseData(prev => ({
        ...prev,
        modules: modulesRes.data.map(m => ({
          id: m.module_id,
          title: m.title,
          type: m.type,
          url: m.content_url,
          duration: m.duration_mins,
          order: m.module_order
        }))
      }));

    } catch (err) {
      console.error("Module bulk upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      setModuleBulkUploadResult({
        successCount: 0,
        errors: [{ message: errorMsg }]
      });
    } finally {
      setIsModuleBulkUploading(false);
    }
  };

  const closeModuleBulkUpload = () => {
    setShowModuleBulkUpload(false);
    setModuleBulkFile(null);
    setModuleResourceFiles([]);
    setModuleBulkUploadResult(null);
  };

  const handleSubmit = async (statusOverride) => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();

      const finalCategory = isCustomCategory
        ? courseData.customCategory
        : courseData.category;

      const courseRes = await api.post(
        "/api/courses",
        {
          title: courseData.title,
          description: courseData.description,
          category: finalCategory,
          difficulty: courseData.level,
          status: statusOverride,
          validity_value: courseData.validity_value
            ? Number(courseData.validity_value)
            : null,
          validity_unit: courseData.validity_value
            ? courseData.validity_unit
            : null,
          schedule_start_at: courseData.scheduleDate || null,

          price_type:
            courseData.isPaid === true || courseData.isPaid === "true"
              ? "paid"
              : "free",

          price_amount:
            courseData.isPaid === true || courseData.isPaid === "true"
              ? Number(courseData.price || 0)
              : null,
          prereq_description: courseData.prereq_description || null,
          prereq_video_urls: courseData.prereq_video_urls.filter(
            (url) => url.trim() !== "",
          ),
          prereq_pdf_url: courseData.prereq_pdf_url || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const courseId = courseRes.data.course.courses_id;

      if (courseData.modules.length) {
        await api.post(
          "/api/modules",
          {
            courseId,
            modules: courseData.modules.map((m, i) => ({
              title: m.title,
              type: m.type,
              content_url: m.url,
              notes: m.notes || null,
              duration: m.duration || 0,
              order_index: i + 1,
            })),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      // ── Learning Path assignment ──────────────────────────────────
      if (courseData.isLearningPath) {
        let targetPathId = courseData.learningPathId;

        // If instructor chose to create a new path
        if (isCreatingNewPath && courseData.newLearningPathName.trim()) {
          const lpRes = await api.post(
            "/api/learning-paths",
            { name: courseData.newLearningPathName.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          targetPathId = lpRes.data.id;
        }

        if (targetPathId) {
          await api.post(
            "/api/learning-paths/add-course",
            {
              learningPathId: targetPathId,
              courseId,
              orderIndex: Number(courseData.learningPathOrder) || 1,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      navigate("/instructor/dashboard");
    } catch (err) {
      console.error("Save course error:", err);
      const msg = err?.response?.data?.message || err?.message || "Unknown error";
      alert(`Failed to save course.\n\nReason: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EXPOSE ONLY LOGIC
     ========================= */
  return (
    <AddCourseView
      step={step}
      setStep={setStep}
      loading={loading}
      courseData={courseData}
      moduleForm={moduleForm}
      isCustomCategory={isCustomCategory}
      uploadProgress={uploadProgress}
      uploading={uploading}
      videoInputType={videoInputType}
      pdfInputType={pdfInputType}
      setVideoInputType={setVideoInputType}
      setPdfInputType={setPdfInputType}
      handleCourseChange={handleCourseChange}
      handleModuleChange={handleModuleChange}
      handleFileUpload={handleFileUpload}
      addModule={addModule}
      removeModule={removeModule}
      moveModule={moveModule}
      handleSubmit={handleSubmit}
      addVideoUrl={addVideoUrl}
      removeVideoUrl={removeVideoUrl}
      updateVideoUrl={updateVideoUrl}
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

      // Module Bulk Upload
      showModuleBulkUpload={showModuleBulkUpload}
      setShowModuleBulkUpload={setShowModuleBulkUpload}
      handleModuleBulkFileSelect={handleModuleBulkFileSelect}
      moduleBulkFile={moduleBulkFile}
      handleModuleResourceFilesSelect={handleModuleResourceFilesSelect}
      moduleResourceFiles={moduleResourceFiles}
      handleModuleBulkUpload={handleModuleBulkUpload}
      moduleBulkUploadProgress={moduleBulkUploadProgress}
      isModuleBulkUploading={isModuleBulkUploading}
      moduleBulkUploadResult={moduleBulkUploadResult}
      closeModuleBulkUpload={closeModuleBulkUpload}

      // Preview
      previewModuleId={previewModuleId}
      setPreviewModuleId={setPreviewModuleId}

      // Learning Path
      myLearningPaths={myLearningPaths}
      isCreatingNewPath={isCreatingNewPath}
      setIsCreatingNewPath={setIsCreatingNewPath}
      setCourseData={setCourseData}
    />
  );
};

export default AddCourse;