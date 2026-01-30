import React from "react";
import {
  Search,
  BookOpen,
  User,
  CheckCircle2,
  Mail,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

const AssignCourseView = ({
  loading,
  students,
  courses,
  selectedStudents,
  selectedCourses,
  searchStudent,
  setSearchStudent,
  toggleStudent,
  toggleCourse,
  handleAssign,
  showSuccessPopup,
  setShowSuccessPopup,
}) => {
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-indigo-600)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium tracking-tight">
            Loading assignment data...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-2 h-[calc(100vh-6rem)] flex flex-col font-sans w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAssign();
          }}
          className="flex-1 flex flex-col h-full"
        >
          <div className="flex flex-1 overflow-hidden divide-x divide-slate-200">
            {}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
              <div className="p-4 border-b border-slate-100 bg-white">
                <h3 className="flex items-center gap-2 text-lg font-bold text-primary-900 mb-4 tracking-tight">
                  <User className="text-slate-400" size={20} /> Select Students
                  {selectedStudents.length > 0 && (
                    <span className="bg-indigo-100 text-[var(--color-indigo-600)] text-xs px-2 py-0.5 rounded-md font-bold tabular-nums">
                      {selectedStudents.length}
                    </span>
                  )}
                </h3>

                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="input-field !pl-12 w-full text-base"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {students.map((s) => (
                  <div
                    key={s.user_id}
                    onClick={() => toggleStudent(s.user_id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all group ${
                      selectedStudents.includes(s.user_id)
                        ? "bg-indigo-50 border-[var(--color-indigo-600)] shadow-sm"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="min-w-0">
                      <div
                        className={`font-bold text-base truncate ${selectedStudents.includes(s.user_id) ? "text-[var(--color-indigo-600)]" : "text-slate-700"}`}
                      >
                        {s.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 truncate mt-0.5">
                        <Mail size={12} className="text-slate-400" /> {s.email}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        selectedStudents.includes(s.id)
                          ? "text-[var(--color-indigo-600)]"
                          : "text-slate-200 group-hover:text-indigo-300"
                      }`}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mx-4">
                    <p className="text-sm font-medium">
                      No students found matching "{searchStudent}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {}
            <div
              className={`flex-1 flex flex-col min-w-0 transition-opacity ${selectedStudents.length === 0 ? "opacity-50 pointer-events-none bg-slate-50" : "bg-white"}`}
            >
              <div className="p-4 border-b border-slate-100 bg-white">
                <h3 className="flex items-center gap-2 text-lg font-bold text-primary-900 mb-1 tracking-tight">
                  <BookOpen
                    className="text-[var(--color-indigo-600)]"
                    size={20}
                  />{" "}
                  Select Courses
                  {selectedCourses.length > 0 && (
                    <span className="bg-indigo-100 text-[var(--color-indigo-600)] text-xs px-2 py-0.5 rounded-md font-bold tabular-nums">
                      {selectedCourses.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider h-6 flex items-center">
                  {selectedStudents.length === 0
                    ? "Select students first"
                    : "Choose courses to assign"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 relative custom-scrollbar">
                {selectedStudents.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200 text-slate-600 font-bold flex items-center gap-2 text-sm">
                      <AlertCircle size={18} className="text-amber-500" />{" "}
                      Select at least one student
                    </div>
                  </div>
                )}

                {courses.map((c) => (
                  <div
                    key={c.courses_id}
                    onClick={() => toggleCourse(c.courses_id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group ${
                      selectedCourses.includes(c.courses_id)
                        ? "bg-indigo-50 border-[var(--color-indigo-600)] shadow-sm"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        selectedCourses.includes(c.courses_id)
                          ? "bg-indigo-100 text-[var(--color-indigo-600)]"
                          : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                      }`}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold text-base truncate ${selectedCourses.includes(c.courses_id) ? "text-[var(--color-indigo-600)]" : "text-slate-700"}`}
                      >
                        {c.title}
                      </div>
                      <div className="text-sm text-slate-500 truncate font-medium">
                        Instructor: {c.instructor_name}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        selectedCourses.includes(c.courses_id)
                          ? "text-[var(--color-indigo-600)]"
                          : "text-slate-200 group-hover:text-indigo-300"
                      }`}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
            <button
              type="submit"
              disabled={
                selectedStudents.length === 0 || selectedCourses.length === 0
              }
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all text-sm ${
                selectedStudents.length === 0 || selectedCourses.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-[var(--color-primary)] hover:bg-slate-800 text-white shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              <PlusCircle size={20} />
              {selectedStudents.length > 0 && selectedCourses.length > 0
                ? `Assign ${selectedCourses.length} Course${selectedCourses.length > 1 ? "s" : ""} to ${selectedStudents.length} Student${selectedStudents.length > 1 ? "s" : ""}`
                : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </div>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Assignment Complete!
            </h3>
            <p className="text-slate-500 mb-6">
              Courses have been successfully assigned to the selected students.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-[var(--color-primary)] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignCourseView;
