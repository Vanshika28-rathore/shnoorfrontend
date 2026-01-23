import React from 'react';
import { ClipboardList, CheckCircle, Play, Clock, Lock, ExternalLink } from 'lucide-react';

const StudentExamsView = ({ loading, exams, isPassed, accessStatus, courseNames, navigate }) => {

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading exams...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full pb-12">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-primary-900">My Exams</h3>
                <p className="text-slate-500 mt-1">Take assessments to prove your skills.</p>
            </div>

            {exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                    <ClipboardList className="text-slate-300 w-16 h-16 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Exams Available</h3>
                    <p className="text-slate-500">You don't have any assigned exams yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {exams.map((exam) => {
                        const passed = isPassed(exam.id);
                        const unlocked = accessStatus[exam.id] !== false;
                        const neededCourseName = courseNames[exam.linkedCourseId] || 'Prerequisite Course';

                        return (
                            <div
                                key={exam.id}
                                className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 hover:shadow-md transition-all duration-300 h-full ${!unlocked ? 'opacity-75 bg-slate-50' : ''}`}
                            >
                                {/* Thumbnail */}
                                <div className="h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative">
                                    {passed ? (
                                        <CheckCircle className="text-emerald-500 w-12 h-12" />
                                    ) : !unlocked ? (
                                        <Lock className="text-slate-300 w-10 h-10" />
                                    ) : (
                                        <ClipboardList className="text-indigo-200 w-12 h-12 group-hover:text-indigo-500 transition-colors" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h4 className="text-base font-bold text-primary-900 mb-2 line-clamp-2 min-h-[3rem]">{exam.title}</h4>

                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-6 uppercase tracking-wider border-b border-slate-100 pb-4">
                                        <span>{exam.questions.length} Qs</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {exam.duration}m</span>
                                    </div>

                                    <div className="mt-auto">
                                        {passed ? (
                                            <>
                                                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 py-2 rounded mb-3">
                                                    <CheckCircle size={14} /> Passed
                                                </div>
                                                <button
                                                    className="w-full bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 font-bold py-2 rounded text-sm transition-all"
                                                    onClick={() => navigate('/student/certificates')}
                                                >
                                                    Certificate
                                                </button>
                                            </>
                                        ) : !unlocked ? (
                                            <>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold mb-2 text-xs uppercase tracking-wide">
                                                    <Lock size={12} /> Locked
                                                </div>
                                                <div className="text-xs text-slate-500 mb-4 italic">
                                                    Requires: <span className="font-semibold">{neededCourseName}</span>
                                                </div>
                                                <button
                                                    className="w-full bg-white border border-slate-200 text-slate-400 text-xs font-bold py-2 rounded flex items-center justify-center gap-2 cursor-not-allowed"
                                                    disabled
                                                >
                                                    <Lock size={12} /> Locked
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-3">
                                                    <span>Pass Score: {exam.passScore}%</span>
                                                </div>
                                                <button
                                                    className="w-full bg-primary-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                                                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                                                >
                                                    <Play size={12} fill="currentColor" /> Start Exam
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentExamsView;
