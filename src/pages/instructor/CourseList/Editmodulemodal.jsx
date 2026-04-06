import React, { useState, useRef } from "react";
import { X, Upload, Link, FileText, Video, Save, Loader2 } from "lucide-react";
import api from "../../../api/axios";

const EditModuleModal = ({ module, onClose, onSave }) => {
  const [title, setTitle] = useState(module.title || "");
  const [type, setType] = useState(module.type || "video");
  const [contentUrl, setContentUrl] = useState(module.content_url || "");
  const [notesUrl] = useState(module.notes || "");
  const [durationMins, setDurationMins] = useState(module.duration_mins || "");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState(module.pdf_filename || "");
  const [notesPdfFile, setNotesPdfFile] = useState(null);
  const [notesPdfName, setNotesPdfName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const notesInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    setError("");
    setPdfFile(file);
    setPdfFileName(file.name);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      const initialTitle = module.title || "";
      const initialType = module.type || "video";
      const initialContentUrl = module.content_url || "";
      const initialDuration = module.duration_mins ?? module.duration ?? "";
      const initialNotes = module.notes || "";

      const nextTitle = title.trim();
      const nextContentUrl = contentUrl.trim();
      const nextDuration = durationMins === "" ? "" : Number(durationMins);

      let hasChanges = false;

      if (nextTitle && nextTitle !== initialTitle) {
        formData.append("title", nextTitle);
        hasChanges = true;
      }

      if (type !== initialType) {
        formData.append("type", type);
        hasChanges = true;
      }

      if (String(nextDuration) !== String(initialDuration)) {
        formData.append("duration_mins", durationMins);
        hasChanges = true;
      }

      if (type === "video" && nextContentUrl !== initialContentUrl) {
        formData.append("content_url", nextContentUrl);
        hasChanges = true;
      } else if (type === "pdf" && pdfFile) {
        formData.append("file", pdfFile);
        hasChanges = true;
      }

      let finalNotesUrl = notesUrl;
      if (notesPdfFile) {
        const uploadData = new FormData();
        uploadData.append("file", notesPdfFile);
        const uploadRes = await api.post("/api/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalNotesUrl = uploadRes?.data?.url || "";
      }

      if (finalNotesUrl !== initialNotes) {
        formData.append("notes", finalNotesUrl);
        hasChanges = true;
      }

      if (!hasChanges) {
        setError("No changes to save.");
        setSaving(false);
        return;
      }

      await onSave(module.module_id, formData);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const typeConfig = {
    video: { icon: Video, label: "Video", color: "text-violet-600 bg-violet-50 border-violet-200" },
    pdf: { icon: FileText, label: "PDF", color: "text-rose-600 bg-rose-50 border-rose-200" },
    // text_stream: { icon: FileText, label: "Text Stream", color: "text-sky-600 bg-sky-50 border-sky-200" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Edit Module</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update the content and metadata for this module.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Module Type
            </label>
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                      type === key
                        ? cfg.color
                        : "text-slate-500 bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={13} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {type === "video" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Video URL
              </label>
              <div className="relative">
                <Link
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Content — PDF */}
          {type === "pdf" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                PDF File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg px-4 py-4 cursor-pointer transition-colors group"
              >
                <div className="p-2 rounded-md bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                  <Upload size={16} className="text-slate-500 group-hover:text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {pdfFileName ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {pdfFileName}
                      </p>
                      <p className="text-xs text-slate-400">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-600">
                        Click to upload PDF
                      </p>
                      <p className="text-xs text-slate-400">PDF files only</p>
                    </>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
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
                {notesPdfName ? (
                  <>
                    <p className="text-sm font-semibold text-slate-700 truncate">{notesPdfName}</p>
                    <p className="text-xs text-slate-400">Click to replace notes PDF</p>
                  </>
                ) : notesUrl ? (
                  <>
                    <p className="text-sm font-semibold text-slate-700 truncate">Existing notes PDF attached</p>
                    <p className="text-xs text-slate-400">Click to replace</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">Attach optional notes PDF</p>
                    <p className="text-xs text-slate-400">PDF files only</p>
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
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.type !== "application/pdf") {
                  setError("Notes must be a PDF file.");
                  return;
                }
                setError("");
                setNotesPdfFile(file);
                setNotesPdfName(file.name);
              }}
            />
            {notesUrl && (
              <button
                type="button"
                onClick={() => window.open(notesUrl, "_blank", "noopener,noreferrer")}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View current notes PDF
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModuleModal;