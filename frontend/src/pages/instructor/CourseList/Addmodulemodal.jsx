/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { X, Upload, Link, FileText, Video, Plus, Loader2, AlignLeft } from "lucide-react";
import api from "../../../api/axios";

const AddModuleModal = ({ onClose, onSave }) => {
  const [title, setTitle]               = useState("");
  const [type, setType]                 = useState("video");
  const [contentUrl, setContentUrl]     = useState("");
  const [notesFile, setNotesFile]       = useState(null);
  const [notesFileName, setNotesFileName] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [file, setFile]                 = useState(null);
  const [fileName, setFileName]         = useState("");
  const [inputMode, setInputMode]       = useState("link");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const fileInputRef                    = useRef(null);
  const notesInputRef                   = useRef(null);

  const ACCEPT_MAP = {
    video:       "video/*",
    pdf:         "application/pdf",
    text_stream: ".txt,.md,text/plain",
  };

  const switchType = (newType) => {
    setType(newType);
    setContentUrl("");
    setFile(null);
    setFileName("");
    setError("");
  };

  const switchMode = (mode) => {
    setInputMode(mode);
    setContentUrl("");
    setFile(null);
    setFileName("");
    setError("");
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setError("");
    setFile(f);
    setFileName(f.name);
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim())                                return setError("Title is required.");
    if (inputMode === "link"   && !contentUrl.trim()) return setError("Please enter a URL.");
    if (inputMode === "upload" && !file)              return setError("Please select a file.");

    const data = new FormData();
    data.append("title", title.trim());
    data.append("type",  type);
    if (durationMins) data.append("duration_mins", durationMins);

    if (inputMode === "link") {
      data.append("content_url", contentUrl.trim());
    } else {
      data.append("file", file);
    }

    if (notesFile) {
      const notesUpload = new FormData();
      notesUpload.append("file", notesFile);
      const notesRes = await api.post("/api/upload", notesUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (notesRes?.data?.url) {
        data.append("notes", notesRes.data.url);
      }
    }

    try {
      setSaving(true);
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add module.");
      setSaving(false);
    }
  };

  const types = [
    { key: "video",       label: "Video",       Icon: Video,     active: "text-violet-600 bg-violet-50 border-violet-300" },
    { key: "pdf",         label: "PDF",          Icon: FileText,  active: "text-rose-600 bg-rose-50 border-rose-300" },
    { key: "text_stream", label: "Text Stream",  Icon: AlignLeft, active: "text-sky-600 bg-sky-50 border-sky-300" },
  ];

  const urlPlaceholders = {
    video:       "https://youtube.com/watch?v=...",
    pdf:         "https://example.com/document.pdf",
    text_stream: "https://example.com/article",
  };

  const uploadLabels = {
    video:       "video file",
    pdf:         "PDF file",
    text_stream: "text file (.txt, .md)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Add New Module</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Module Type</label>
            <div className="flex gap-2">
              {types.map(({ key, label, Icon, active }) => (
                <button
                  key={key}
                  onClick={() => switchType(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                    type === key ? active : "text-slate-500 bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Content — Link / Upload toggle (all types) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Content <span className="text-rose-500">*</span>
            </label>

            {/* Mode toggle pill */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-3 w-fit">
              <button
                onClick={() => switchMode("link")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  inputMode === "link"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Link size={12} /> Link / URL
              </button>
              <button
                onClick={() => switchMode("upload")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  inputMode === "upload"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Upload size={12} /> Upload File
              </button>
            </div>

            {/* Link input */}
            {inputMode === "link" && (
              <div className="relative">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder={urlPlaceholders[type]}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            )}

            {/* File upload — all types */}
            {inputMode === "upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg px-4 py-4 cursor-pointer transition-colors group"
              >
                <div className="p-2 rounded-md bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                  <Upload size={16} className="text-slate-500 group-hover:text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {fileName ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700 truncate">{fileName}</p>
                      <p className="text-xs text-slate-400">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-600">Click to upload {uploadLabels[type]}</p>
                      <p className="text-xs text-slate-400">
                        {type === "video"       && "MP4, MOV, WebM, etc."}
                        {type === "pdf"         && "PDF files only"}
                        {type === "text_stream" && ".txt or .md files"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_MAP[type]}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Duration (minutes)</label>
            <input
              type="number" min="0" value={durationMins} onChange={(e) => setDurationMins(e.target.value)}
              placeholder="e.g. 15"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Optional Notes PDF */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Optional Notes PDF
            </label>
            <div
              onClick={() => notesInputRef.current?.click()}
              className="flex items-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg px-4 py-3 cursor-pointer transition-colors group"
            >
              <div className="p-2 rounded-md bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                <FileText size={16} className="text-slate-500 group-hover:text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                {notesFileName ? (
                  <>
                    <p className="text-sm font-semibold text-slate-700 truncate">{notesFileName}</p>
                    <p className="text-xs text-slate-400">Click to replace notes PDF</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">Attach optional notes PDF</p>
                    <p className="text-xs text-slate-400">PDF only</p>
                  </>
                )}
              </div>
            </div>
            <input
              ref={notesInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.type !== "application/pdf") {
                  setError("Notes must be a PDF file.");
                  return;
                }
                setError("");
                setNotesFile(f);
                setNotesFileName(f.name);
              }}
            />
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? "Adding..." : "Add Module"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModuleModal;