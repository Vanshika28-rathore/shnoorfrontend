import React from "react";
import { ClipboardList, Play, Clock } from "lucide-react";
import MCQForm from "./MCQForm";

const StudentExamsView = ({ showQuiz, onStartExam, onBack }) => {
  const [showMCQ, setShowMCQ] = React.useState(false);

  if (showQuiz) {
    return (
      <div className="w-full pb-12">
        <MCQForm onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900">My Exams</h3>
        <p className="text-slate-500 mt-1">
          Take assessments to prove your skills.
        </p>
      </div>

      <div className="space-y-8">
        {/* Practice Quiz Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Practice Quiz</h3>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600 mb-4">
              Test your knowledge with our interactive MCQ quiz.
            </p>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-all flex items-center gap-2"
              onClick={onStartExam}
            >
              <Play size={14} fill="currentColor" /> Start Practice Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamsView;

