import { addLocalCertificate } from '../../../utils/certificateStorage';
import { Peer } from 'peerjs';
import { toast } from 'react-hot-toast';
import { useObjectDetection } from '../../../hooks/useObjectDetection';
import { useVoiceDetection } from '../../../hooks/useVoiceDetection';
import { useFaceDetection } from '../../../hooks/useFaceDetection';
import { db } from '../../../auth/firebase';

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import ExamRunnerView from "./view.jsx";
import api from "../../../api/axios";
import { onAuthStateChanged } from "firebase/auth";
import useExamSecurity from "../../../hooks/useExamSecurity";
import { io } from "socket.io-client";

const SECTION_CONFIG = {
  mcq: { label: "MCQ", color: "bg-indigo-600", ring: "ring-indigo-400", badge: "bg-indigo-100 text-indigo-700", icon: "📝" },
  descriptive: { label: "Descriptive", color: "bg-emerald-600", ring: "ring-emerald-400", badge: "bg-emerald-100 text-emerald-700", icon: "✍️" },
  coding: { label: "Coding", color: "bg-amber-600", ring: "ring-amber-400", badge: "bg-amber-100 text-amber-700", icon: "💻" },
};

const ExamRunner = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const parseServerTimestamp = (value) => {
    if (!value) return NaN;
    if (typeof value === "string") {
      const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
      return new Date(hasTimezone ? value : `${value}Z`).getTime();
    }
    return new Date(value).getTime();
  };

  const [exam, setExam] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canRewrite, setCanRewrite] = useState(false);
  const socketRef = useRef(null);

  const [isProctored, setIsProctored] = useState(false);
  const [stream, setStream] = useState(null);
  const [proctoringError, setProctoringError] = useState(null);
  const [peer, setPeer] = useState(null);

  const streamRef = useRef(null);
  const peerRef = useRef(null);

  const { isSuspicious, detections } = useObjectDetection(stream);
  const { isVoiceSuspicious, isLoudNoise } = useVoiceDetection(stream);
  const { multipleFacesDetected, noFaceDetected } = useFaceDetection(stream);
  const lastSyncRef = useRef(0);

  const startCamera = async () => {
    try {
      setProctoringError(null);
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (audioErr) {
        console.warn('[CAMERA] Audio failed, falling back to video-only:', audioErr.message);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setIsProctored(true);
      toast.success('Camera started successfully');
      triggerFullscreen();
    } catch (err) {
      console.error('Camera access denied:', err);
      toast.error('Camera Error: ' + err.message);
      setProctoringError(
        'Camera access is required to start the exam. Please enable permissions in your browser settings.'
      );
    }
  };

  useEffect(() => {
    streamRef.current = stream; // Always keep the latest stream for potential incoming calls
    if (!stream || peerRef.current) return;
    let isMounted = true;
    const initPeer = async () => {
      const safeId = (auth.currentUser?.uid || 'exam').replace(/[^a-zA-Z0-9]/g, '');
      const peerId = `${safeId}-${Math.random().toString(36).substr(2, 5)}`;
      const newPeer = new Peer(peerId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] }
      });
      newPeer.on('open', async (id) => {
        if (!isMounted) return;
        try {
          // USE BACKEND BRIDGE TO BYPASS PERMISSION ISSUES
          await api.post('/api/proctoring/register', {
            peerId: id,
            userName: auth.currentUser?.displayName || localStorage.getItem('full_name') || 'Student',
            examId: examId,
            examTitle: exam?.title || 'Regular Exam',
            userId: auth.currentUser?.uid
          });
          console.log("[PROCTORING] session registered via backend:", id);
        } catch (e) {
          console.error("[PROCTORING] Registration Error:", e);
          toast.error("Proctoring Registry Error: " + (e.response?.data?.message || e.message));
        }
      });
      newPeer.on('call', (call) => {
        console.log("[PEER] Receiving proctoring call. Answering with current stream...");
        if (streamRef.current) {
          call.answer(streamRef.current);
          console.log("[PEER] Answered call with stream:", streamRef.current.id);
        } else {
          console.warn("[PEER] Call received but no local stream available to answer with.");
        }
      });
      if (isMounted) {
        setPeer(newPeer);
        peerRef.current = newPeer;
      }
    };
    const timer = setTimeout(initPeer, 1500);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [stream]);

  useEffect(() => {
    if (!peer || !peer.id || !isProctored || isSubmitted) return;
    const syncSuspiciousStatus = async () => {
      const now = Date.now();
      if (now - lastSyncRef.current < 3000) return;
      lastSyncRef.current = now;
      const isViolation = isSuspicious || isVoiceSuspicious || multipleFacesDetected || noFaceDetected || isLoudNoise;
      try {
        await api.post("/api/proctoring/status", {
          peerId: peer.id,
          status: {
            isSuspicious: isViolation,
            isVoiceSuspicious: isVoiceSuspicious || isLoudNoise,
            multipleFacesDetected: multipleFacesDetected,
            noFaceDetected: noFaceDetected,
            lastDetected: isViolation ? new Date().toISOString() : null
          }
        });
        if (isViolation && (now - (window._lastViolationLog || 0) > 10000)) {
          window._lastViolationLog = now;
          let type = 'UNKNOWN';
          if (isSuspicious) {
            const hasPhone = detections.some(d => d.class === 'cell phone');
            type = hasPhone ? 'PHONE_DETECTED' : 'OBJECT_DETECTION';
          } else if (noFaceDetected) type = 'NO_FACE';
          else if (multipleFacesDetected) type = 'MULTIPLE_FACES';
          else if (isLoudNoise) type = 'LOUD_NOISE';
          else if (isVoiceSuspicious) type = 'VOICE_DETECTION';
          api.post(`/api/student/exams/${examId}/violation`, {
            type,
            details: {
              timestamp: new Date().toISOString(),
              objectDetection: isSuspicious,
              voiceDetection: isVoiceSuspicious,
              loudNoise: isLoudNoise,
              noFace: noFaceDetected,
              multipleFaces: multipleFacesDetected,
              detections
            }
          }).catch(e => console.error(e));
        }
      } catch (err) { }
    };
    syncSuspiciousStatus();
  }, [isSuspicious, isVoiceSuspicious, multipleFacesDetected, noFaceDetected, isLoudNoise, peer, isProctored, isSubmitted, examId]);

  useEffect(() => {
    const handleUnload = () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (peerRef.current) {
        const pId = peerRef.current.id;
        peerRef.current.destroy();
        api.delete(`/api/proctoring/session/${pId}`).catch(() => { });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (peerRef.current) {
        const pId = peerRef.current.id;
        peerRef.current.destroy();
        deleteDoc(doc(db, 'live_sessions', pId)).catch(() => { });
      }
    };
  }, []);


  // Server-authoritative timer state
  const [endTimeMs, setEndTimeMs] = useState(null);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [isExamLocked, setIsExamLocked] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  /* =========================
     SECTION TABS STATE
  ========================= */
  const [activeSection, setActiveSection] = useState("mcq");
  const [sectionIndex, setSectionIndex] = useState(0);

  // Compute sections from exam questions
  const sections = useMemo(() => {
    if (!exam || !exam.questions) return { mcq: [], descriptive: [], coding: [] };
    return {
      mcq: exam.questions.filter(q => (q.type || q.question_type) === "mcq"),
      descriptive: exam.questions.filter(q => (q.type || q.question_type) === "descriptive"),
      coding: exam.questions.filter(q => (q.type || q.question_type) === "coding"),
    };
  }, [exam]);

  const availableSections = useMemo(() => {
    return ["mcq", "descriptive", "coding"].filter(t => sections[t].length > 0);
  }, [sections]);

  // Auto-select first available section when exam loads
  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.includes(activeSection)) {
      setActiveSection(availableSections[0]);
      setSectionIndex(0);
    }
  }, [availableSections]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSectionIndex(0);
  };

  /* =========================
     LOAD EXAM FROM BACKEND
  ========================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Use cached token to avoid Firebase quota issues
        const token = await user.getIdToken(false);

        const res = await api.get(
          `/api/student/exams/${examId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const examData = res.data;
        setExam(examData);

        if (examData.duration > 0) {
          const attemptRes = await api.get(
            `/api/exams/${examId}/attempt`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log("🔍 Attempt API Response:", attemptRes.data);

          const serverTime = parseServerTimestamp(attemptRes.data.server_time);
          const endTime = parseServerTimestamp(attemptRes.data.end_time);
          const clientTime = Date.now();

          if (!Number.isFinite(serverTime) || !Number.isFinite(endTime)) {
            console.error("Invalid attempt timestamps:", attemptRes.data);
            const fallbackEndTime = clientTime + (examData.duration * 60 * 1000);
            setEndTimeMs(fallbackEndTime);
            setServerOffsetMs(0);
            setTimeLeft(examData.duration * 60);
            setIsExamLocked(false);
            console.warn("⚠️ Using fallback timer - timestamps will be less secure");
            return;
          }

          console.log("⏰ Time Debugging:", {
            raw_server_time: attemptRes.data.server_time,
            raw_end_time: attemptRes.data.end_time,
            parsed_server_time: serverTime,
            parsed_end_time: endTime,
            client_time: clientTime,
            server_offset: serverTime - clientTime,
            duration_minutes: examData.duration,
            remaining_seconds: Math.floor((endTime - serverTime) / 1000)
          });

          setServerOffsetMs(serverTime - clientTime);
          setEndTimeMs(endTime);

          const remaining = Math.floor((endTime - serverTime) / 1000);
          setTimeLeft(Math.max(0, remaining));

          if (attemptRes.data.status === "submitted") {
            setIsSubmitted(true);
            setIsExamLocked(true);
            fetchExamResult();
          }
        }

      } catch (err) {
        console.error("Failed to load exam:", err);

        const status = err.response?.status;

        if (status === 400 && err.response?.data?.alreadySubmitted) {
          alert("This exam was already submitted (possibly auto-submitted due to disconnection).");
          setIsSubmitted(true);
          setIsExamLocked(true);
          setLoading(false);
          return;
        } else if (status === 403) {
          alert("You are not enrolled in this exam.");
          navigate("/student/exams");
        } else if (status === 404) {
          alert("Exam not found.");
          navigate("/student/exams");
        } else {
          alert("Unable to load exam.");
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [examId, navigate]);

  const fetchExamResult = async () => {
    try {
      const token = await auth.currentUser.getIdToken(false);
      const res = await api.get(`/api/exams/results/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to fetch exam result:", err);
      }
    }
  };

  const checkExamStatus = async () => {
    if (!exam || isSubmitted) return;

    try {
      const token = await auth.currentUser.getIdToken(false);
      const res = await api.get(`/api/exams/${examId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'submitted') {
        console.log("📊 API Check: Exam was auto-submitted");
        setIsExamLocked(true);
        setIsSubmitted(true);
        fetchExamResult();
        alert("Exam was auto-submitted due to disconnection.");
      }
    } catch (err) {
      console.log("Could not check exam status:", err.message);
    }
  };

  /* =========================
     SOCKET CONNECTION
  ========================= */
  useEffect(() => {
    if (!exam || isSubmitted) return;

    const connectSocket = async () => {
      try {
        // Use cached token for socket connection
        const token = await auth.currentUser.getIdToken(false);

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: Infinity,
          transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        console.log("🔧 Setting up socket listeners for exam:", examId);

        // Handle auto-submit event from server (SET THIS UP FIRST!)
        socket.on("exam:autoSubmitted", (data) => {
          console.log("🚨🚨🚨 RECEIVED exam:autoSubmitted event:", data);
          console.log("Current state - isSubmitted:", isSubmitted, "isExamLocked:", isExamLocked);

          setIsExamLocked(true);
          setIsSubmitted(true);
          fetchExamResult();

          alert(data.message || "Exam auto-submitted due to disconnection.");
        });

        // Initial connection AND reconnection
        socket.on("connect", () => {
          console.log("🔌 Connected to server, socket ID:", socket.id);
          console.log("📝 Emitting exam:start for examId:", examId);

          socket.emit("exam:start", { examId });

          checkExamStatus();
        });

        socket.on("disconnect", (reason) => {
          console.warn("❌ Disconnected from server. Reason:", reason);
          console.warn("⏰ Grace timer should start now on backend");
          if (reason === "io server disconnect") {
            socket.connect();
          }
        });

        socket.on("connect_error", (error) => {
          console.error("🚫 Connection error:", error.message);
        });

        socket.io.on("reconnect_attempt", (attempt) => {
          console.log("🔄 Reconnection attempt #", attempt);
        });

        socket.io.on("reconnect", (attempt) => {
          console.log("✅✅✅ Successfully reconnected after", attempt, "attempts");
          console.log("📝 exam:start will be emitted via 'connect' event");
        });

      } catch (error) {
        console.error("Socket connection error:", error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket...");
        socketRef.current.disconnect();
      }
    };
  }, [exam, examId, isSubmitted]);

  /* =========================
     VISIBILITY CHECK FOR AUTO-SUBMIT
     (Fallback if socket event is missed)
  ========================= */
  useEffect(() => {
    if (!exam || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👀 Page became visible, checking exam status...");
        checkExamStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [exam, examId, isSubmitted]);

  /* =========================
     DRIFT-PROOF TIMER
  ========================= */
  useEffect(() => {
    if (!exam || isSubmitted || exam.duration === 0 || !endTimeMs || isExamLocked) return;

    let tickCount = 0;
    const timer = setInterval(() => {
      const now = Date.now() + serverOffsetMs;
      const secondsRemaining = Math.floor((endTimeMs - now) / 1000);

      if (tickCount < 3) {
        console.log(`⏱️ Timer Tick ${tickCount + 1}:`, {
          clientNow: Date.now(),
          serverOffsetMs,
          adjustedNow: now,
          endTimeMs,
          secondsRemaining
        });
        tickCount++;
      }

      if (secondsRemaining <= 0) {
        console.log("❌ Timer expired - locking exam");
        setTimeLeft(0);
        setIsExamLocked(true);
        clearInterval(timer);
      } else {
        setTimeLeft(secondsRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, endTimeMs, serverOffsetMs, isSubmitted, isExamLocked]);

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* =========================
     ANSWER HANDLING
     (KEYED BY QUESTION_ID)
  ========================= */
  const handleAnswer = async (question, value) => {
    if (isExamLocked || isSubmitted) return;

    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }));

    try {
      const token = await auth.currentUser.getIdToken(false);

      if (question.type === "mcq") {
        console.log("💾 Saving MCQ answer:", { questionId: question.id, optionId: value });

        const response = await api.post(
          `/api/exams/${examId}/save-answer`,
          { questionId: question.id, selectedOptionId: value },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ MCQ answer saved:", response.data);
      } else {
        console.log("💾 Saving text answer:", { questionId: question.id, textLength: value?.length });

        const response = await api.post(
          `/api/exams/${examId}/save-answer`,
          { questionId: question.id, answerText: value },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Text answer saved:", response.data);
      }
    } catch (error) {
      console.error("❌ Failed to save answer:", {
        questionId: question.id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  /* =========================
     SUBMIT EXAM (BACKEND)
  ========================= */
  const handleSubmit = async () => {
    try {
      if (isSubmitted) return;

      const token = await auth.currentUser.getIdToken(false);

      console.log("📤 Submitting exam...", {
        examId,
        answersCount: Object.keys(answersRef.current).length,
        answers: answersRef.current
      });

      const res = await api.post(
        `/api/exams/${examId}/submit`,
        { answers: answersRef.current },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Exam submitted successfully:", res.data);

      setResult(res.data);
      setIsSubmitted(true);
      setCanRewrite(true);

    } catch (err) {
      console.error("❌ Exam submission failed:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        error: err
      });

      const errorMessage = err.response?.data?.message || "Failed to submit exam. Please try again.";

      if (err.response?.status === 400 && err.response?.data?.message === "Exam already submitted") {
        setIsSubmitted(true);
        setCanRewrite(true);
        alert("Exam has been submitted. You can rewrite it if needed.");
      } else if (err.message?.includes('auth/quota-exceeded')) {
        alert('Firebase quota exceeded. Please try again in a few minutes or contact support.');
      } else {
        alert(`Submission Error: ${errorMessage}`);
      }
    }
  };

  /* =========================
     REWRITE EXAM
  ========================= */
  const handleRewrite = async () => {
    try {
      const token = await auth.currentUser.getIdToken(false);

      await api.post(
        `/api/exams/${examId}/rewrite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset UI state
      setIsSubmitted(false);
      setResult(null);
      setAnswers({});
      setCurrentQIndex(0);
      setCanRewrite(false);
      // Also reset section to first available
      setSectionIndex(0);

      if (exam?.duration > 0) {
        const token = await auth.currentUser.getIdToken(false);
        const attemptRes = await api.get(
          `/api/exams/${examId}/attempt`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const serverTime = new Date(attemptRes.data.server_time).getTime();
        const endTime = new Date(attemptRes.data.end_time).getTime();
        setServerOffsetMs(serverTime - Date.now());
        setEndTimeMs(endTime);
        const remaining = Math.floor((endTime - serverTime) / 1000);
        setTimeLeft(Math.max(0, remaining));
      }

      console.log("✅ Rewrite attempt created successfully");
    } catch (err) {
      console.error("❌ Failed to create rewrite attempt:", err);
      alert("Failed to start rewrite. Please try again.");
    }
  };

  /* =========================
     EXAM SECURITY HOOK
  ========================= */
  const [securityModal, setSecurityModal] = useState({
    open: false,
    type: 'tab-switch',
    count: 0
  });

  const handleSecurityWarning = (type, count) => {
    setSecurityModal({
      open: true,
      type: type,
      count: count
    });
  };

  const handleResumeExam = () => {
    setSecurityModal(prev => ({ ...prev, open: false }));
    triggerFullscreen();
  };

  const { securityHandlers, triggerFullscreen, isTerminated } = useExamSecurity(handleSubmit, handleSecurityWarning);

  return (
    <ExamRunnerView
      loading={loading}
      exam={exam}
      currentQIndex={currentQIndex}
      setCurrentQIndex={setCurrentQIndex}
      answers={answers}
      handleAnswer={handleAnswer}
      timeLeft={timeLeft}
      isSubmitted={isSubmitted}
      result={result}
      handleSubmit={handleSubmit}
      handleRewrite={handleRewrite}
      canRewrite={canRewrite}
      formatTime={formatTime}
      navigate={navigate}
      securityHandlers={securityHandlers}
      triggerFullscreen={triggerFullscreen}
      securityModal={securityModal}
      handleResumeExam={handleResumeExam}
      isExamLocked={isExamLocked}
      isTerminated={isTerminated}
      // Section tab props
      activeSection={activeSection}
      sectionIndex={sectionIndex}
      setSectionIndex={setSectionIndex}
      sections={sections}
      availableSections={availableSections}
      handleSectionChange={handleSectionChange}
      sectionConfig={SECTION_CONFIG}
      // AI Props
      isProctored={isProctored}
      stream={stream}
      proctoringError={proctoringError}
      startCamera={startCamera}
      isSuspicious={isSuspicious || isVoiceSuspicious || multipleFacesDetected}
      isVoiceSuspicious={isVoiceSuspicious}
      multipleFacesDetected={multipleFacesDetected}
      detections={detections}
    />
  );
};

export default ExamRunner;