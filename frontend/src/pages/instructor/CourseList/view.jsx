import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  BookOpen,
  Search,
  ArrowLeft,
  FileText,
  Play,
  Archive,
  MessageSquare,
  X,
} from "lucide-react";
import CourseComments from "../../../components/CourseComments";

const CourseListView = ({
  loading,
  courses,
  selectedCourse,
  onOpenCourse,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onCreate,
}) => {
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedCourseForComments, setSelectedCourseForComments] = useState(null);

  const openCommentsModal = (course, e) => {
    e.stopPropagation();
    setSelectedCourseForComments(course);
    setCommentsModalOpen(true);
  };

  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedCourseForComments(null);
  };

  // file1 status badge style
  const getStatusBadge = (status) => {
    const map = {
      approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      rejected: "bg-red-50 text-red-600 border-red-100",
      archived: "bg-slate-50 text-slate-500 border-slate-100",
    };
    return map[status] || "bg-slate-50 text-slate-500 border-slate-100";
  };

  // file1 loading spinner
  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Loading library...</p>
      </div>
    </div>
  );

  // Selected Course View — file1 styling
  if (selectedCourse) {
    return (
      <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
        {/* file1 dark gradient header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
        >
          <div className="relative z-10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-4"
            >
              <ArrowLeft size={16} /> Back to Courses
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{selectedCourse.title}</h2>
          </div>
          <div
            className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {selectedCourse.modules.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="text-slate-300" size={28} />
              </div>
              <p className="text-sm font-semibold text-slate-400">No modules added yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {selectedCourse.modules.map((m, idx) => (
                <div
                  key={m.module_id}
                  onClick={() => window.open(m.content_url, "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-400 tabular-nums">
                    {idx + 1}
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.type === "video" ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-500"}`}>
                    {m.type === "video" ? <Play size={14} fill="currentColor" /> : <FileText size={16} />}
                  </div>
                  <span className="font-semibold text-sm text-primary-900 group-hover:text-indigo-600 transition-colors">{m.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">

      {/* GRADIENT HEADER — file1 */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <BookOpen size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Course Library</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage and update your published content.</p>
            </div>
          </div>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
          >
            <Plus size={16} /> Create New Course
          </button>
        </div>
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
        />
      </div>

      {/* TABLE CARD — file1 styling */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            My Courses ({courses.length})
          </h3>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Filter courses..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium w-56 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Course Title</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Category</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Modules</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Comments</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Last Updated</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <BookOpen className="text-slate-300" size={28} />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No courses found. Create one to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course.courses_id}
                    onClick={() => onOpenCourse(course)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-sm text-primary-900">{course.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 md:hidden">{course.category}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 font-medium hidden md:table-cell">{course.category}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-600 tabular-nums">
                      {course.modules ? course.modules.length : 0}
                    </td>
                    <td className="py-4 px-6">
                      {/* file1 badge style: border + rounded-lg */}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(course.status)}`}>
                        {course.status}
                      </span>
                      {course.status === "rejected" && course.admin_feedback && (
                        <div className="mt-2">
                          <span className="text-[10px] font-bold text-red-500 block mb-1">Feedback:</span>
                          <p className="text-xs text-slate-500 bg-red-50/50 p-2 rounded-lg border border-red-100">{course.admin_feedback}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {/* file2 comments button — kept, restyled to match file1 indigo palette */}
                      <button
                        onClick={(e) => openCommentsModal(course, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
                      >
                        <MessageSquare size={13} /> View
                      </button>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 text-right tabular-nums font-medium">
                      {course.created_at ? new Date(course.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* file1 action button style: w-8 h-8 rounded-lg box with hover colors */}
                      <div className="flex justify-end gap-2">
                        {course.status === "archived" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); onUnarchive(course.courses_id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                            title="Unarchive"
                          >
                            <Archive size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onArchive(course.courses_id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 transition-all"
                            title="Archive"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(course.courses_id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMMENTS MODAL — file2 logic, file1 styling */}
      {commentsModalOpen && selectedCourseForComments && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-primary-900">Course Discussion</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCourseForComments.title}</p>
              </div>
              <button
                onClick={closeCommentsModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <CourseComments courseId={selectedCourseForComments.courses_id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseListView;