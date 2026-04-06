import React from "react";
import {
  CheckCircle2, XCircle, Play, FileText, AlertCircle, BookOpen, Clock, ShieldCheck, Eye,
} from "lucide-react";
import { getEmbedUrl } from "../../../utils/urlHelper";
import TextStreamPlayer from "../../student/CoursePlayer/TextStreamPlayer";

const ApproveCoursesView = ({
  loading, pendingCourses, selectedCourse, setSelectedCourse, handleAction,
  modules, previewModuleId, setPreviewModuleId, previewUrl, setPreviewUrl, previewModuleType, setPreviewModuleType,
}) => {
  const [feedback, setFeedback] = React.useState("");
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [actionType, setActionType] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({});

  React.useEffect(() => {
    if (selectedCourse) {
      setEditData({ title: selectedCourse.title, description: selectedCourse.description, category: selectedCourse.category });
      setIsEditing(false);
    }
  }, [selectedCourse]);

  const initiateAction = (type) => {
    setActionType(type);
    setFeedback("");
    setShowFeedbackModal(true);
  };

  const confirmAction = () => {
    if (selectedCourse) {
      handleAction(selectedCourse.courses_id, actionType, feedback.trim(), editData);
      setShowFeedbackModal(false);
      setFeedback("");
      setIsEditing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Loading courses queue...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6 relative">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ShieldCheck size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Course Approval Queue</h1>
              <p className="text-slate-400 text-sm mt-0.5">Review pending content before publication.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-300">{pendingCourses.length} Pending</span>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`flex flex-1 gap-5 overflow-hidden ${selectedCourse ? "grid grid-cols-1 lg:grid-cols-[1fr_480px]" : ""}`}>
        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Course Title</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest md:table-cell hidden">Instructor</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingCourses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <CheckCircle2 size={28} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">No courses pending approval.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingCourses.map((course) => (
                    <tr key={course.courses_id} onClick={() => setSelectedCourse(course)}
                      className={`cursor-pointer transition-all hover:bg-slate-50/50 border-l-4 ${selectedCourse?.courses_id === course.courses_id ? "bg-indigo-50/30 border-indigo-500" : "border-transparent hover:border-slate-200"
                        }`}>
                      <td className="py-4 px-6">
                        <span className={`font-semibold text-sm transition-colors ${selectedCourse?.courses_id === course.courses_id ? "text-indigo-600" : "text-primary-900"
                          }`}>{course.title}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-400 font-medium md:table-cell hidden">
                        {course.instructor_name || course.instructor_id}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wider">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className={`text-xs font-bold border px-3 py-1.5 rounded-lg transition-all ${selectedCourse?.courses_id === course.courses_id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}>Review</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL PANEL */}
        {selectedCourse && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              <div className="w-full">
                <div className="flex justify-between items-start mb-2">
                  {isEditing ? (
                    <input type="text" className="text-lg font-bold text-primary-900 border border-slate-200 rounded-xl px-3 py-1.5 w-full mr-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                  ) : (
                    <h3 className="text-lg font-bold text-primary-900 leading-tight tracking-tight">{selectedCourse.title}</h3>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => setIsEditing(!isEditing)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                      <BookOpen size={14} />
                    </button>
                    <button onClick={() => setSelectedCourse(null)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {isEditing ? (
                    <input type="text" className="text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} />
                  ) : (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span className="text-indigo-500">{selectedCourse.category}</span> • {selectedCourse.instructor_name || "Unknown"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                {isEditing ? (
                  <textarea className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium h-28 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium">{selectedCourse.description}</p>
                )}
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Content ({modules.length} Modules)</h4>
                <div className="space-y-2">
                  {modules.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all group">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.type === "video" ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-500"
                        }`}>
                        {m.type === "video" ? <Play size={14} fill="currentColor" /> : <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-primary-900 truncate">{m.title}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                          {m.type} • <Clock size={9} /> {m.duration_mins} mins
                        </div>
                      </div>
                      {m.type === "text_stream" || m.type === "video" ? (
                        <button onClick={() => { setPreviewModuleId(m.module_id); setPreviewUrl(m.content_url); setPreviewModuleType(m.type); }}
                          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md flex items-center gap-1 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                          <Eye size={11} /> View
                        </button>
                      ) : (
                        m.content_url && (
                          <a href={m.content_url} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors">
                            View
                          </a>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-500 rounded-xl font-bold border border-red-100 hover:bg-red-50 transition-colors text-sm"
                onClick={() => initiateAction("rejected")}>
                <XCircle size={16} /> Reject
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all text-sm active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                onClick={() => initiateAction("approved")}>
                <CheckCircle2 size={16} /> Approve
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewModuleId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="h-12 border-b border-slate-100 flex items-center justify-between px-6 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Content Preview</span>
              <button onClick={() => { setPreviewModuleId(null); setPreviewUrl(null); }} className="text-slate-400 hover:text-white transition-colors">
                <XCircle size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-900">
              {previewModuleType === "text_stream" ? (
                <TextStreamPlayer moduleId={previewModuleId} url={previewUrl} />
              ) : (
                <div className="w-full h-full relative">
                  <iframe className="w-full h-full" src={getEmbedUrl(previewUrl)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen title="Content Player" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-primary-900">{actionType === "approved" ? "Approve Course" : "Reject Course"}</h3>
              <p className="text-sm text-slate-400 mt-1">
                {actionType === "approved" ? "Add optional notes for the instructor." : "Please provide a reason for rejection."}
              </p>
            </div>
            <div className="p-6">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Feedback / Notes {actionType === "rejected" && <span className="text-red-500">*</span>}
              </label>
              <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 min-h-[120px] text-sm font-medium transition-all placeholder:text-slate-300"
                placeholder={actionType === "approved" ? "Optional: Add a note..." : "Required: Explain why..."}
                value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 transition-colors text-sm border border-slate-200">Cancel</button>
              <button onClick={confirmAction} disabled={actionType === "rejected" && !feedback.trim()}
                className={`px-5 py-2 rounded-xl font-bold text-white text-sm transition-all shadow-md active:scale-[0.98] ${actionType === "approved" ? "shadow-indigo-500/20" : "bg-red-500 hover:bg-red-600 shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                style={actionType === "approved" ? { background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' } : {}}>
                Confirm {actionType === "approved" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveCoursesView;