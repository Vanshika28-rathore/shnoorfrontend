/* eslint-disable no-unused-vars */
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
  Pencil,
} from "lucide-react";
import CourseComments from "../../../components/CourseComments";
import EditModuleModal from "./Editmodulemodal";
import AddModuleModal from "./Addmodulemodal";

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
  onEditModule,
  onAddModule,
}) => {
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedCourseForComments, setSelectedCourseForComments] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  const openCommentsModal = (course, e) => {
    e.stopPropagation();
    setSelectedCourseForComments(course);
    setCommentsModalOpen(true);
  };

  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedCourseForComments(null);
  };

  /* Status Badge (file1 style) */
  const getStatusBadge = (status) => {
    const map = {
      approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      rejected: "bg-red-50 text-red-600 border-red-100",
      archived: "bg-slate-50 text-slate-500 border-slate-100",
    };
    return map[status] || "bg-slate-50 text-slate-500 border-slate-100";
  };

  /* Loading Spinner (file1) */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Loading library...</p>
        </div>
      </div>
    );

  /* ================= COURSE DETAIL VIEW ================= */
  if (selectedCourse) {
    return (
      <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
        
        {/* Gradient Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
          }}
        >
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-4"
              >
                <ArrowLeft size={16} /> Back to Courses
              </button>
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                {selectedCourse.title}
              </h2>
            </div>

            {/* Add Module Button */}
            <button
              onClick={() => setAddModuleOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            >
              <Plus size={14} /> Add Module
            </button>
          </div>
        </div>

        {/* Modules List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {selectedCourse.modules?.length === 0 ? (
            <div className="p-16 text-center">
              <BookOpen className="mx-auto text-slate-300 mb-3" size={30} />
              <p className="text-sm font-semibold text-slate-400">
                No modules added yet.
              </p>
            </div>
          ) : (
            selectedCourse.modules.map((m, idx) => (
              <div
                key={m.module_id}
                className="flex items-center gap-4 p-4 border-b hover:bg-slate-50 group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-50 border flex items-center justify-center text-sm font-bold text-slate-400">
                  {idx + 1}
                </div>

                <div
                  onClick={() =>
                    window.open(m.content_url, "_blank", "noopener,noreferrer")
                  }
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  {m.type === "video" ? (
                    <Play size={16} className="text-rose-500" />
                  ) : (
                    <FileText size={16} className="text-indigo-500" />
                  )}
                  <span className="text-sm font-semibold text-primary-900">
                    {m.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingModule(m);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                >
                  <Pencil size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingModule && (
          <EditModuleModal
            module={editingModule}
            onClose={() => setEditingModule(null)}
            onSave={async (moduleId, formData) => {
              await onEditModule(moduleId, formData);
              setEditingModule(null);
            }}
          />
        )}

        {/* Add Modal */}
        {addModuleOpen && (
          <AddModuleModal
            onClose={() => setAddModuleOpen(false)}
            onSave={(formData) =>
              onAddModule(selectedCourse.courses_id, formData)
            }
          />
        )}
      </div>
    );
  }

  /* ================= COURSE LIST VIEW ================= */
  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      
      {/* Gradient Header */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
        }}
      >
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">
              Course Library
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage and update your published content.
            </p>
          </div>

          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
          >
            <Plus size={16} /> Create New Course
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">
                Modules
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.courses_id}
                onClick={() => onOpenCourse(course)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-6 py-4 font-semibold text-sm">
                  {course.title}
                </td>
                <td className="px-6 py-4 text-sm">
                  {course.modules?.length || 0}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(
                      course.status
                    )}`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(course.courses_id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comments Modal */}
      {commentsModalOpen && selectedCourseForComments && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between p-4 border-b">
              <h2 className="font-bold">
                {selectedCourseForComments.title}
              </h2>
              <button onClick={closeCommentsModal}>
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-auto">
              <CourseComments
                courseId={selectedCourseForComments.courses_id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseListView;