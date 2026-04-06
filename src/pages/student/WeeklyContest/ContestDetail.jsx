/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import Editor from "@monaco-editor/react";
import { FaPlay, FaCheck, FaTimes } from "react-icons/fa";

// Fisher-Yates shuffle — returns a new shuffled copy
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const SECTION_CONFIG = {
  mcq: { label: "MCQ", color: "bg-indigo-600", ring: "ring-indigo-400", badge: "bg-indigo-100 text-indigo-700" },
  descriptive: { label: "Descriptive", color: "bg-emerald-600", ring: "ring-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  coding: { label: "Coding", color: "bg-amber-600", ring: "ring-amber-400", badge: "bg-amber-100 text-amber-700" },
};

const ContestDetail = () => {

  const { contestId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState("mcq");
  const [sectionIndex, setSectionIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [codingMeta, setCodingMeta] = useState({});
  const [runResult, setRunResult] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState({});

  const [selectedLanguage, setSelectedLanguage] = useState({});
  const [codingActiveTab, setCodingActiveTab] = useState({});

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await api.get(
          `/api/contests/${contestId}/questions`
        );

        // Shuffle questions and MCQ options for randomised order per student
        let qs = shuffle(res.data);
        qs = qs.map((q) => {
          if (q.question_type === "mcq" && Array.isArray(q.options)) {
            return { ...q, options: shuffle(q.options) };
          }
          return q;
        });

        setQuestions(qs);

        // Auto-select the first section that has questions
        const types = ["mcq", "descriptive", "coding"];
        const firstType = types.find(t => qs.some(q => q.question_type === t));
        if (firstType) setActiveSection(firstType);
      } catch (err) {
        console.error("Failed to load contest questions", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [contestId]);

  // Group questions by type
  const sections = useMemo(() => {
    return {
      mcq: questions.filter(q => q.question_type === "mcq"),
      descriptive: questions.filter(q => q.question_type === "descriptive"),
      coding: questions.filter(q => q.question_type === "coding"),
    };
  }, [questions]);

  // Available section keys (only those with questions)
  const availableSections = useMemo(() => {
    return ["mcq", "descriptive", "coding"].filter(t => sections[t].length > 0);
  }, [sections]);

  // Current section's questions
  const currentSectionQuestions = sections[activeSection] || [];
  const q = currentSectionQuestions[sectionIndex];

  const loadCodingMeta = async (questionId) => {
    try {
      const res = await api.get(
        `/api/contests/${contestId}/questions/coding/${questionId}/meta`
      );

      setCodingMeta((prev) => ({
        ...prev,
        [questionId]: res.data
      }));

      setAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId] || res.data.starterCode || ""
      }));

      setSelectedLanguage((prev) => ({
        ...prev,
        [questionId]: prev[questionId] || "python"
      }));

      setCodingActiveTab((prev) => ({
        ...prev,
        [questionId]: "testcases"
      }));

    } catch (e) {
      console.error("Failed to load coding meta", e);
    }
  };

  const runCode = async (questionId) => {
    setIsRunning((prev) => ({ ...prev, [questionId]: true }));

    try {
      const lang = selectedLanguage[questionId];

      const res = await api.post(
        `/api/contests/${contestId}/run-question/${questionId}`,
        {
          code: answers[questionId],
          language: lang
        }
      );

      setRunResult((prev) => ({
        ...prev,
        [questionId]: res.data
      }));

      // Auto-switch to results tab
      setCodingActiveTab((prev) => ({
        ...prev,
        [questionId]: "results"
      }));

    } catch (e) {
      setRunResult((prev) => ({
        ...prev,
        [questionId]: {
          testResults: [{ testCaseNumber: 0, passed: false, error: e.response?.data?.message || "Run failed" }],
          summary: { total: 0, passed: 0, failed: 0 },
          passed: false
        }
      }));
      setCodingActiveTab((prev) => ({
        ...prev,
        [questionId]: "results"
      }));
    }

    setIsRunning((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post(
        `/api/contests/${contestId}/submit`,
        { answers }
      );
      setResult(res.data);
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err.response?.data?.message || "Failed to submit";
      alert(msg);
    }
    setIsSubmitting(false);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSectionIndex(0);
  };

  if (loading) return <div className="p-6">Loading questions...</div>;
  if (!questions.length) return <div className="p-6">No questions</div>;

  const meta = q ? codingMeta[q.question_id] : null;
  const lang = q ? selectedLanguage[q.question_id] : "python";
  const cfg = SECTION_CONFIG[activeSection];
  const currentRunResult = q ? runResult[q.question_id] : null;
  const currentTab = q ? (codingActiveTab[q.question_id] || "testcases") : "testcases";

  return (
    <div className="p-6 space-y-6">

      {/* ===== RESULT BANNER ===== */}
      {result && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaCheck size={18} />
            </div>
            <div>
              <div className="font-bold text-lg">Contest Submitted Successfully! 🎉</div>
              <div className="text-emerald-100 text-sm">Your answers have been recorded.</div>
            </div>
          </div>
          <div className="flex gap-6 mt-3 text-sm">
            <div><b>Total Marks:</b> {result.totalMarks}</div>
            <div><b>Obtained Marks:</b> {result.obtainedMarks}</div>
            {result.questionCount !== undefined && (
              <div><b>Questions Found:</b> {result.questionCount}</div>
            )}
          </div>
          {result.questionBreakdown && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg text-xs space-y-1">
              <div className="font-bold text-emerald-100 mb-1">DEBUG — Question Marks from DB:</div>
              {result.questionBreakdown.map((q, i) => (
                <div key={i}>
                  Q{i + 1}: {q.type} — DB marks: {q.marksInDB === null ? 'NULL' : q.marksInDB} — Used: {q.marksUsed}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SECTION TAB BAR ===== */}
      <div className="flex gap-2 flex-wrap">
        {availableSections.map((sKey) => {
          const sc = SECTION_CONFIG[sKey];
          const count = sections[sKey].length;
          const isActive = activeSection === sKey;
          const answeredCount = sections[sKey].filter(sq => answers[sq.question_id]).length;

          return (
            <button
              key={sKey}
              onClick={() => handleSectionChange(sKey)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isActive
                ? `${sc.color} text-white shadow-md ring-2 ${sc.ring} ring-offset-1`
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {sc.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : sc.badge
                }`}>
                {answeredCount}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== SECTION HEADER ===== */}
      {q && (
        <>
          <div className="text-sm text-slate-500">
            {cfg.label} — Question {sectionIndex + 1} of {currentSectionQuestions.length}
          </div>

          <div className="border rounded-xl p-5 space-y-4">

            <div className="font-semibold">
              {sectionIndex + 1}. {q.question_text}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>

            {/* MCQ */}
            {q.question_type === "mcq" && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt.option_id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${answers[q.question_id] === opt.option_id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}>
                    <input
                      type="radio"
                      name={q.question_id}
                      checked={answers[q.question_id] === opt.option_id}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.question_id]: opt.option_id
                        }))
                      }
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[q.question_id] === opt.option_id
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300"
                      }`}>
                      {answers[q.question_id] === opt.option_id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={answers[q.question_id] === opt.option_id ? "font-bold text-indigo-700" : "text-slate-700"}>
                      {opt.option_text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* DESCRIPTIVE */}
            {q.question_type === "descriptive" && (
              <textarea
                className="w-full border-2 border-slate-200 rounded-lg p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                rows={5}
                placeholder="Type your answer here..."
                value={answers[q.question_id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q.question_id]: e.target.value
                  }))
                }
              />
            )}

            {/* CODING — Practice Arena Style */}
            {q.question_type === "coding" && (
              <>
                {!meta && (
                  <button
                    onClick={() => loadCodingMeta(q.question_id)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors"
                  >
                    Load Problem
                  </button>
                )}

                {meta && (
                  <div className="flex h-[520px] border border-slate-200 rounded-xl overflow-hidden">

                    {/* LEFT — Problem Description */}
                    <div className="w-[40%] border-r border-slate-200 bg-slate-50 overflow-y-auto p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{meta.title}</h3>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                          {meta.description}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Examples</div>
                        {meta.testcases.filter(tc => !tc.is_hidden).slice(0, 2).map((tc, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 shadow-sm">
                            <div className="mb-2">
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase mr-2">Input</span>
                              <div className="mt-1 p-2 bg-slate-800 text-slate-200 rounded-lg font-mono text-xs">{tc.input}</div>
                            </div>
                            <div>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase mr-2">Output</span>
                              <div className="mt-1 p-2 bg-slate-800 text-slate-200 rounded-lg font-mono text-xs">{tc.expected_output}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT — Code Editor + Results Panel */}
                    <div className="w-[60%] flex flex-col bg-[#1e1e1e]">

                      {/* Editor Header */}
                      <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-[#333]">
                        <div className="flex items-center gap-2">
                          <span>💻</span>
                          <select
                            value={lang}
                            onChange={(e) =>
                              setSelectedLanguage((prev) => ({
                                ...prev,
                                [q.question_id]: e.target.value
                              }))
                            }
                            className="bg-[#2d2d2d] border border-[#444] rounded px-2 py-0.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#3d3d3d] transition-all cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="python" className="bg-[#252526]">Python</option>
                            <option value="javascript" className="bg-[#252526]">JavaScript</option>
                            <option value="java" className="bg-[#252526]">Java</option>
                            <option value="c" className="bg-[#252526]">C</option>
                            <option value="cpp" className="bg-[#252526]">C++</option>
                          </select>
                        </div>
                      </div>

                      {/* Monaco Editor */}
                      <div className="flex-1 min-h-0">
                        <Editor
                          height="100%"
                          language={
                            lang === "python" ? "python" :
                              lang === "java" ? "java" :
                                lang === "c" ? "c" :
                                  lang === "cpp" ? "cpp" :
                                    "javascript"
                          }
                          value={answers[q.question_id] || ""}
                          onChange={(v) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.question_id]: v || ""
                            }))
                          }
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: "'Fira Code', monospace"
                          }}
                        />
                      </div>

                      {/* Bottom Panel — Test Results */}
                      <div className="h-44 flex flex-col bg-[#1e1e1e] border-t border-[#333]">
                        {/* Tabs */}
                        <div className="flex border-b border-[#333] bg-[#252526]">
                          <div
                            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${currentTab === 'testcases'
                              ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1e1e1e]'
                              : 'text-slate-500 hover:text-slate-300'
                              }`}
                            onClick={() => setCodingActiveTab(prev => ({ ...prev, [q.question_id]: 'testcases' }))}
                          >
                            Test Cases
                          </div>
                          <div
                            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${currentTab === 'results'
                              ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1e1e1e]'
                              : 'text-slate-500 hover:text-slate-300'
                              }`}
                            onClick={() => setCodingActiveTab(prev => ({ ...prev, [q.question_id]: 'results' }))}
                          >
                            Test Results
                            {currentRunResult?.summary && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${currentRunResult.summary.passed === currentRunResult.summary.total
                                ? 'bg-emerald-600/30 text-emerald-400'
                                : 'bg-red-600/30 text-red-400'
                                }`}>
                                {currentRunResult.summary.passed}/{currentRunResult.summary.total}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-y-auto p-3 text-xs text-slate-300">

                          {/* Test Cases tab */}
                          {currentTab === 'testcases' && (
                            <div>
                              {meta.testcases.filter(tc => !tc.is_hidden).map((tc, i) => (
                                <div key={i} className="mb-2 bg-[#2a2a2a] rounded-lg p-2 border border-[#3a3a3a]">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Input</div>
                                  <div className="bg-[#1e1e1e] p-1.5 rounded mb-1 border border-[#444] font-mono">{tc.input}</div>
                                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Expected</div>
                                  <div className="bg-[#1e1e1e] p-1.5 rounded border border-[#444] font-mono">{tc.expected_output}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Test Results tab */}
                          {currentTab === 'results' && (
                            <div>
                              {/* Summary bar */}
                              {currentRunResult?.summary && (
                                <div className={`mb-2 p-2 rounded-lg border flex items-center justify-between ${currentRunResult.summary.passed === currentRunResult.summary.total
                                  ? 'bg-emerald-900/20 border-emerald-700/50'
                                  : 'bg-red-900/20 border-red-700/50'
                                  }`}>
                                  <div className="flex items-center gap-2">
                                    {currentRunResult.summary.passed === currentRunResult.summary.total ? (
                                      <FaCheck className="text-emerald-400" />
                                    ) : (
                                      <FaTimes className="text-red-400" />
                                    )}
                                    <span className={`font-bold text-sm ${currentRunResult.summary.passed === currentRunResult.summary.total ? 'text-emerald-400' : 'text-red-400'
                                      }`}>
                                      {currentRunResult.summary.passed === currentRunResult.summary.total ? 'All Passed!' : 'Some Failed'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-emerald-400 font-bold">✓ {currentRunResult.summary.passed}</span>
                                    <span className="text-red-400 font-bold">✗ {currentRunResult.summary.failed}</span>
                                  </div>
                                </div>
                              )}

                              {/* Individual results */}
                              {currentRunResult?.testResults?.length > 0 ? (
                                currentRunResult.testResults.map((t, i) => (
                                  <div key={i} className={`mb-1.5 p-2 rounded-lg border ${t.passed
                                    ? 'bg-emerald-900/10 border-emerald-800/30'
                                    : 'bg-red-900/10 border-red-800/30'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                      {t.passed ? (
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                          <FaCheck size={10} /> Test {t.testCaseNumber}
                                        </span>
                                      ) : (
                                        <span className="text-red-400 font-bold flex items-center gap-1">
                                          <FaTimes size={10} /> Test {t.testCaseNumber}
                                        </span>
                                      )}
                                      {t.isHidden && (
                                        <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">Hidden</span>
                                      )}
                                    </div>
                                    {!t.isHidden && (
                                      <div className="space-y-0.5 font-mono text-[11px] mt-1">
                                        {t.input !== undefined && (
                                          <div><span className="text-slate-500">Input: </span><span className="text-slate-300">{t.input}</span></div>
                                        )}
                                        {t.expectedOutput !== undefined && (
                                          <div><span className="text-slate-500">Expected: </span><span className="text-slate-300">{t.expectedOutput}</span></div>
                                        )}
                                        {t.actualOutput !== undefined && (
                                          <div><span className="text-slate-500">Actual: </span><span className={t.passed ? 'text-emerald-400' : 'text-red-400'}>{t.actualOutput || '(empty)'}</span></div>
                                        )}
                                        {t.error && (
                                          <div className="text-red-400"><span className="text-slate-500">Error: </span>{t.error}</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 italic flex items-center gap-2">
                                  <FaPlay size={10} /> Click "Run" to see test results...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2 bg-[#252526] border-t border-[#333] flex justify-end gap-2">
                        <button
                          onClick={() => runCode(q.question_id)}
                          disabled={isRunning[q.question_id]}
                          className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRunning[q.question_id] ? (
                            <><span className="animate-spin">⟳</span> Running...</>
                          ) : (
                            <><FaPlay size={12} /> Run</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* ===== NAVIGATION ===== */}
          <div className="flex justify-between">

            <button
              disabled={sectionIndex === 0}
              onClick={() => setSectionIndex((i) => i - 1)}
              className="px-4 py-2 border rounded disabled:opacity-40"
            >
              Previous
            </button>

            {sectionIndex < currentSectionQuestions.length - 1 ? (
              <button
                onClick={() => setSectionIndex((i) => i + 1)}
                className="px-4 py-2 border rounded"
              >
                Next
              </button>
            ) : (
              // Last question of this section — go to next section or submit
              (() => {
                const currentSectionIdx = availableSections.indexOf(activeSection);
                const hasNextSection = currentSectionIdx < availableSections.length - 1;

                if (hasNextSection) {
                  return (
                    <button
                      onClick={() => handleSectionChange(availableSections[currentSectionIdx + 1])}
                      className={`px-4 py-2 text-white rounded ${SECTION_CONFIG[availableSections[currentSectionIdx + 1]].color}`}
                    >
                      Next Section → {SECTION_CONFIG[availableSections[currentSectionIdx + 1]].label}
                    </button>
                  );
                }

                return (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><span className="animate-spin">⟳</span> Submitting...</>
                    ) : (
                      "Submit Contest"
                    )}
                  </button>
                );
              })()
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default ContestDetail;