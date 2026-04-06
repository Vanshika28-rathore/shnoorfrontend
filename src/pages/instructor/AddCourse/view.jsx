/* eslint-disable no-unused-vars */
import React from "react";
import {
  Plus,
  Video,
  FileText,
  ArrowRight,
  ArrowLeft,
  Save,
  Trash2,
  Check,
  ArrowUp,
  ArrowDown,
  Info,
  Minus,
  Upload,
} from "lucide-react";
// import TextStreamPlayer from "../../student/CoursePlayer/TextStreamPlayer";

const AddCourseView = ({
  step,
  setStep,
  loading,
  courseData,
  handleCourseChange,
  moduleForm,
  handleModuleChange,
  isCustomCategory,
  videoInputType,
  setVideoInputType,
  pdfInputType,
  setPdfInputType,
  handleFileUpload,
  uploading,
  uploadProgress,
  addModule,
  removeModule,
  moveModule,
  handleSubmit,
  editCourseId,
  addVideoUrl,
  removeVideoUrl,
  updateVideoUrl,
  showBulkUpload,
  setShowBulkUpload,
  handleBulkFileSelect,
  bulkFile,
  handleBulkUpload,
  bulkUploadProgress,
  isBulkUploading,
  bulkUploadResult,
  closeBulkUpload,
  showModuleBulkUpload,
  setShowModuleBulkUpload,
  handleModuleBulkFileSelect,
  moduleBulkFile,
  handleModuleResourceFilesSelect,
  moduleResourceFiles,
  handleModuleBulkUpload,
  moduleBulkUploadProgress,
  isModuleBulkUploading,
  moduleBulkUploadResult,
  closeModuleBulkUpload,
  previewModuleId,
  setPreviewModuleId,
  // Learning Path
  myLearningPaths,
  isCreatingNewPath,
  setIsCreatingNewPath,
  setCourseData,
}) => {
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Processing course data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 font-sans text-primary-900 flex flex-col">
      <div className="w-full max-w-none space-y-4 flex-1 flex flex-col">

        {/* --- Header Section — file1 dark gradient style --- */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                {editCourseId ? "Edit Course" : "Create New Course"}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Configure course details and curriculum.
              </p>
            </div>
            {/* Step indicators — file1 indigo style */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      step >= s
                        ? "bg-indigo-500 text-white border-indigo-400"
                        : "bg-white/10 text-slate-400 border-white/20"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-1 transition-all ${step > s ? "bg-indigo-400" : "bg-white/20"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Decorative blob */}
          <div
            className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
          />
        </div>

        {!editCourseId && (
          <div className="bg-white rounded-xl border border-slate-100 px-6 py-2 flex justify-end">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
            >
              <Plus size={14} /> Bulk Upload (CSV)
            </button>
          </div>
        )}

        {/* --- Main Content --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 p-6">

          {/* STEP 1: Course Details */}
          {step === 1 && (
            <div className="w-full">
              <h3 className="text-sm font-bold text-primary-900 border-b border-slate-100 pb-4 mb-6 uppercase tracking-wide flex items-center gap-2">
                <Info className="text-slate-400" size={16} /> Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Course Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="title"
                      placeholder="e.g. Advanced System Design"
                      value={courseData.title}
                      onChange={handleCourseChange}
                      autoFocus
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-primary-900 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="5"
                      placeholder="Overview of learning outcomes..."
                      value={courseData.description}
                      onChange={handleCourseChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-primary-900 text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Thumbnail URL
                    </label>
                    <input
                      name="thumbnail"
                      placeholder="https://..."
                      value={courseData.thumbnail}
                      onChange={handleCourseChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-primary-900 text-sm"
                    />
                  </div>

                  {/* Schedule & Pricing */}
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Schedule Release (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        name="scheduleDate"
                        value={courseData.scheduleDate || ""}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-slate-700 text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Pricing Strategy
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-md hover:bg-slate-50 flex-1">
                          <input
                            type="radio"
                            name="isPaid"
                            value="false"
                            checked={courseData.isPaid === false || courseData.isPaid === "false"}
                            onChange={() => handleCourseChange({ target: { name: "isPaid", value: false } })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-semibold text-slate-700">Free Course</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-md hover:bg-slate-50 flex-1">
                          <input
                            type="radio"
                            name="isPaid"
                            value="true"
                            checked={courseData.isPaid === true || courseData.isPaid === "true"}
                            onChange={() => handleCourseChange({ target: { name: "isPaid", value: true } })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-semibold text-slate-700">Paid Course</span>
                        </label>
                      </div>

                      {(courseData.isPaid === true || courseData.isPaid === "true") && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                          <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                            Price (INR)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              name="price"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={courseData.price || ""}
                              onChange={handleCourseChange}
                              className="w-full pl-8 pr-4 py-2.5 bg-white border border-emerald-200 rounded-md focus:border-emerald-500 focus:ring-0 outline-none text-slate-900 font-bold text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pre-requirements */}
                  <div className="mt-4 space-y-4 border border-slate-200 rounded-md p-4 bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                      <Info size={14} className="text-indigo-500" />
                      Pre-requirements for this course
                    </h4>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">
                        Concepts students should know before starting
                      </label>
                      <textarea
                        name="prereq_description"
                        rows="3"
                        placeholder="e.g. Basic Python syntax, linear algebra fundamentals..."
                        value={courseData.prereq_description}
                        onChange={handleCourseChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-500">Recommended Video Links</label>
                        <button
                          type="button"
                          onClick={addVideoUrl}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                        >
                          <Plus size={12} /> Add Video
                        </button>
                      </div>
                      <div className="space-y-2">
                        {courseData.prereq_video_urls.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              placeholder={`Video ${index + 1}: https://youtube.com/...`}
                              value={url}
                              onChange={(e) => updateVideoUrl(index, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-xs"
                            />
                            {courseData.prereq_video_urls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVideoUrl(index)}
                                className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">PDF Links</label>
                      <input
                        name="prereq_pdf_url"
                        placeholder="https://... (public PDF link)"
                        value={courseData.prereq_pdf_url}
                        onChange={handleCourseChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={isCustomCategory ? "custom" : courseData.category}
                      onChange={handleCourseChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none transition-all text-slate-700 text-sm cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      <option value="Web Development">Web Development</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="custom">+ Add New</option>
                    </select>
                  </div>

                  {isCustomCategory && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                        New Category Name
                      </label>
                      <input
                        name="customCategory"
                        placeholder="Enter category name"
                        value={courseData.customCategory}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-sm"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="level"
                        value={courseData.level}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-slate-700 text-sm"
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Validity <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="validity_value"
                          value={courseData.validity_value}
                          onChange={handleCourseChange}
                          className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                        />
                        <select
                          name="validity_unit"
                          value={courseData.validity_unit}
                          onChange={handleCourseChange}
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                        >
                          <option value="days">Days</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Learning Path Section — file2 only ── */}
              <div className="mt-6 border border-indigo-100 rounded-xl p-5 bg-indigo-50/40">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="isLearningPath"
                    checked={courseData.isLearningPath}
                    onChange={(e) =>
                      setCourseData((p) => ({
                        ...p,
                        isLearningPath: e.target.checked,
                        learningPathId: "",
                        newLearningPathName: "",
                        learningPathOrder: 1,
                      }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor="isLearningPath"
                    className="text-sm font-bold text-indigo-700 cursor-pointer select-none"
                  >
                    🛤️ Add this course to a Learning Path
                  </label>
                </div>

                {courseData.isLearningPath && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Learning Path
                      </label>
                      <select
                        value={isCreatingNewPath ? "__new__" : courseData.learningPathId}
                        onChange={(e) => {
                          if (e.target.value === "__new__") {
                            setIsCreatingNewPath(true);
                            setCourseData((p) => ({ ...p, learningPathId: "" }));
                          } else {
                            setIsCreatingNewPath(false);
                            setCourseData((p) => ({ ...p, learningPathId: e.target.value }));
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-md focus:border-indigo-500 focus:ring-0 outline-none text-sm text-slate-700"
                      >
                        <option value="">— Select existing learning path —</option>
                        {myLearningPaths.map((lp) => (
                          <option key={lp.id} value={lp.id}>
                            {lp.name} ({lp.course_count} course{lp.course_count !== 1 ? "s" : ""})
                          </option>
                        ))}
                        <option value="__new__">+ Create New Learning Path</option>
                      </select>
                    </div>

                    {isCreatingNewPath && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                          New Learning Path Name
                        </label>
                        <input
                          placeholder="e.g. AI & Machine Learning Path"
                          value={courseData.newLearningPathName}
                          onChange={(e) => setCourseData((p) => ({ ...p, newLearningPathName: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border border-indigo-300 rounded-md focus:border-indigo-500 outline-none text-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Order in Learning Path
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={courseData.learningPathOrder}
                        onChange={(e) => setCourseData((p) => ({ ...p, learningPathOrder: e.target.value }))}
                        className="w-28 px-4 py-2.5 bg-white border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                      />
                      <p className="text-xs text-slate-400">
                        Position of this course in the learning path (1 = first)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Proceed button — file1 gradient style */}
              <div className="mt-10 flex justify-end">
                <button
                  className="text-white font-semibold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
                  onClick={() => setStep(2)}
                  disabled={!courseData.title || (!courseData.category && !courseData.customCategory) || !courseData.level}
                >
                  Proceed to Curriculum <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Curriculum */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              {/* Left: Module Form */}
              <div className="lg:col-span-1 border-r border-slate-200 pr-8">
                <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide mb-6">
                  Add Module Content
                </h3>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Title</label>
                    <input
                      name="title"
                      placeholder="Module Name"
                      value={moduleForm.title}
                      onChange={handleModuleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Type</label>
                      <select
                        name="type"
                        value={moduleForm.type}
                        onChange={handleModuleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        {/* <option value="text_stream">Text Stream</option> */}
                      </select>
                    </div>
                    {moduleForm.type === "video" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500">Duration (m)</label>
                        <input
                          type="number"
                          name="duration"
                          value={moduleForm.duration}
                          onChange={handleModuleChange}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500">Source</label>
                      <div className="flex gap-2">
                        <span
                          onClick={() => setVideoInputType("url")}
                          className={`cursor-pointer text-xs ${videoInputType === "url" ? "text-indigo-600 font-bold" : "text-slate-400"}`}
                        >
                          Link
                        </span>
                        <span className="text-slate-300 text-xs">|</span>
                        <span
                          onClick={() => setVideoInputType("upload")}
                          className={`cursor-pointer text-xs ${videoInputType === "upload" ? "text-indigo-600 font-bold" : "text-slate-400"}`}
                        >
                          Upload
                        </span>
                      </div>
                    </div>

                    {videoInputType === "url" ? (
                      <input
                        name="url"
                        placeholder={moduleForm.type === "video" ? "https://youtube.com/..." : "https://example.com/file.pdf"}
                        value={moduleForm.url}
                        onChange={handleModuleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                      />
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-md p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                        <input
                          type="file"
                          accept={moduleForm.type === "video" ? "video/*" : "application/pdf"}
                          onChange={(e) => handleFileUpload(e.target.files[0], "url")}
                          disabled={uploading}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <div className="text-xs text-slate-500">
                          {uploading ? `Uploading ${Math.round(uploadProgress)}%...` : moduleForm.url ? "File Uploaded" : "Click to Upload Content"}
                        </div>
                        {uploading && (
                          <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Module Notes (Optional)
                    </label>
                    <div className="border border-dashed border-slate-300 rounded-md p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e.target.files[0], "notes")}
                        disabled={uploading}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <FileText className="text-slate-400" size={14} />
                        {moduleForm.notes ? "Notes Attached" : "Upload PDF Notes"}
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full bg-primary-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 text-sm mt-4"
                    onClick={addModule}
                    disabled={!moduleForm.title || !moduleForm.url}
                  >
                    <Plus size={12} /> Add Module
                  </button>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    className="text-slate-500 hover:text-slate-800 font-semibold text-sm flex items-center gap-2"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                  <button
                    className="text-white font-semibold py-2 px-6 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98] transition-all"
                    style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
                    onClick={() => setStep(3)}
                  >
                    Review <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Right: Module List */}
              <div className="lg:col-span-2">
                <div className="bg-[#f8fafc] h-full rounded-xl border border-slate-200 flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
                    <h3 className="text-sm font-bold text-primary-900">
                      Curriculum ({courseData.modules.length})
                    </h3>
                    <button
                      onClick={() => setShowModuleBulkUpload(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus size={12} /> Bulk Upload
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto p-4 space-y-2">
                    {courseData.modules.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                        <p>No modules added yet.</p>
                      </div>
                    ) : (
                      courseData.modules.map((m, idx) => (
                        <div
                          key={m.id}
                          className="bg-white p-3 rounded-md border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-primary-900 text-sm">{m.title}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-2">
                                <span className="uppercase font-bold text-[10px]">{m.type}</span>
                                {m.duration && <span>• {m.duration} mins</span>}
                                {m.notes && (
                                  <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md ml-2">
                                    <FileText size={10} /> PDF Notes
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* {m.type === "text_stream" && (
                              <button
                                onClick={() => setPreviewModuleId(m.id)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                title="Preview"
                              >👁</button>
                            )} */}
                            <button onClick={() => moveModule(idx, -1)} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                              <ArrowUp size={12} />
                            </button>
                            <button onClick={() => moveModule(idx, 1)} disabled={idx === courseData.modules.length - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                              <ArrowDown size={12} />
                            </button>
                            <button onClick={() => removeModule(m.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* {previewModuleId && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
                <button
                  onClick={() => setPreviewModuleId(null)}
                  className="absolute top-4 right-4 z-50 bg-slate-800 text-white p-2 rounded-full"
                >
                  &times;
                </button>
                <div className="flex-1 overflow-hidden">
                  <TextStreamPlayer moduleId={previewModuleId} />
                </div>
              </div>
            </div>
          )} */}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="w-full">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-primary-900">Final Verification</h3>
                <p className="text-slate-500 text-sm">Review course details before publishing.</p>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    { label: "Title", value: courseData.title },
                    { label: "Category", value: isCustomCategory ? courseData.customCategory : courseData.category },
                    { label: "Level", value: courseData.level },
                    {
                      label: "Content",
                      value: (
                        <>
                          {courseData.modules.length} Modules{" "}
                          <span className="text-slate-400 font-normal">
                            ({courseData.modules.reduce((acc, m) => acc + Number(m.duration || 0), 0)} mins)
                          </span>
                        </>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-primary-900">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <button
                    className="text-slate-600 font-bold text-sm flex items-center gap-2 hover:text-primary-900"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={12} /> Edit Content
                  </button>
                  <div className="flex gap-3">
                    <button
                      className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-md text-sm hover:bg-slate-50"
                      onClick={() => handleSubmit("draft")}
                    >
                      Save Draft
                    </button>
                    {/* Submit button — file1 gradient style */}
                    <button
                      className="px-6 py-2 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:shadow-xl active:scale-[0.98] transition-all"
                      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
                      onClick={() => handleSubmit("pending")}
                    >
                      <Check size={12} /> Submit Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Bulk Upload Modal --- */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <Upload size={20} /> Bulk Upload Courses
              </h3>
              <button onClick={closeBulkUpload} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>

            {!bulkUploadResult ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkFileSelect}
                    disabled={isBulkUploading}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload size={24} />
                    </div>
                    <p className="font-semibold text-slate-700">{bulkFile ? bulkFile.name : "Click to select CSV file"}</p>
                    <p className="text-xs text-slate-400">Max size 50MB. .csv files only.</p>
                  </div>
                </div>

                {bulkFile && !isBulkUploading && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleBulkUpload}
                      className="text-white font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
                    >
                      <Upload size={16} /> Start Upload
                    </button>
                  </div>
                )}

                {isBulkUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Uploading...</span>
                      <span>{Math.round(bulkUploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${bulkUploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${bulkUploadResult.successCount > 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                  <p className="font-bold">Process Complete</p>
                  <p className="text-sm mt-1">Successfully created: <b>{bulkUploadResult.successCount}</b> courses.</p>
                </div>
                {bulkUploadResult.errors?.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Errors ({bulkUploadResult.errors.length})</p>
                    <ul className="space-y-1">
                      {bulkUploadResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-rose-600 flex gap-2">
                          <span className="font-mono bg-rose-100 px-1 rounded">{err.row || err.course || "?"}</span>
                          <span>{err.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button onClick={closeBulkUpload} className="bg-primary-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition-colors">
                    Close & Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Module Bulk Upload Modal --- */}
      {showModuleBulkUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <Upload size={20} /> Bulk Upload Modules
              </h3>
              <button onClick={closeModuleBulkUpload} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>

            {!moduleBulkUploadResult ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleModuleBulkFileSelect}
                    disabled={isModuleBulkUploading}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText size={20} />
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">{moduleBulkFile ? moduleBulkFile.name : "Select CSV File"}</p>
                    <p className="text-xs text-slate-400">Req: module_name, module_type, module_source, module_duration</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleModuleResourceFilesSelect}
                    disabled={isModuleBulkUploading}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Video size={20} />
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {moduleResourceFiles.length > 0 ? `${moduleResourceFiles.length} files selected` : "Select Resource Files (Videos/PDFs)"}
                    </p>
                    <p className="text-xs text-slate-400">Select all videos/PDFs referenced in your CSV</p>
                  </div>
                </div>

                {moduleBulkFile && !isModuleBulkUploading && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleModuleBulkUpload}
                      className="text-white font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
                    >
                      <Upload size={14} /> Start Upload
                    </button>
                  </div>
                )}

                {isModuleBulkUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Uploading modules...</span>
                      <span>{Math.round(moduleBulkUploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${moduleBulkUploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${moduleBulkUploadResult.successCount > 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                  <p className="font-bold">Process Complete</p>
                  <p className="text-sm mt-1">Successfully created: <b>{moduleBulkUploadResult.successCount}</b> modules.</p>
                  {moduleBulkUploadResult.totalRows > 0 && (
                    <p className="text-xs mt-1 text-slate-500">Processed {moduleBulkUploadResult.totalRows} rows.</p>
                  )}
                </div>
                {moduleBulkUploadResult.errors?.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Errors ({moduleBulkUploadResult.errors.length})</p>
                    <ul className="space-y-1">
                      {moduleBulkUploadResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-rose-600 flex gap-2">
                          <span className="font-mono bg-rose-100 px-1 rounded">Row {err.row}</span>
                          <span>{err.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button onClick={closeModuleBulkUpload} className="bg-primary-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition-colors">
                    Close & Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourseView;