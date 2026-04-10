import React from "react";
import { ClipboardList, Clock, AlertCircle, Play, CheckCircle, BotOff, Camera, SkipForward, Bookmark } from "lucide-react";

const MockTestView = ({ navigate }) => {
  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6 p-4 md:p-0">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <ClipboardList size={24} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Mock Test</h1>
            <p className="text-slate-400 text-sm mt-0.5">Prepare yourself before taking the real exam.</p>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* Awareness Note */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Note:</span> This mock test is designed
          to give you awareness of the real exam format. The number of questions
          may vary for each exam. No course enrollment is required to attempt the
          mock test.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <ClipboardList className="text-indigo-600" size={22} />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">
            Before You Begin
          </h4>
        </div>

        <ul className="space-y-3 mb-6 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
            The mock test simulates the real exam experience with similar
            question types and format.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
            Number of questions and duration vary depending on the exam you are
            preparing for.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
            Your score will be shown at the end. No results are saved or counted
            towards your progress.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
            Ensure you are in a distraction-free environment before starting.
          </li>
          <li className="flex items-start gap-2">
            <Clock size={15} className="text-indigo-400 mt-0.5 shrink-0" />
            A timer will be shown during the test. Manage your time wisely.
          </li>
          <li className="flex items-start gap-2">
            <Camera size={15} className="text-indigo-400 mt-0.5 shrink-0" />
            Your camera and microphone will remain active throughout the test
            and will only stop once you submit.
          </li>
          <li className="flex items-start gap-2">
            <SkipForward size={15} className="text-slate-400 mt-0.5 shrink-0" />
            You can <span className="font-semibold text-slate-700">Skip</span> a question to move to the next one and return to it later.
          </li>
          <li className="flex items-start gap-2">
            <Bookmark size={15} className="text-amber-500 mt-0.5 shrink-0" />
            Use <span className="font-semibold text-slate-700">Mark for Review</span> to flag questions you want to revisit before submitting. Marked questions appear highlighted in the question navigator.
          </li>
          <li className="flex items-start gap-2">
            <BotOff size={15} className="text-slate-400 mt-0.5 shrink-0" />
            The AI assistant will be disabled for the duration of the mock test.
          </li>
        </ul>

        {/* Legend preview */}
        <div className="flex flex-wrap gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 font-medium w-full mb-1">Question status legend:</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">1</span>
            Current
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 text-[10px] font-bold">2</span>
            Answered
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-700 text-[10px] font-bold">3</span>
            Marked
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold">4</span>
            Skipped
          </div>
        </div>

        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
          onClick={() => navigate("/student/mock-exam")}
        >
          <Play size={14} fill="currentColor" />
          Start Mock Test
        </button>
      </div>
    </div>
  );
};

export default MockTestView;