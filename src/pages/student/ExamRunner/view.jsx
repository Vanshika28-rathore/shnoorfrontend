/* eslint-disable no-unused-vars */
import React from "react";
import {
  FaClock,
  FaAngleLeft,
  FaAngleRight,
  FaTrophy,
  FaTimesCircle,
  FaCheckCircle,
  FaCode,
  FaVideo,
  FaCamera,
  FaExclamationTriangle,
} from "react-icons/fa";
import PracticeSession from "../PracticeSession.jsx";
import SecurityViolationModal from "../../../components/exam/SecurityViolationModal.jsx";
import VideoStreamWidget from "../../../components/exam/VideoStreamWidget.jsx";

const ProctoringSetup = ({ startCamera, error, examTitle, navigate }) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 font-sans p-6">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 w-full max-w-2xl text-center">
        <div className="space-y-8">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-indigo-50">
            <FaVideo size={36} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Live Proctoring Setup</h2>
            <p className="text-slate-500 text-lg">
              To ensure integrity, this exam for <strong className="text-slate-900">{examTitle}</strong> requires a live camera feed.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-left space-y-4">
            <h4 className="flex items-center gap-2 font-bold text-amber-800">
              <FaCamera className="text-amber-600" /> Proctoring Rules:
            </h4>
            <ul className="text-sm text-amber-800/80 space-y-2 list-disc pl-5 font-medium">
              <li>Ensure you are in a well-lit room.</li>
              <li>Your face must be clearly visible throughout the exam.</li>
              <li>Do not leave the camera frame until submission.</li>
              <li>Browser will request camera permission next.</li>
            </ul>
          </div>
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium text-left">
              <FaExclamationTriangle className="shrink-0" />
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button className="px-8 py-4 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-all" onClick={() => navigate(-1)}>
              Go Back
            </button>
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-200" onClick={startCamera}>
              Start Camera & Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SECTION_CONFIG = {
  mcq: { label: "MCQ", color: "bg-indigo-600", ring: "ring-indigo-400", badge: "bg-indigo-100 text-indigo-700", icon: "📝" },
  descriptive: { label: "Descriptive", color: "bg-emerald-600", ring: "ring-emerald-400", badge: "bg-emerald-100 text-emerald-700", icon: "✍️" },
  coding: { label: "Coding", color: "bg-amber-600", ring: "ring-amber-400", badge: "bg-amber-100 text-amber-700", icon: "💻" },
};

