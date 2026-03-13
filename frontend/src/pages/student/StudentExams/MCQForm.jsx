import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
  Video,
  Camera,
  AlertTriangle,
  Users
} from "lucide-react";
import { Peer } from "peerjs";
import { auth, db } from "../../../auth/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { addLocalCertificate } from "../../../utils/certificateStorage";
import { useObjectDetection } from "../../../hooks/useObjectDetection";
import { useVoiceDetection } from "../../../hooks/useVoiceDetection";
import { useFaceDetection } from "../../../hooks/useFaceDetection";

const CameraPreview = ({ stream, isHidden = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className={`fixed bottom-6 right-6 w-48 h-36 bg-slate-900 rounded-lg shadow-2xl border-2 border-indigo-500 overflow-hidden z-50 ring-4 ring-indigo-500/20 transition-opacity ${isHidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover transform -scale-x-100"
      />
      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-red-500 rounded-full">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
      </div>
    </div>
  );
};

const ProctoringSetup = ({ startCamera, error, onBack }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 font-sans p-6">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 w-full max-w-2xl text-center">
        <div className="space-y-8">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-indigo-50">
            <Video size={36} />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Practice Quiz Proctoring
            </h2>
            <p className="text-slate-500 text-lg">
              This practice quiz requires camera access to simulate a real exam environment.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-left space-y-4">
            <h4 className="flex items-center gap-2 font-bold text-amber-800">
              <Camera className="text-amber-600 w-5 h-5" /> Quick Rules:
            </h4>
            <ul className="text-sm text-amber-800/80 space-y-2 list-disc pl-5 font-medium">
              <li>Ensure your face is visible.</li>
              <li>Stay within the camera frame.</li>
              <li>Camera will stay ON during the quiz.</li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium text-left">
              <AlertTriangle className="shrink-0 w-5 h-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button
              className="px-8 py-4 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-all"
              onClick={onBack}
            >
              Go Back
            </button>
            <button
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-200"
              onClick={startCamera}
            >
              Start Camera & Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MCQForm = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Proctoring States
  const [isProctored, setIsProctored] = useState(false);
  const [stream, setStream] = useState(null);
  const [proctoringError, setProctoringError] = useState(null);
  const [peer, setPeer] = useState(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);

  // AI Detection
  const { isSuspicious, detections } = useObjectDetection(stream);
  const { isVoiceSuspicious, isLoudNoise } = useVoiceDetection(stream);
  const { multipleFacesDetected, noFaceDetected } = useFaceDetection(stream);
  const lastSyncRef = useRef(0);

  const STORAGE_KEY = "mcq_quiz_answers";
  const QUIZ_COMPLETED_KEY = "mcq_quiz_completed";

  const questions = [
    {
      id: 1,
      question: "What is React?",
      options: [
        "A database management system",
        "A JavaScript library for building user interfaces with reusable components",
        "A backend server framework",
        "A CSS preprocessor",
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "Which of the following is the correct way to create a functional component in React?",
      options: [
        "const Component = () => { return <div>Hello</div>; }",
        "function Component() { return <div>Hello</div>; }",
        "Both A and B are correct",
        "const Component = class { render() {} }",
      ],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: "What is JSX?",
      options: [
        "A syntax extension that allows you to write HTML-like code in JavaScript",
        "A separate file format for styling components",
        "A database query language",
        "A package manager for React",
      ],
      correctAnswer: 0,
    },
    {
      id: 4,
      question: "What is the purpose of the useEffect hook in React?",
      options: [
        "To manage component styling",
        "To handle side effects and lifecycle operations in functional components",
        "To create new components",
        "To manage component props",
      ],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: "How do you pass data from parent to child component in React?",
      options: [
        "Using Context API only",
        "Using props",
        "Using Redux only",
        "Using state directly",
      ],
      correctAnswer: 1,
    },
  ];

  /* =========================
     CAMERA / PROCTORING LOGIC
  ========================= */
  const startCamera = async () => {
    try {
      setProctoringError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Audio requested for voice proctoring
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setIsProctored(true);
      toast.success("Camera started!");

      // Auto-enter fullscreen
      enterFullscreen();
    } catch (err) {
      console.error("Camera access denied:", err);
      setProctoringError(
        "Camera access is required. Please enable permissions in your browser or check if another app is using the camera."
      );
    }
  };

  // Dedicated effect for PeerJS initialization to ensure stream is ready
  useEffect(() => {
    if (!stream || peerRef.current) return;

    let isMounted = true;
    const initPeer = async () => {
      // PeerJS IDs are best kept alphanumeric
      const safeId = (auth.currentUser?.uid || "student").replace(/[^a-zA-Z0-9]/g, "");
      const peerId = `${safeId}-${Math.random().toString(36).substr(2, 5)}`;

      console.log("[PEER] Initializing Student Peer:", peerId);
      const newPeer = new Peer(peerId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] }
      });

      newPeer.on("open", async (id) => {
        console.log("[PEER] Student Peer Online:", id);
        toast.success("Live proctoring active!");
        try {
          // CLEANUP STALE SESSIONS for this user first
          const uid = auth.currentUser?.uid;
          if (uid) {
            const q = query(collection(db, "live_sessions"), where("userId", "==", uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const batch = writeBatch(db);
              snap.forEach(d => batch.delete(d.ref));
              await batch.commit();
            }
          }
          // SYNC NEW SESSION
          await setDoc(doc(db, "live_sessions", id), {
            userId: auth.currentUser?.uid || "anonymous",
            userName: auth.currentUser?.displayName || "Student",
            examId: "practice-quiz",
            examTitle: "React Fundamentals Practice",
            startTime: serverTimestamp(),
            peerId: id
          });
        } catch (e) {
          console.error("[FIRESTORE] Session sync error:", e);
        }
      });

      newPeer.on("call", (call) => {
        console.log("[PEER] Receiving call from admin. Answering with stream...");
        call.answer(stream);
      });

      newPeer.on("error", (err) => console.error("[PEER] Student Peer Error:", err.type));

      if (isMounted) {
        setPeer(newPeer);
        peerRef.current = newPeer;
      }
    };

    // Slight delay before peer init to ensure OS has fully allocated camera
    const timer = setTimeout(initPeer, 1500);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [stream]);

  // Sync suspicious status to Firestore in real-time AND log to backend
  useEffect(() => {
    if (!peer || !peer.id || !isProctored || submitted) return;

    const syncSuspiciousStatus = async () => {
      // Throttling: Only sync every 3 seconds
      const now = Date.now();
      if (now - lastSyncRef.current < 3000) return;
      lastSyncRef.current = now;

      const isViolation = isSuspicious || isVoiceSuspicious || multipleFacesDetected || noFaceDetected || isLoudNoise;

      try {
        await setDoc(doc(db, "live_sessions", peer.id), {
          isSuspicious: isViolation,
          isVoiceSuspicious: isVoiceSuspicious || isLoudNoise,
          multipleFacesDetected: multipleFacesDetected,
          noFaceDetected: noFaceDetected,
          lastDetected: isViolation ? serverTimestamp() : null
        }, { merge: true });

        if (isViolation) {
          // Log to Permanent Storage (PostgreSQL) - Throttled to once every 10 seconds
          const lastBackendLog = window._lastViolationLog || 0;
          if (now - lastBackendLog > 10000) {
            window._lastViolationLog = now;
            let type = "UNKNOWN";

            // Prioritize most severe/specific
            if (isSuspicious) {
              const hasPhone = detections.some(d => d.class === 'cell phone');
              type = hasPhone ? "PHONE_DETECTED" : "OBJECT_DETECTION";
            } else if (noFaceDetected) {
              type = "NO_FACE";
            } else if (multipleFacesDetected) {
              type = "MULTIPLE_FACES";
            } else if (isLoudNoise) {
              type = "LOUD_NOISE";
            } else if (isVoiceSuspicious) {
              type = "VOICE_DETECTION";
            }

            console.log(`[VIOLATION DEBUG] Sending to backend: /api/student/exams/practice-quiz/violation`, type);
            // For practice quiz, we use a fixed examId or "practice"
            api.post(`/api/student/exams/practice-quiz/violation`, {
              type,
              details: {
                timestamp: new Date().toISOString(),
                isPractice: true,
                objectDetection: isSuspicious,
                voiceDetection: isVoiceSuspicious,
                loudNoise: isLoudNoise,
                noFace: noFaceDetected,
                multipleFaces: multipleFacesDetected,
                detections: detections
              }
            }).catch(e => console.error("[BACKEND] Practice violation log failed:", e));
          }
        }
      } catch (err) {
        console.error("[FIRESTORE] Failed to sync suspicious status:", err);
      }
    };

    syncSuspiciousStatus();
  }, [isSuspicious, isVoiceSuspicious, multipleFacesDetected, noFaceDetected, isLoudNoise, peer, isProctored, submitted]);

  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const stopCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (peerRef.current) {
      const peerId = peerRef.current.id;
      peerRef.current.destroy();
      peerRef.current = null;
      setPeer(null);
      // Remove from Firestore
      try {
        await deleteDoc(doc(db, "live_sessions", peerId));
      } catch (err) {
        console.error("Firestore cleanup error:", err);
      }
    }
  };

  // Fullscreen integrity check
  useEffect(() => {
    if (!isProctored || submitted) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isFullscreen && isProctored && !submitted) {
        toast.error("Warning: Please stay in fullscreen mode to continue the exam!", {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
          },
        });

        // Show a modal or alert to the user
        const reEnter = window.confirm("Proctoring Alert: Fullscreen is required. Re-enter fullscreen?");
        if (reEnter) {
          enterFullscreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [isProctored, submitted]);

  // Cleanup stream on component unmount
  useEffect(() => {
    const handleUnload = () => {
      stopCamera();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      stopCamera();
    };
  }, []); // Only on unmount

  // Load answers from local storage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    const quizCompleted = localStorage.getItem(QUIZ_COMPLETED_KEY);

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    if (quizCompleted) {
      setSubmitted(true);
      setShowResults(true);
      // For practice quiz, if already submitted, we can skip proctoring for results
      setIsProctored(true);
    }
  }, []);

  // Save answers to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const handleAnswerChange = (optionIndex) => {
    if (!submitted) {
      setAnswers({
        ...answers,
        [currentQuestion]: optionIndex,
      });
      setError("");
    }
  };

  const handleNext = () => {
    if (answers[currentQuestion] === undefined) {
      setError("Please select an answer before proceeding.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setError("");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    // Validate all answers are selected
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    const score = calculateScore();
    setSubmitted(true);
    setShowResults(true);
    localStorage.setItem(QUIZ_COMPLETED_KEY, "true");

    // Stop camera and exit fullscreen on submission
    stopCamera();
    exitFullscreen();

    // Always save certificate locally when passing (no backend required)
    if (score >= 50) {
      addLocalCertificate({ course: "React Fundamentals Quiz", score });
      toast.success("Certificate earned! View it in Certificates.");
      try {
        await api.post("/api/certificate/quiz/generate", {
          exam_name: "React Fundamentals Quiz",
          percentage: score,
        });
      } catch (_) {
        // Backend optional; certificate already saved locally
      }
    }

    // NEW: Always save to PostgreSQL exam_results for Proctoring Dashboard visibility
    try {
      await api.post("/api/studentExam/practice/save-result", {
        exam_name: "React Fundamentals Quiz",
        percentage: score,
        obtained_marks: Math.round((score / 100) * questions.length),
        total_marks: questions.length
      });
      console.log("Practice result synced to PostgreSQL");
    } catch (err) {
      console.error("Failed to sync practice result to backend:", err);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setSubmitted(false);
    setError("");
    setIsProctored(false); // Ask for proctoring again on reset
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUIZ_COMPLETED_KEY);
    stopCamera();
    exitFullscreen();
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const score = calculateScore();
  const passed = score >= 50;

  // 1. Live Proctoring Step (Setup)
  if (!isProctored) {
    return (
      <ProctoringSetup
        startCamera={startCamera}
        error={proctoringError}
        onBack={onBack}
      />
    );
  }

  if (showResults) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {passed ? (
            <>
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-14 h-14 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Exam Cleared!</h2>
                <p className="text-lg text-slate-600 font-semibold">
                  🎉 Congratulations! You have successfully cleared the exam with {score}%
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <p className="text-green-700 font-medium">
                  You scored {score}% which is above the required 50% passing score.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-red-600">{score}%</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
                <p className="text-slate-600">You scored {score}% on this practice quiz</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-700 font-medium">
                  You need 50% to pass. Keep practicing to improve your score!
                </p>
              </div>

              <div className="mb-8 bg-slate-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Results Summary</h3>
                <div className="space-y-3">
                  {questions.map((q, index) => {
                    const isCorrect = answers[index] === q.correctAnswer;
                    return (
                      <div key={q.id} className="flex items-center gap-3 text-left">
                        {isCorrect ? (
                          <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                        ) : (
                          <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            Q{index + 1}: {isCorrect ? "Correct" : "Incorrect"}
                          </p>
                          <p className="text-xs text-slate-500">{q.question}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                exitFullscreen();
                onBack();
              }}
              className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] overflow-y-auto p-4 md:p-8">
      {/* ⚠️ Suspicious Activity Warning Detail Overlay */}
      {(isSuspicious || isVoiceSuspicious || multipleFacesDetected) && (
        <div className="fixed inset-0 z-[10000] bg-rose-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border-4 border-rose-500 animate-pulse">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              {multipleFacesDetected ? "Multiple Faces Detected!" : (isVoiceSuspicious ? "Voice Detected!" : "Suspicious Object!")}
            </h2>
            <p className="text-slate-600 font-medium mb-8">
              {multipleFacesDetected
                ? "Only one candidate is allowed in front of the camera. Multiple people detected."
                : (isVoiceSuspicious
                  ? "Experimental voice detection has picked up audio. Please maintain silence."
                  : "A Mobile Phone was detected. Please remove it to continue.")
              }
              <br /><br />
              This incident has been logged and reported.
            </p>
          </div>
        </div>
      )}

      {/* 2. Live Camera Preview Overlay - Hidden but active for proctoring */}
      <CameraPreview stream={stream} isHidden={true} />

      <div className="w-full max-w-4xl mx-auto pb-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Custom Header in Fullscreen */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (window.confirm("Exit quiz? Progress will be lost and camera will stop.")) {
                    stopCamera();
                    exitFullscreen();
                    onBack();
                  }
                }}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-sm">Exit Quiz</span>
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <h3 className="font-bold">React Fundamentals Practice</h3>
            </div>

            <button
              onClick={enterFullscreen}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
            >
              <Camera size={14} /> Re-enter Fullscreen (If minimized)
            </button>
          </div>

          <div className="p-8">
            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-bold text-indigo-600">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-xl p-5 animate-shake">
                <AlertCircle className="text-rose-600 w-6 h-6 flex-shrink-0" />
                <p className="text-rose-700 font-bold">{error}</p>
              </div>
            )}

            {/* Question */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-8">
                {question.question}
              </h3>

              {/* Options */}
              <div className="grid gap-4">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`group flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${selectedAnswer === index
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                      : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white hover:shadow-md"
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAnswer === index ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-indigo-400"
                      }`}>
                      {selectedAnswer === index && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => handleAnswerChange(index)}
                      disabled={submitted}
                      className="hidden"
                    />
                    <span className={`ml-6 text-xl transition-colors ${selectedAnswer === index ? "text-indigo-900 font-bold" : "text-slate-600 font-medium"
                      }`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-6 pt-6 border-t border-slate-100">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 py-4 px-6 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous Question
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-100"
                >
                  Submit Final Answers
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  Save & Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Warning Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm font-medium">
          <p>Locked in Fullscreen Mode for Integrity Purposes</p>
          <p className="mt-1">Exiting fullscreen will be logged as a potential violation.</p>
        </div>
      </div>
    </div>
  );
};


export default MCQForm;
