import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import ExamRunnerView from "./view.jsx";
import api from "../../../api/axios";
import { onAuthStateChanged } from "firebase/auth";


const ExamRunner = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const token = await user.getIdToken();

      const res = await api.get(
        `/api/student/exams/${examId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setExam(res.data);

      if (res.data.duration > 0) {
        setTimeLeft(res.data.duration * 60);
      }
    } catch (err) {
      console.error("Failed to load exam:", err);

      const status = err.response?.status;

      if (status === 403) {
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

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    if (!exam || isSubmitted || exam.duration === 0 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, exam]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* =========================
     ANSWER HANDLING
     (KEYED BY QUESTION_ID)
  ========================= */
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  /* =========================
     SUBMIT EXAM (BACKEND)
  ========================= */
  const handleSubmit = async () => {
    try {
      if (isSubmitted) return;

      const token = await auth.currentUser.getIdToken(true);

      const res = await api.post(
        `/api/exam/${examId}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Exam submission failed:", err);
      alert(err.response?.data?.message || "Submission failed");
    }
  };

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
      formatTime={formatTime}
      navigate={navigate}
    />
  );
};

export default ExamRunner;
