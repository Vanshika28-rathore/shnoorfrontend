import React from "react";
import { Search, BookOpen, User, CheckCircle2, Mail, AlertCircle, PlusCircle, ArrowRight } from "lucide-react";

const AssignCourseView = ({
  loading, groups, searchGroup, setSearchGroup, toggleGroup, students, courses,
  selectedStudents, selectedCourses, searchStudent, setSearchStudent, toggleStudent,
  toggleCourse, handleAssign, showSuccessPopup, setShowSuccessPopup, selectedGroups, error,
}) => {
  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Loading assignment data...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <PlusCircle size={24} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Assign Courses</h1>
            <p className="text-slate-400 text-sm mt-0.5">Select groups or students, then choose courses to assign.</p>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="mx-5 mt-5 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
            {error}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleAssign(); }} className="flex-1 flex flex-col h-full">
          <div className="flex flex-1 overflow-hidden divide-x divide-slate-100">

            {/* Groups */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-slate-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary-900 mb-3 uppercase tracking-wide">
                  <User className="text-slate-400" size={16} /> Select Groups
                  {selectedGroups.length > 0 && (
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-indigo-100 tabular-nums">{selectedGroups.length}</span>
                  )}
                </h3>
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input type="text" placeholder="Search group..." value={searchGroup} onChange={(e) => setSearchGroup(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {groups.map((g) => (
                  <div key={g.group_id} onClick={() => toggleGroup(g.group_id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedGroups.includes(g.group_id) ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"
                      }`}>
                    <div className="min-w-0">
                      <div className={`font-semibold text-sm truncate ${selectedGroups.includes(g.group_id) ? "text-indigo-600" : "text-slate-700"}`}>{g.group_name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate mt-0.5">
                        <Mail size={11} className="text-slate-300" /> {g.user_count || 0} students • {new Date(g.start_date).toLocaleDateString("en-CA")} → {g.end_date ? new Date(g.end_date).toLocaleDateString("en-CA") : "Ongoing"}
                      </div>
                    </div>
                    <CheckCircle2 size={18} className={selectedGroups.includes(g.group_id) ? "text-indigo-500" : "text-slate-200"} />
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="text-center py-10 text-slate-300 text-sm font-medium">No groups found</div>
                )}
              </div>
            </div>

            {/* Students */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-slate-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary-900 mb-3 uppercase tracking-wide">
                  <User className="text-slate-400" size={16} /> Select Students
                  {selectedStudents.length > 0 && (
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-indigo-100 tabular-nums">{selectedStudents.length}</span>
                  )}
                </h3>
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input type="text" placeholder="Search student..." value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {students.map((s) => (
                  <div key={s.user_id} onClick={() => toggleStudent(s.user_id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedStudents.includes(s.user_id) ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"
                      }`}>
                    <div className="min-w-0">
                      <div className={`font-semibold text-sm truncate ${selectedStudents.includes(s.user_id) ? "text-indigo-600" : "text-slate-700"}`}>{s.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate mt-0.5">
                        <Mail size={11} className="text-slate-300" /> {s.email}
                      </div>
                    </div>
                    <CheckCircle2 size={18} className={selectedStudents.includes(s.user_id) ? "text-indigo-500" : "text-slate-200"} />
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-center py-10 text-slate-300 text-sm font-medium">No students found</div>
                )}
              </div>
            </div>

            {/* Courses */}
            <div className={`flex-1 flex flex-col min-w-0 transition-opacity ${selectedGroups.length === 0 && selectedStudents.length === 0 ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="p-4 border-b border-slate-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary-900 mb-1 uppercase tracking-wide">
                  <BookOpen className="text-indigo-500" size={16} /> Select Courses
                  {selectedCourses.length > 0 && (
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-indigo-100 tabular-nums">{selectedCourses.length}</span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {selectedGroups.length === 0 && selectedStudents.length === 0 ? "Select groups or students first" : "Choose courses to assign"}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                {selectedGroups.length === 0 && selectedStudents.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
                    <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-slate-100 text-slate-500 font-semibold flex items-center gap-2 text-xs">
                      <AlertCircle size={16} className="text-amber-500" /> Select groups or students first
                    </div>
                  </div>
                )}
                {courses.map((c) => (
                  <div key={c.courses_id} onClick={() => toggleCourse(c.courses_id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCourses.includes(c.courses_id) ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"
                      }`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selectedCourses.includes(c.courses_id) ? "bg-indigo-100 text-indigo-600" : "bg-slate-50 text-slate-400"
                      }`}>
                      <BookOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${selectedCourses.includes(c.courses_id) ? "text-indigo-600" : "text-slate-700"}`}>{c.title}</div>
                      <div className="text-xs text-slate-400 truncate">Instructor: {c.instructor_name}</div>
                    </div>
                    <CheckCircle2 size={18} className={selectedCourses.includes(c.courses_id) ? "text-indigo-500" : "text-slate-200"} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
            <button type="submit"
              disabled={(selectedGroups.length === 0 && selectedStudents.length === 0) || selectedCourses.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${(selectedGroups.length === 0 && selectedStudents.length === 0) || selectedCourses.length === 0
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl"
                }`}
              style={(selectedGroups.length > 0 || selectedStudents.length > 0) && selectedCourses.length > 0
                ? { background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' } : {}}>
              <PlusCircle size={16} />
              {(selectedGroups.length > 0 || selectedStudents.length > 0) && selectedCourses.length > 0
                ? `Assign ${selectedCourses.length} Course${selectedCourses.length > 1 ? "s" : ""}`
                : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">Assignment Complete!</h3>
            <p className="text-slate-400 text-sm mb-6">Courses have been successfully assigned.</p>
            <button onClick={() => setShowSuccessPopup(false)}
              className="w-full py-3 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 text-sm"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignCourseView;
