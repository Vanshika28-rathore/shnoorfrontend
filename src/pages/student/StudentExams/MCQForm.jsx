import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, RotateCcw, AlertCircle, ArrowLeft } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";

const MCQForm = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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

    // Generate certificate if score >= 50%
    if (score >= 50) {
      try {
        const response = await api.post("/api/certificate/quiz/generate", {
          exam_name: "React Fundamentals Quiz",
          percentage: score,
        });

        if (response.data.success) {
          toast.success("Certificate generated successfully!");
          console.log("Certificate generated:", response.data.filePath);
        }
      } catch (err) {
        console.error("Certificate generation error:", err);
        toast.error("Certificate generation failed");
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setSubmitted(false);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUIZ_COMPLETED_KEY);
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

          <button
            onClick={handleReset}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Exams
          </button>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAnswer === index
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                } ${submitted && index === question.correctAnswer ? "border-green-500 bg-green-50" : ""} ${
                  submitted && selectedAnswer === index && selectedAnswer !== question.correctAnswer
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerChange(index)}
                  disabled={submitted}
                  className="w-4 h-4 text-indigo-600 cursor-pointer"
                />
                <span className="ml-4 text-slate-700 font-medium">{option}</span>
                {submitted && index === question.correctAnswer && (
                  <CheckCircle className="ml-auto text-green-500 w-5 h-5" />
                )}
                {submitted && selectedAnswer === index && selectedAnswer !== question.correctAnswer && (
                  <XCircle className="ml-auto text-red-500 w-5 h-5" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-700 font-bold rounded-lg hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQForm;