const ExamRunnerView = ({
  loading,
  exam,
  currentQIndex,
  setCurrentQIndex,
  answers,
  handleAnswer,
  timeLeft,
  isSubmitted,
  result,
  handleSubmit,
  handleRewrite,
  canRewrite,
  formatTime,
  navigate,
  securityHandlers,
  triggerFullscreen,
  isExamLocked,
  securityModal,
  handleResumeExam,
  isTerminated,
  // Section tab props
  activeSection,
  sectionIndex,
  setSectionIndex,
  sections,
  availableSections,
  handleSectionChange,
  // Proctoring Props
  isProctored,
  stream,
  proctoringError,
  startCamera,
  // AI Props
  isSuspicious,
  isVoiceSuspicious,
  multipleFacesDetected,
  noFaceDetected,
  detections,
}) => {
  const [hasStarted, setHasStarted] = React.useState(false);

  const handleStartExam = () => {
    if (!isProctored) {
      startCamera();
      return;
    }
    triggerFullscreen();
    setHasStarted(true);
  };

  /* =========================
     PROCTORING SETUP / START SCREEN
  ========================= */
  if (!isSubmitted && !loading && exam) {
    if (!isProctored) {
      return (
        <ProctoringSetup
          startCamera={startCamera}
          error={proctoringError}
          examTitle={exam.title}
          navigate={navigate}
        />
      );
    }

    if (!hasStarted) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
          <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200 text-center max-w-lg w-full">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCode size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{exam.title}</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Camera is active. Full-screen mode will be enabled once you start.
              Tab switching is strictly monitored.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800 mb-8 text-left space-y-2">
              <p className="font-bold flex items-center gap-2">
                <FaTimesCircle /> Security Rules:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not switch tabs or windows.</li>
                <li>Do not exit full-screen mode.</li>
                <li>Clipboard actions are disabled.</li>
              </ul>
            </div>
            <button
              onClick={handleStartExam}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all text-lg"
            >
              Start Assessment
            </button>
          </div>
        </div>
      );
    }
  }

  /* =========================
     LOADING / NOT FOUND
  ========================= */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Assessment...</p>
        </div>
      </div>
    );

  if (!exam)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Exam not found.
      </div>
    );

  /* =========================
     SUBMITTED — AWAITING RESULT
  ========================= */
  if (isSubmitted && !result) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 font-sans">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 w-full text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <FaCheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Assessment Submitted
          </h2>
          <p className="text-slate-500">
            Your exam was submitted successfully. Results will appear once grading completes.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm"
              onClick={() => navigate("/student/dashboard")}
            >
              Return Home
            </button>
            <button
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm shadow-sm"
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     SUBMITTED — RESULT AVAILABLE
  ========================= */
  if (isSubmitted && result) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 font-sans">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 w-full text-center">
          {result.passed ? (
            <div className="space-y-8">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <FaTrophy size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Assessment Passed
                </h2>
                <p className="text-slate-500">
                  You successfully completed{" "}
                  <strong className="text-slate-900">{exam.title}</strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-6">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Final Score
                </div>
                <div className="text-5xl font-bold text-indigo-600 tracking-tight">
                  {result.percentage}%
                </div>
              </div>

              <div className="text-xs font-medium text-slate-400">
                A certificate has been generated for your records.
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm"
                  onClick={() => navigate("/student/dashboard")}
                >
                  Return Home
                </button>
                <button
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm shadow-sm"
                  onClick={() => navigate("/student/certificates")}
                >
                  View Certificate
                </button>
              </div>

              {canRewrite && (
                <button
                  className="w-full px-6 py-2.5 mt-4 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm bg-slate-50"
                  onClick={handleRewrite}
                >
                  Rewrite Exam
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <FaTimesCircle size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Assessment Failed
                </h2>
                <p className="text-slate-500">
                  You did not meet the passing criteria for this exam.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-6">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Your Score
                </div>
                <div className="text-5xl font-bold text-rose-500 tracking-tight">
                  {result.percentage}%
                </div>
                <div className="text-xs font-bold text-slate-400 mt-2">
                  Required: {exam.pass_score}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm"
                  onClick={() => navigate("/student/dashboard")}
                >
                  Return Home
                </button>
                <button
                  className="px-6 py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all text-sm shadow-sm"
                  onClick={canRewrite ? handleRewrite : () => window.location.reload()}
                >
                  {canRewrite ? "Rewrite Exam" : "Retake Exam"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================
     NO QUESTIONS GUARD
  ========================= */
  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No questions found for this exam.
      </div>
    );
  }

  /* =========================
     SECTION-BASED CURRENT QUESTION
  ========================= */
  const currentSectionQuestions = sections[activeSection] || [];
  const currentQ = currentSectionQuestions[sectionIndex];

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-slate-500">
        No questions in this section.
      </div>
    );
  }

  const questionId = currentQ.question_id || currentQ.id;
  const qType = currentQ.type || currentQ.question_type;
  const isPractice = exam.duration === 0;
  const cfg = SECTION_CONFIG[activeSection];

  // Navigation helpers
  const currentSectionIdx = availableSections.indexOf(activeSection);
  const isLastSection = currentSectionIdx === availableSections.length - 1;
  const isLastQuestionInSection = sectionIndex === currentSectionQuestions.length - 1;

  /* =========================
     SHARED NAV BUTTONS HELPER
  ========================= */
  const renderNavButtons = (darkMode = false) => {
    const prevBtn = (
      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
          ${sectionIndex === 0 ? "invisible" : ""}
          ${darkMode
            ? "text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg"
            : "text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
          }`}
        onClick={() => setSectionIndex((prev) => prev - 1)}
      >
        <FaAngleLeft /> Previous
      </button>
    );

    let nextBtn;
    if (isLastQuestionInSection && isLastSection) {
      nextBtn = (
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all
            ${isExamLocked
              ? "bg-slate-400 text-white cursor-not-allowed"
              : darkMode
                ? "bg-red-500 text-white hover:bg-red-600 rounded-lg px-6 py-2"
                : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30"
            }`}
          onClick={handleSubmit}
          disabled={isExamLocked}
        >
          Submit Test
        </button>
      );
    } else if (isLastQuestionInSection) {
      const nextSectionKey = availableSections[currentSectionIdx + 1];
      const nextCfg = SECTION_CONFIG[nextSectionKey];
      nextBtn = (
        <button
          className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold shadow-lg transition-all
            ${darkMode ? "rounded-lg py-2" : ""}
            ${nextCfg?.color || "bg-blue-600"}`}
          onClick={() => handleSectionChange(nextSectionKey)}
        >
          Next Section → {nextCfg?.label}
        </button>
      );
    } else {
      nextBtn = (
        <button
          className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all
            ${darkMode
              ? "rounded-lg py-2 hover:bg-blue-500"
              : "rounded-xl shadow-lg shadow-blue-500/30"
            }`}
          onClick={() => setSectionIndex((prev) => prev + 1)}
        >
          Next <FaAngleRight />
        </button>
      );
    }

    return { prevBtn, nextBtn };
  };

  /* =========================
     MAIN EXAM UI
  ========================= */
  return (
    <div
      className="h-[calc(100vh-6rem)] flex flex-col bg-slate-50"
      {...securityHandlers}
    >
      {/* ── Proctoring violation banners (non-blocking) ── */}
      {(isSuspicious || multipleFacesDetected || noFaceDetected) && (
        <div className="fixed top-16 left-0 right-0 z-[10000] flex flex-col gap-1.5 px-4 pt-2 pointer-events-none">
          {isSuspicious && !multipleFacesDetected && (
            <div className="flex items-center gap-3 px-5 py-3 bg-rose-600 text-white rounded-xl shadow-xl text-sm font-bold animate-pulse">
              <FaExclamationTriangle size={16} />
              ⚠ Suspicious Activity Detected — Unauthorized object or phone in frame. This is being logged.
            </div>
          )}
          {multipleFacesDetected && (
            <div className="flex items-center gap-3 px-5 py-3 bg-rose-700 text-white rounded-xl shadow-xl text-sm font-bold animate-pulse">
              <FaExclamationTriangle size={16} />
              ⚠ Multiple Faces Detected — Only one candidate is allowed. This violation is being reported.
            </div>
          )}
          {noFaceDetected && (
            <div className="flex items-center gap-3 px-5 py-3 bg-orange-500 text-white rounded-xl shadow-xl text-sm font-bold animate-pulse">
              <FaExclamationTriangle size={16} />
              ⚠ No Face Detected — Please ensure your face is clearly visible to the camera.
            </div>
          )}
        </div>
      )}

      <VideoStreamWidget stream={stream} initialCorner="bottom-right" />

      <SecurityViolationModal
        isOpen={securityModal.open}
        violationType={securityModal.type}
        count={securityModal.count}
        onResume={handleResumeExam}
        isTerminated={isTerminated}
      />

      {/* ── TOP NAV BAR ── */}
      <div className="h-16 bg-slate-900 text-white px-6 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.confirm("Quit exam? Progress will be lost."))
                navigate(-1);
            }}
            className="text-white/70 hover:text-white flex items-center gap-2 transition-colors"
          >
            <FaAngleLeft size={20} />
            <span className="text-sm font-medium">Exit</span>
          </button>
          <div className="h-6 w-px bg-white/20"></div>
          <h3 className="text-lg font-bold truncate max-w-md">{exam.title}</h3>
        </div>

        {!isPractice && (
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-mono font-bold text-lg border transition-all ${timeLeft < 300
                ? "bg-red-500/20 text-red-300 border-red-500/50 animate-pulse"
                : "bg-white/10 text-white border-white/10"
                }`}
            >
              <FaClock size={16} /> {formatTime(timeLeft)}
            </span>
            <button
              className={`text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md transition-colors ${isExamLocked
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
                }`}
              onClick={handleSubmit}
              disabled={isExamLocked}
            >
              {isExamLocked ? "Time's Up" : "Finish Test"}
            </button>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <div className="w-72 bg-white border-r border-slate-200 flex-col overflow-y-auto hidden md:flex">

          {/* Section tabs */}
          <div className="p-4 border-b border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Sections
            </div>
            <div className="flex flex-col gap-1.5">
              {availableSections.map((sKey) => {
                const sc = SECTION_CONFIG[sKey];
                const count = sections[sKey].length;
                const isActive = activeSection === sKey;
                const answeredCount = sections[sKey].filter(
                  (sq) => answers[sq.question_id || sq.id]
                ).length;

                return (
                  <button
                    key={sKey}
                    onClick={() => handleSectionChange(sKey)}
                    className={`w-full px-3 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-between ${isActive
                      ? `${sc.color} text-white shadow-md`
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{sc.icon}</span>
                      {sc.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : sc.badge
                        }`}
                    >
                      {answeredCount}/{count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question grid for active section */}
          <div className="p-4 flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {cfg.label} Questions
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {currentSectionQuestions.map((q, idx) => {
                const qId = q.question_id || q.id;
                let statusClass = "bg-slate-100 text-slate-500 hover:bg-slate-200";
                if (idx === sectionIndex)
                  statusClass = "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2";
                else if (answers[qId])
                  statusClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";

                return (
                  <button
                    key={qId}
                    onClick={() => setSectionIndex(idx)}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${statusClass}`}
                    title={`${cfg.label} Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 mt-auto space-y-3 text-xs font-medium text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-blue-600 ring-2 ring-blue-600 ring-offset-1"></div>
              Current
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>
              Answered
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-slate-100"></div>
              Unvisited
            </div>
          </div>
        </div>

        {/* ── QUESTION AREA ── */}
        <div
          className={`flex-1 overflow-y-auto ${qType === "coding" ? "p-0" : "p-6 md:p-10"
            } flex flex-col items-center bg-slate-50/50`}
        >

          {/* ── DESCRIPTIVE ── */}
          {qType === "descriptive" && (() => {
            const { prevBtn, nextBtn } = renderNavButtons();
            return (
              <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full md:h-auto min-h-125">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                        {cfg.label} — Question {sectionIndex + 1}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xl md:text-2xl font-medium text-slate-800 mt-2 leading-relaxed">
                      {currentQ.text}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold whitespace-nowrap">
                    {currentQ.marks} Marks
                  </span>
                </div>

                <div className="p-6 md:p-8 flex-1">
                  <textarea
                    className="w-full h-full min-h-75 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all text-lg disabled:opacity-50 disabled:bg-slate-100"
                    placeholder="Type your answer here..."
                    value={answers[questionId] || ""}
                    onChange={(e) => handleAnswer(currentQ, e.target.value)}
                    disabled={isExamLocked || isSubmitted}
                  />
                </div>

                <div className="p-6 md:p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-b-2xl">
                  {prevBtn}
                  {nextBtn}
                </div>
              </div>
            );
          })()}

          {/* ── CODING ── */}
          {qType === "coding" && (() => {
            const { prevBtn, nextBtn } = renderNavButtons(true);
            return (
              <div className="flex flex-col h-full w-full">
                <div
                  className={`flex-1 overflow-hidden relative ${isExamLocked || isSubmitted ? "opacity-60 pointer-events-none" : ""
                    }`}
                >
                  <PracticeSession
                    question={currentQ}
                    value={answers[questionId]}
                    onChange={(val) => handleAnswer(currentQ, val)}
                    onComplete={() => { }}
                    readOnly={isExamLocked || isSubmitted}
                  />
                </div>
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0">
                  {prevBtn}
                  {nextBtn}
                </div>
              </div>
            );
          })()}

          {/* ── MCQ ── */}
          {qType === "mcq" && (() => {
            const { prevBtn, nextBtn } = renderNavButtons();
            return (
              <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full md:h-auto overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                        {cfg.label} — Question {sectionIndex + 1}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xl md:text-2xl font-medium text-slate-800 mt-2 leading-relaxed">
                      {currentQ.text}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold whitespace-nowrap shadow-sm">
                    {currentQ.marks} Marks
                  </span>
                </div>

                <div className="p-6 md:p-8 flex-1 grid gap-4">
                  {currentQ.options.map((opt) => {
                    const optId = opt.id ?? opt;
                    const optText = opt.text ?? opt;
                    return (
                      <label
                        key={optId}
                        className={`group flex items-center gap-4 p-4 md:p-5 rounded-lg border-2 transition-all ${isExamLocked || isSubmitted
                          ? "cursor-not-allowed opacity-70"
                          : "cursor-pointer"
                          } ${answers[questionId] === optId
                            ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                          }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[questionId] === optId
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-slate-300 group-hover:border-indigo-400"
                            }`}
                        >
                          {answers[questionId] === optId && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name={`q-${questionId}`}
                          value={optId}
                          checked={answers[questionId] === optId}
                          onChange={() => handleAnswer(currentQ, optId)}
                          className="hidden"
                          disabled={isExamLocked || isSubmitted}
                        />
                        <span
                          className={`text-lg transition-colors ${answers[questionId] === optId
                            ? "text-blue-700 font-bold"
                            : "text-slate-600 font-medium group-hover:text-slate-800"
                            }`}
                        >
                          {optText}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="p-6 md:p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                  {prevBtn}
                  {nextBtn}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
};

export default ExamRunnerView;