import React from "react";
import { ClipboardList, Play, Clock, Trophy, CheckCircle2 } from "lucide-react";

const StudentExamsView = ({ loading, exams, navigate }) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 space-y-6">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <ClipboardList size={24} className="text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">My Exams</h1>
            <p className="text-slate-400 text-sm mt-0.5">Take assessments to prove your skills.</p>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <ClipboardList className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-primary-900 mb-1">
            No Exams Available
          </h3>
          <p className="text-sm text-slate-400">
            There are no exams available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.exam_id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:border-indigo-200 hover:shadow-md transition-all duration-300 group"
            >
              {/* Thumbnail */}
              <div className="h-40 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <ClipboardList className="text-indigo-400/40 w-16 h-16 group-hover:text-indigo-400/60 transition-colors" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
                  <Clock size={10} /> {exam.duration} min
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h4 className="text-sm font-bold text-primary-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {exam.title}
                </h4>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Trophy size={12} className="text-amber-400" />
                    Pass: <span className="font-bold text-slate-600">{exam.pass_percentage}%</span>
                  </div>
                </div>

                {exam.is_completed ? (
                  <button
                    type="button"
                    disabled
                    className="mt-auto w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <CheckCircle2 size={14} /> Completed
                  </button>
                ) : (
                  <button
                    className="mt-auto w-full text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                    onClick={() => navigate(`/student/exam/${exam.exam_id}`)}
                  >
                    <Play size={14} fill="currentColor" /> Start Exam
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExamsView;
