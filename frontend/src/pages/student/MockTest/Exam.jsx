/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import useMockSecurity from "../../../hooks/useMockSecurity";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  ChevronLeft,
  ChevronRight,
  Video,
  Bookmark,
  SkipForward,
  // ── CHANGE 1: import icons for AI violation modal types ───────────────────
  Users,
  Smartphone,
  Volume2,
} from "lucide-react";
import MockTestCodeEditor from "../../../components/exam/MockTestCodeEditor";
import VideoStreamWidget from "../../../components/exam/VideoStreamWidget";
import "./MockTestCoding.css";

// ─── Section Data ────────────────────────────────────────────────────────────
const SECTIONS_TEMPLATE = [
  {
    id: "mcq",
    label: "Section 1: MCQ",
    short: "MCQ",
    questions: [
      {
        id: "q1",
        text: "What is 2 + 2?",
        options: ["A. 3", "B. 4", "C. 5", "D. 6"],
        correctOption: "B. 4",
      },
      {
        id: "q2",
        text: "What does HTTP stand for?",
        options: [
          "A. HyperText Transfer Protocol",
          "B. High Text Transfer Protocol",
          "C. HyperText Transmission Process",
          "D. None of the above",
        ],
        correctOption: "A. HyperText Transfer Protocol",
      },
      {
        id: "q3",
        text: "What is the capital of India?",
        options: [
          "A. Mumbai",
          "B. New Delhi",
          "C. Kolkata",
          "D. Chennai",
        ],
        correctOption: "B. New Delhi",
      },
      {
        id: "q4",
        text: "What does HTML stand for?",
        options: [
          "A. HyperText Marked Language",
          "B. High Text Markup Language",
          "C. HyperText Markup Language",
          "D. None of the above",
        ],
        correctOption: "C. HyperText Markup Language",
      },
      {
        id: "q5",
        text: "What is the purpose of a CSS selector?",
        options: [
          "A. To define the structure of an HTML document",
          "B. To style specific elements in an HTML document",
          "C. To define JavaScript functions",
          "D. To create database tables",
        ],
        correctOption: "B. To style specific elements in an HTML document",
      },
    ],
  },
  {
    id: "descriptive",
    label: "Section 2: Descriptive",
    short: "Descriptive",
    questions: [
      {
        id: "q6",
        text: "Describe the differences between SQL and NoSQL databases.",
      },
      {
        id: "q7",
        text: "Explain the concept of closures in JavaScript and provide an example.",
      },
      {
        id: "q8",
        text: "What are the key principles of Object-Oriented Programming (OOP)?",
      },
      {
        id: "q9",
        text: "Differentiate between a stack and a queue data structure.",
      },
      {
        id: "q10",
        text: "What is the difference between 'let', 'const', and 'var' in JavaScript?",
      },
    ],
  },
  {
    id: "coding",
    label: "Section 3: Coding",
    short: "Coding",
    questions: [
      {
        id: "q11",
        text: "Write code to return the sum of two numbers.",
        starterCode: "// write your code here\n",
        testCases: [
          { input: "1\n2", output: "3" },
          { input: "5\n7", output: "12" },
        ],
      },
      {
        id: "q12",
        text: "Write a code to return whether a number is even or odd.",
        starterCode: "// write your code here\n",
        testCases: [
          { input: "4", output: "Even" },
          { input: "9", output: "Odd" },
        ],
      },
      {
        id: "q13",
        text: "Write a code to reverse a string.",
        starterCode: "// write your code here\n",
        testCases: [
          { input: "hello", output: "olleh" },
          { input: "world", output: "dlrow" },
        ],
      },
      {
        id: "q14",
        text: "Write a code to find the length of a string.",
        starterCode: "// write your code here\n",
        testCases: [
          { input: "hello", output: "5" },
          { input: "world", output: "5" },
        ],
      },
      {
        id: "q15",
        text: "Primer: Write a code to check if a number is prime.",
        starterCode: "// write your code here\n",
        testCases: [
          { input: "7", output: "Prime" },
          { input: "10", output: "Not Prime" },
        ],
      },
    ],
  },
];

const TOTAL_SECONDS = 15 * 60;

