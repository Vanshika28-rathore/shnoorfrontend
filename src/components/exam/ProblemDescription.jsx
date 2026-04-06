import React from "react";

const ProblemDescription = ({ question }) => {
  if (!question)
    return <div className="p-4 text-slate-400">Select a question...</div>;

  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };

  const difficultyClass =
    difficultyColors[(question.difficulty || "medium").toLowerCase()] ||
    difficultyColors.medium;

  return (
    <div className="h-full overflow-y-auto p-6 bg-white text-slate-700">
      <div className="mb-6 pb-5 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          {question.title}
        </h2>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${difficultyClass}`}
        >
          {question.difficulty}
        </span>
      </div>

      {/* ✅ Description from DB */}
      <div className="mb-8">
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.12em] mb-2">
          Description
        </div>
        <div className="text-sm leading-7 whitespace-pre-wrap text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {question.description}
        </div>
      </div>

      {/* ✅ Examples from test_cases */}
      <div className="mb-2">
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.12em] mb-3">
          Examples
        </div>

        {(question.testCases || [])
          .filter((tc) => tc.isPublic === true)
          .slice(0, 2)
          .map((tc, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3 shadow-sm"
            >
              <div className="mb-3">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-extrabold uppercase mr-2 tracking-wide">
                  Input
                </span>
                <div className="mt-1 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-700">
                  {tc.input}
                </div>
              </div>

              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-extrabold uppercase mr-2 tracking-wide">
                  Output
                </span>
                <div className="mt-1 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-700">
                  {tc.output}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProblemDescription;
