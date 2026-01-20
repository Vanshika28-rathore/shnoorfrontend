import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaSave,
  FaArrowRight,
  FaArrowLeft,
  FaTrash,
  FaPlus,
  FaCode,
  FaListUl,
  FaExclamationCircle,
  FaAlignLeft,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";
import { auth } from "../../auth/firebase";
import api from "../../api/axios";
import "../../styles/Dashboard.css";

const ExamBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Exam",
    duration: 60,
    passPercentage: 70,
    questions: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = (type) => {
    const newQ =
      type === "mcq"
        ? {
            id: Date.now(),
            type: "mcq",
            text: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            marks: 5,
          }
        : type === "descriptive"
          ? { id: Date.now(), type: "descriptive", text: "", marks: 10 }
          : {
              id: Date.now(),
              type: "coding",
              title: "",
              text: "",
              constraints: "",
              starterCode: "// Write your code here",
              testCases: [],
              marks: 20,
            };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
  };

  const updateQuestion = (qId, field, value) => {
    setFormData((prev) => {
      const updatedQuestions = prev.questions.map((q) => {
        if (q.id === qId) {
          return { ...q, [field]: value };
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  const removeQuestion = (qId) => {
    setFormData((prev) => ({
      ...prev,


      questions: prev.questions.filter((q) => q.id !== qId),
    }));
  };

  const validateForm = () => {
    if (!formData.title) return "Exam title is required.";

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.text) return `Question ${i + 1} is missing text.`;
      if (q.type === "mcq") {
        if (q.options.some((o) => !o))
          return `Question ${i + 1} has empty options.`;
        if (!q.correctAnswer)
          return `Question ${i + 1} needs a correct answer selected.`;
      }
      if (q.type === "descriptive") {
        if (!q.text) return `Question ${i + 1} is missing text.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken(true);

      /* ===============================
       1️⃣ CREATE EXAM
    =============================== */
      const examRes = await api.post(
        "/api/exams",
        {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          passPercentage: formData.passPercentage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const examId = examRes.data.exam_id;

      /* ===============================
       2️⃣ CREATE QUESTIONS
    =============================== */
      for (let i = 0; i < formData.questions.length; i++) {
        const q = formData.questions[i];

        if (q.type === "mcq") {
          await api.post(
            `/api/exams/${examId}/questions/mcq`,
            {
              questionText: q.text,
              options: q.options,
              correctOption: q.correctAnswer,
              marks: q.marks || 1,
              order: i + 1,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }

        if (q.type === "descriptive") {
          await api.post(
            `/api/exams/${examId}/questions/descriptive`,
            {
              questionText: q.text,
              marks: q.marks || 10,
              order: i + 1,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }

        if (q.type === "coding") {
          if (!q.testCases || q.testCases.length === 0) {
            alert("Coding questions must have at least one test case");
            return; // ⛔ stops API call and prevents 400 error
          }

          await api.post(
            `/api/exams/${examId}/questions/coding`,
            {
              title: q.title,
              description: q.text,
              language: q.language,
              starter_code: q.starterCode,
              marks: q.marks,
              order: i + 1,
              testcases: q.testCases,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }
      }

      alert("Exam created successfully!");
      navigate("/instructor/dashboard");
    } catch (err) {
      console.error("Create exam error:", err);
      alert("Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Saving exam...</div>;

  return (
    <div className="content-area">
      <div className="page-title flex-between-center mb-lg">
        <h2>Create Final Exam</h2>
        <button
          className="btn-secondary"
          onClick={() => navigate("/instructor/dashboard")}
        >
          Cancel
        </button>
      </div>

      <div className="form-box full-width">
        <div className="tab-header">
          <div
            onClick={() => setStep(1)}
            className={`tab-item ${step === 1 ? "active" : ""}`}
          >
            1. Configuration
          </div>
          <div
            onClick={() => setStep(2)}
            className={`tab-item ${step === 2 ? "active" : ""}`}
          >
            2. Questions ({formData.questions.length})
          </div>
        </div>

        {step === 1 && (
          <div className="grid-2">
            <div className="form-group full-width">
              <label>Exam Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Final Semester Exam"
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Pass Percentage (%)</label>
              <input
                type="number"
                name="passPercentage"
                value={formData.passPercentage}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <div
                className="flex-end mt-sm"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button className="btn-primary" onClick={() => setStep(2)}>
                  Next: Add Questions <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div
              className="flex-center-gap mb-lg"
              style={{ justifyContent: "center" }}
            >
              <button
                className="btn-secondary"
                onClick={() => addQuestion("mcq")}
              >
                <FaListUl /> Add MCQ
              </button>
              <button
                className="btn-secondary"
                onClick={() => addQuestion("descriptive")}
              >
                <FaAlignLeft /> Add Descriptive
              </button>
              <button
                className="btn-secondary"
                onClick={() => addQuestion("coding")}
              >
                <FaCode /> Add Coding Question
              </button>
            </div>

            <div className="flex-column-gap">
              {formData.questions.map((q, index) => (
                <div key={q.id} className="question-block">
                  <div className="flex-between-center mb-sm">
                    <span style={{ fontWeight: "bold" }}>
                      Q{index + 1}.{" "}
                      {q.type === "coding"
                        ? "Coding Challenge"
                        : q.type === "descriptive"
                          ? "Descriptive Question"
                          : "Multiple Choice"}
                    </span>
                    <div className="flex-center-gap">
                      <input
                        type="number"
                        placeholder="Marks"
                        className="input-sm"
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(
                            q.id,
                            "marks",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                      <button
                        className="btn-icon delete"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {q.type === "mcq" ? (
                    <div>
                      <input
                        className="question-text-input"
                        placeholder="Question Text"
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(q.id, "text", e.target.value)
                        }
                      />

                      <div className="grid-2">
                        {q.options.map((opt, i) => (
                          <input
                            key={i}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[i] = e.target.value;
                              updateQuestion(q.id, "options", newOpts);
                            }}
                            className="option-input"
                          />
                        ))}
                      </div>

                      <div className="mt-sm" style={{ marginTop: "10px" }}>
                        <label
                          style={{ fontSize: "0.9rem", marginRight: "10px" }}
                        >
                          Correct Answer:
                        </label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "correctAnswer",
                              e.target.value,
                            )
                          }
                          className="select-sm"
                        >
                          <option value="">Select Option</option>
                          {q.options.map((opt, i) => (
                            <option key={i} value={opt}>
                              Option {String.fromCharCode(65 + i)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : q.type === "descriptive" ? (
                    <div>
                      <textarea
                        className="question-text-input"
                        rows={3}
                        placeholder="Enter the descriptive question text here..."
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(q.id, "text", e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div className="coding-question-form">
                      <input
                        className="question-text-input mb-sm"
                        placeholder="Problem Title (e.g. Sum of Array)"
                        value={q.title}
                        onChange={(e) =>
                          updateQuestion(q.id, "title", e.target.value)
                        }
                      />
                      <textarea
                        className="question-text-input mb-sm"
                        rows={3}
                        placeholder="Problem Description / Instructions..."
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(q.id, "text", e.target.value)
                        }
                      />

                      <div className="mb-sm">
                        <label className="text-sm font-bold">Language</label>
                        <select
                          className="select-sm full-width mb-sm"
                          value={q.language || "javascript"}
                          onChange={(e) =>
                            updateQuestion(q.id, "language", e.target.value)
                          }
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>

                        <label className="text-sm font-bold">
                          Starter Code
                        </label>
                        <div
                          style={{
                            height: "200px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                          }}
                        >
                          <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language={q.language || "javascript"}
                            value={q.starterCode}
                            onChange={(value) =>
                              updateQuestion(q.id, "starterCode", value)
                            }
                            theme="light"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                            }}
                          />
                        </div>
                      </div>

                      <div className="test-cases-section mt-sm">
                        <div className="flex-between-center mb-sm">
                          <label className="text-sm font-bold">
                            Test Cases
                          </label>
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => {
                              const newTestCase = {
                                input: "",
                                expected_output: "", 
                                is_hidden: false, 
                              };
                              updateQuestion(q.id, "testCases", [
                                ...(q.testCases || []),
                                newTestCase,
                              ]);
                            }}
                          >
                            <FaPlus /> Add Case
                          </button>
                        </div>

                        {(q.testCases || []).map((tc, tcIdx) => (
                          <div
                            key={tcIdx}
                            className="test-case-row grid-3-auto mb-xs"
                            style={{ gap: "10px", alignItems: "center" }}
                          >
                            <input
                              placeholder="Input (e.g. [1,2])"
                              className="input-sm"
                              value={tc.input}
                              onChange={(e) => {
                                const newTCs = [...q.testCases];
                                newTCs[tcIdx].input = e.target.value;
                                updateQuestion(q.id, "testCases", newTCs);
                              }}
                            />
                            <input
                              placeholder="Expected Output (e.g. 3)"
                              className="input-sm"
                              value={tc.expected_output}
                              onChange={(e) => {
                                const newTCs = [...q.testCases];
                                newTCs[tcIdx].expected_output = e.target.value;
                                updateQuestion(q.id, "testCases", newTCs);
                              }}
                            />
                            <div className="flex-center-gap">
                              <select
                                className="select-sm"
                                value={tc.is_hidden}
                                onChange={(e) => {
                                  const newTCs = [...q.testCases];
                                  newTCs[tcIdx].is_hidden =
                                    e.target.value === "false";
                                  updateQuestion(q.id, "testCases", newTCs);
                                }}
                              >
                                <option value="true">Public</option>
                                <option value="false">Hidden</option>
                              </select>
                              <button
                                className="btn-icon delete"
                                onClick={() => {
                                  const newTCs = q.testCases.filter(
                                    (_, i) => i !== tcIdx,
                                  );
                                  updateQuestion(q.id, "testCases", newTCs);
                                }}
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions flex-between-center">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <FaArrowLeft /> Back
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Finish & Save <FaSave />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamBuilder;