// Question status constants
const STATUS = {
  UNATTEMPTED: "unattempted",
  ANSWERED: "answered",
  SKIPPED: "skipped",
  MARKED: "marked",
  MARKED_ANSWERED: "marked_answered",
};

// ─── Randomization Utilities ──────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildRandomizedSections = () =>
  SECTIONS_TEMPLATE.map((sec) => {
    const shuffledQuestions = shuffle(sec.questions).map((q) => {
      if (!q.options) return q;
      const rawOptions = q.options.map((opt) => opt.replace(/^[A-Z]\.\s*/, ""));
      const shuffledRaw = shuffle(rawOptions);
      const labels = ["A", "B", "C", "D", "E"];
      const newOptions = shuffledRaw.map((text, i) => `${labels[i]}. ${text}`);
      const correctRaw = q.correctOption
        ? q.correctOption.replace(/^[A-Z]\.\s*/, "")
        : null;
      const newCorrectOption = correctRaw
        ? newOptions.find((o) => o.replace(/^[A-Z]\.\s*/, "") === correctRaw) ?? null
        : null;
      return { ...q, options: newOptions, correctOption: newCorrectOption };
    });
    return { ...sec, questions: shuffledQuestions };
  });

// ── CHANGE 2: AI violation modal metadata ─────────────────────────────────────
const AI_VIOLATION_META = {
  "multiple-faces": {
    icon:   <Users size={20} className="text-rose-500" />,
    title:  "Multiple / No Face Detected",
    border: "border-rose-400",
    btn:    "bg-rose-500 hover:bg-rose-600",
  },
  "phone-detected": {
    icon:   <Smartphone size={20} className="text-orange-500" />,
    title:  "Mobile Device Detected",
    border: "border-orange-400",
    btn:    "bg-orange-500 hover:bg-orange-600",
  },
  "loud-audio": {
    icon:   <Volume2 size={20} className="text-purple-500" />,
    title:  "Noise / Voice Detected",
    border: "border-purple-400",
    btn:    "bg-purple-500 hover:bg-purple-600",
  },
};

// ── CHANGE 3: ViolationModal handles both security + AI types ─────────────────
// Previously only rendered the amber security style.
// Now checks if the type matches an AI violation and renders a distinct style.
const ViolationModal = ({ warning, onDismiss }) => {
  if (!warning) return null;

  const ai = AI_VIOLATION_META[warning.type];

  if (ai) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border-t-4 ${ai.border}`}>
          <div className="flex items-center gap-3 mb-3">
            {ai.icon}
            <h3 className="text-lg font-bold text-slate-800">{ai.title}</h3>
          </div>
          <p className="text-slate-600 text-sm mb-2">{warning.message}</p>
          <p className="text-xs text-slate-400 mb-5">
            Violation {warning.count} of 3. After 3 violations, your exam will be
            auto-submitted.
          </p>
          <button
            onClick={onDismiss}
            className={`w-full text-white font-semibold py-2 rounded-lg text-sm transition-colors ${ai.btn}`}
          >
            I Understand
          </button>
        </div>
      </div>
    );
  }

  // Default amber style — unchanged from original
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border-t-4 border-amber-400">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Security Warning</h3>
        </div>
        <p className="text-slate-600 text-sm mb-2">{warning.message}</p>
        <p className="text-xs text-slate-400 mb-5">
          Violation {warning.count} of 3. After 3 violations, your exam will be
          auto-submitted.
        </p>
        <button
          onClick={onDismiss}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

// ─── Submitted Screen ─────────────────────────────────────────────────────────
const SubmittedScreen = ({ navigate }) => (
  <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
    <div className="flex flex-col items-center gap-5 animate-[fadeIn_0.5s_ease-out]">
      <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300">
        <CheckCircle size={52} className="text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-3xl font-extrabold text-emerald-700 tracking-tight">
        Submitted!
      </h2>
      <p className="text-slate-600 text-base text-center max-w-xs">
        Thank you for attempting the mock test. Your responses have been
        recorded.
      </p>
      <button
        onClick={() => {
          if (document.fullscreenElement)
            document.exitFullscreen().catch(() => {});
          navigate("/student/dashboard");
        }}
        className="mt-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition-colors shadow-md cursor-pointer"
      >
        Return to Dashboard
      </button>
    </div>
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`p-1.5 rounded transition-colors ${
      active
        ? "bg-indigo-100 text-indigo-700"
        : "hover:bg-slate-100 text-slate-600"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ qId, value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const execCmd = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(qId, editorRef.current?.innerHTML || "");
  };

  const isActive = (cmd) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  const toolbarGroups = [
    [
      { cmd: "bold",      icon: <Bold size={14} />,      title: "Bold" },
      { cmd: "italic",    icon: <Italic size={14} />,    title: "Italic" },
      { cmd: "underline", icon: <Underline size={14} />, title: "Underline" },
    ],
    [{ cmd: "formatBlock", val: "h2", icon: <Heading2 size={14} />, title: "Heading" }],
    [
      { cmd: "insertUnorderedList", icon: <List size={14} />,        title: "Bullet List" },
      { cmd: "insertOrderedList",   icon: <ListOrdered size={14} />, title: "Numbered List" },
    ],
    [
      { cmd: "justifyLeft",   icon: <AlignLeft size={14} />,   title: "Align Left" },
      { cmd: "justifyCenter", icon: <AlignCenter size={14} />, title: "Align Center" },
      { cmd: "justifyRight",  icon: <AlignRight size={14} />,  title: "Align Right" },
    ],
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 transition">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        {toolbarGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="w-px h-4 bg-slate-200 mx-1" />}
            {group.map(({ cmd, val, icon, title }) => (
              <ToolbarBtn
                key={cmd + (val || "")}
                title={title}
                active={isActive(cmd)}
                onClick={() => execCmd(cmd, val || null)}
              >
                {icon}
              </ToolbarBtn>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(qId, editorRef.current?.innerHTML || "")}
        className="min-h-[140px] p-3 text-sm text-slate-700 focus:outline-none"
        style={{ userSelect: "text", WebkitUserSelect: "text" }}
        data-placeholder="Type your answer here..."
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] h2 { font-size: 1.1em; font-weight: 700; margin: 4px 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.25rem; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.25rem; }
      `}</style>
    </div>
  );
};

// ─── Timer ────────────────────────────────────────────────────────────────────
const Timer = ({ secondsLeft }) => {
  const mins   = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs   = String(secondsLeft % 60).padStart(2, "0");
  const urgent = secondsLeft <= 120;
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
        urgent ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700"
      }`}
    >
      <Clock size={14} />
      {mins}:{secs}
    </div>
  );
};

// ─── Question Navigator ───────────────────────────────────────────────────────
const QuestionNav = ({ section, answers, statuses, activeQuestion, onSelect }) => {
  const getStyle = (qId, idx, isActive) => {
    if (isActive) return "bg-indigo-600 text-white border-indigo-600 shadow-sm";
    const status = statuses[qId] || STATUS.UNATTEMPTED;
    if (status === STATUS.MARKED || status === STATUS.MARKED_ANSWERED)
      return "bg-amber-50 text-amber-700 border-amber-400";
    if (status === STATUS.ANSWERED)
      return "bg-emerald-50 text-emerald-700 border-emerald-300";
    if (status === STATUS.SKIPPED)
      return "bg-slate-100 text-slate-400 border-slate-300 border-dashed";
    return "bg-white text-slate-500 border-slate-200 hover:border-indigo-300";
  };

  return (
    <div className="flex flex-col justify-between h-full px-4 py-6">
      <div>
        <div className="mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Progress
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {section.questions.map((q, idx) => {
            const isActive = idx === activeQuestion;
            const status = statuses[q.id] || STATUS.UNATTEMPTED;
            return (
              <div key={q.id} className="relative">
                <button
                  onClick={() => onSelect(idx)}
                  className={`w-12 h-12 rounded-full text-base font-bold transition-all border flex items-center justify-center ${getStyle(q.id, idx, isActive)}`}
                >
                  {idx + 1}
                </button>
                {(status === STATUS.MARKED || status === STATUS.MARKED_ANSWERED) && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-indigo-600" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Marked</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-slate-300 border border-dashed border-slate-400" />
          <span>Skipped</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-slate-200" />
          <span>Unvisited</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MockExam = () => {
  const navigate = useNavigate();

  const [mediaStream, setMediaStream]       = useState(null);
  const [mediaAllowed, setMediaAllowed]     = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [warning, setWarning]               = useState(null);
  const [activeSection, setActiveSection]   = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers]               = useState({});
  const [statuses, setStatuses]             = useState({});
  const [languages, setLanguages]           = useState({});
  const [isRunning, setIsRunning]           = useState({});
  const [consoleOutput, setConsoleOutput]   = useState({});
  const [secondsLeft, setSecondsLeft]       = useState(TOTAL_SECONDS);
  const timerRef = useRef(null);

  // ── CHANGE 4a: videoRef — forwarded to <VideoStreamWidget> so
  //   useMockSecurity can read frames for face/phone detection ────────────────
  const videoRef = useRef(null);

  // ── Randomized sections — built ONCE on mount, never change again ──────────
  const [SECTIONS] = useState(() => buildRandomizedSections());

  const currentSectionId = SECTIONS[activeSection]?.id ?? "";
  const currentSection   = SECTIONS[activeSection];
  const currentQuestion  = currentSection?.questions?.[activeQuestion];

  // ── Security ───────────────────────────────────────────────────────────────
  // CHANGE 4b: handleWarning now accepts optional 3rd arg `message` from AI
  // detectors. Security events don't pass it so we fall back to the map below.
  const handleWarning = useCallback((type, count, message) => {
    const messages = {
      "fullscreen-exit":   "You exited fullscreen mode. Returning to fullscreen now.",
      "text-selection":    "Text selection is not allowed during the exam.",
      blur:                "You switched windows. Please stay on the exam tab.",
      "visibility-hidden": "You navigated away from the exam tab.",
      "copy-paste":        "Copy/paste actions are disabled during the exam.",
    };
    setWarning({
      type,                                              // needed by ViolationModal to pick AI style
      message: message ?? messages[type] ?? "Security violation detected.",
      count,
    });
  }, []);

  const handleAutoSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  // CHANGE 4c: pass videoRef + mediaStream as the two new params
  const { triggerFullscreen, securityHandlers, stopAiDetection, aiDebugInfo } = useMockSecurity(
    handleAutoSubmit,
    handleWarning,
    currentSectionId,
    videoRef,      // ← face + phone detection reads frames from this <video>
    mediaStream,   // ← audio detection taps the mic from this stream
  );

  // ── Media init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let stream = null;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMediaStream(stream);
        setMediaAllowed(true);
        await triggerFullscreen();
      } catch (err) {
        console.warn("Media permission denied:", err);
        alert(
          "This exam requires camera and microphone access. Please allow permissions and refresh."
        );
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Stop tracks + AI detectors on submit ──────────────────────────────────
  useEffect(() => {
    if (submitted && mediaStream) {
      stopAiDetection?.();                               // ← stop AI detectors cleanly
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  }, [submitted, mediaStream, stopAiDetection]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mediaAllowed || submitted) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mediaAllowed, submitted]);

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    setStatuses((prev) => {
      const cur = prev[qId];
      if (cur === STATUS.MARKED || cur === STATUS.MARKED_ANSWERED) {
        return { ...prev, [qId]: STATUS.MARKED_ANSWERED };
      }
      return { ...prev, [qId]: value ? STATUS.ANSWERED : STATUS.UNATTEMPTED };
    });
  };

  const handleLanguageChange = (qId, lang) => {
    setLanguages((prev) => ({ ...prev, [qId]: lang }));
  };

  // ── Skip question ──────────────────────────────────────────────────────────
  const handleSkip = () => {
    const qId = currentQuestion?.id;
    if (!qId) return;
    setStatuses((prev) => {
      const cur = prev[qId];
      if (cur === STATUS.ANSWERED || cur === STATUS.MARKED_ANSWERED) return prev;
      return { ...prev, [qId]: STATUS.SKIPPED };
    });
    goToNext();
  };

  // ── Toggle mark for review ─────────────────────────────────────────────────
  const handleMarkForReview = () => {
    const qId = currentQuestion?.id;
    if (!qId) return;
    setStatuses((prev) => {
      const cur = prev[qId] || STATUS.UNATTEMPTED;
      if (cur === STATUS.MARKED)          return { ...prev, [qId]: STATUS.UNATTEMPTED };
      if (cur === STATUS.MARKED_ANSWERED) return { ...prev, [qId]: STATUS.ANSWERED };
      if (cur === STATUS.ANSWERED)        return { ...prev, [qId]: STATUS.MARKED_ANSWERED };
      return { ...prev, [qId]: STATUS.MARKED };
    });
  };

  const isMarked = () => {
    const qId = currentQuestion?.id;
    if (!qId) return false;
    const s = statuses[qId];
    return s === STATUS.MARKED || s === STATUS.MARKED_ANSWERED;
  };

  const normalizeLanguage = (lang) => {
    if (!lang) return "javascript";
    const map = {
      "c++": "cpp", "cpp": "cpp", "c": "c", "java": "java",
      "python": "python", "javascript": "javascript", "js": "javascript",
    };
    return map[lang.toLowerCase()] ?? lang.toLowerCase();
  };

  const handleRun = async (qId) => {
    setIsRunning((p) => ({ ...p, [qId]: true }));
    setConsoleOutput((p) => ({ ...p, [qId]: [] }));

    const q = SECTIONS.find((sec) => sec.id === "coding")
      ?.questions.find((x) => x.id === qId);

    const rawLang = languages[qId] || "javascript";
    const lang = normalizeLanguage(rawLang);

    try {
      const res = await api.post("/api/mocktest/run", {
        code: answers[qId] || "",
        language: lang,
        testCases: q?.testCases || [],
      });

      const { testResults } = res.data;
      const logs = [];

      if (Array.isArray(testResults)) {
        testResults.forEach((t) => {
          if (t.testCaseNumber === 0) {
            logs.push({ type: "error", msg: t.error || "Compilation Error" });
            return;
          }
          const status = t.passed ? "✅" : "❌";
          logs.push({ type: "message", msg: `Test ${t.testCaseNumber} : ${status}` });
          if (t.error) logs.push({ type: "error", msg: t.error });
          if (!t.passed && !t.error) {
            logs.push({
              type: "message",
              msg: `Expected: ${t.expectedOutput}  Actual: ${t.actualOutput}`,
            });
          }
        });
      }

      setConsoleOutput((p) => ({ ...p, [qId]: logs }));
    } catch (err) {
      console.error("Mocktest run error", err);
      const message =
        err.response?.data?.message || err.message || "Run failed. Check your server.";
      setConsoleOutput((p) => ({
        ...p,
        [qId]: [{ type: "error", msg: message }],
      }));
    } finally {
      setIsRunning((p) => ({ ...p, [qId]: false }));
    }
  };

  const goToSection = (sIdx) => {
    setActiveSection(sIdx);
    setActiveQuestion(0);
  };

  const goToNext = () => {
    if (activeQuestion < currentSection.questions.length - 1) {
      setActiveQuestion((q) => q + 1);
    } else if (activeSection < SECTIONS.length - 1) {
      setActiveSection((s) => s + 1);
      setActiveQuestion(0);
    }
  };

  const goToPrev = () => {
    if (activeQuestion > 0) {
      setActiveQuestion((q) => q - 1);
    } else if (activeSection > 0) {
      const prevSec = activeSection - 1;
      setActiveSection(prevSec);
      setActiveQuestion(SECTIONS[prevSec].questions.length - 1);
    }
  };

  useEffect(() => {
    const q = currentSection?.questions?.[activeQuestion];
    if (!q) return;
    const el = document.getElementById(`question-${q.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeQuestion, activeSection, currentSection]);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!mediaAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Requesting camera and microphone access...
          </p>
        </div>
      </div>
    );
  }

  if (submitted) return <SubmittedScreen navigate={navigate} />;

  const isDescriptiveSection = currentSectionId === "descriptive";
  const isFirstQuestion = activeSection === 0 && activeQuestion === 0;
  const isLastQuestion =
    activeSection === SECTIONS.length - 1 &&
    activeQuestion === currentSection.questions.length - 1;

  const marked = isMarked();

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans"
      style={{
        userSelect:       isDescriptiveSection ? "auto" : "none",
        WebkitUserSelect: isDescriptiveSection ? "auto" : "none",
      }}
      {...securityHandlers}
    >
      {/* ── Top Bar ── */}
      <header className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-indigo-600" />
            <span className="font-bold text-slate-800 text-base">Mock Exam</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer secondsLeft={secondsLeft} />
            <button
              onClick={() => setSubmitted(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Send size={13} />
              Submit
            </button>
          </div>
        </div>

        <div className="flex border-t border-slate-100">
          {SECTIONS.map((sec, idx) => {
            const sectionAnswered = sec.questions.filter(
              (q) =>
                statuses[q.id] === STATUS.ANSWERED ||
                statuses[q.id] === STATUS.MARKED_ANSWERED
            ).length;
            const isActive = activeSection === idx;
            return (
              <button
                key={sec.id}
                onClick={() => goToSection(idx)}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{sec.short}</span>
                <span
                  className={`text-[10px] font-normal ${
                    isActive ? "text-indigo-400" : "text-slate-400"
                  }`}
                >
                  {sectionAnswered}/{sec.questions.length}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Sidebar + Question area ── */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-40 flex-shrink-0 bg-slate-50 border-r border-slate-200 h-full">
          <QuestionNav
            section={currentSection}
            answers={answers}
            statuses={statuses}
            activeQuestion={activeQuestion}
            onSelect={setActiveQuestion}
          />
        </aside>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 min-h-0">
          {currentSection.questions.map((q, qIdx) => {
            if (qIdx !== activeQuestion) return null;
            return (
              <div
                id={`question-${q.id}`}
                key={q.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-colors ${
                  marked
                    ? "border-amber-300 ring-1 ring-amber-200"
                    : "border-slate-200"
                }`}
              >
                {/* Question header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {qIdx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                  {marked && (
                    <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-300">
                      <Bookmark size={11} fill="currentColor" />
                      Marked
                    </span>
                  )}
                </div>

                {/* MCQ */}
                {q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                            selected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                              : "border-slate-200 hover:border-indigo-300 text-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={selected}
                            onChange={() => handleAnswerChange(q.id, opt)}
                            className="accent-indigo-600"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Descriptive */}
                {!q.options && !q.starterCode && (
                  <RichTextEditor
                    qId={q.id}
                    value={answers[q.id] || ""}
                    onChange={handleAnswerChange}
                  />
                )}

                {/* Coding */}
                {q.starterCode && (
                  <div className="flex flex-col h-full mocktest-coding">
                    <MockTestCodeEditor
                      question={q}
                      code={answers[q.id] || q.starterCode}
                      language={languages[q.id] || "javascript"}
                      onLanguageChange={(lang) => handleLanguageChange(q.id, lang)}
                      onCodeChange={(code) => handleAnswerChange(q.id, code)}
                      onRun={() => handleRun(q.id)}
                      onSubmit={() => {
                        handleAnswerChange(q.id, answers[q.id] || "");
                        setConsoleOutput((p) => ({
                          ...p,
                          [q.id]: [
                            { type: "message", msg: "Answer recorded." },
                            ...(p[q.id] || []),
                          ],
                        }));
                      }}
                      isRunning={!!isRunning[q.id]}
                      consoleOutput={consoleOutput[q.id] || []}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Action bar: Prev / Skip / Mark / Next ── */}
          <div className="flex items-center justify-between mt-5 gap-2 flex-wrap">
            <button
              onClick={goToPrev}
              disabled={isFirstQuestion}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {!isLastQuestion && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  title="Skip this question and move to the next"
                >
                  <SkipForward size={14} />
                  Skip
                </button>
              )}

              <button
                onClick={handleMarkForReview}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  marked
                    ? "bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100"
                    : "border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600"
                }`}
                title={marked ? "Remove mark for review" : "Mark this question for review"}
              >
                <Bookmark size={14} fill={marked ? "currentColor" : "none"} />
                {marked ? "Marked" : "Mark for Review"}
              </button>
            </div>

            {isLastQuestion ? (
              <button
                onClick={() => setSubmitted(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm"
              >
                <Send size={13} />
                Submit Exam
              </button>
            ) : (
              <button
                onClick={goToNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm"
              >
                Next
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* ── Violation Warning Modal ── */}
      <ViolationModal warning={warning} onDismiss={() => setWarning(null)} />

      {/* ── Video Widget — videoRef forwarded so AI detectors can read frames ── */}
      {mediaStream && (
        <VideoStreamWidget
          stream={mediaStream}
          label="LIVE"
          initialCorner="bottom-right"
          videoRef={videoRef}
          aiDebugInfo={aiDebugInfo}
        />
      )}
    </div>
  );
};

export default MockExam;