import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const AddDescriptiveContestQuestion = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [keywordsText, setKeywordsText] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ list of already added questions
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadQuestions = async () => {
    try {
      const res = await api.get(`/api/contests/${contestId}/questions`);
      setSavedQuestions(res.data || []);
    } catch (err) {
      console.error("Failed to load saved questions", err);
    } finally {
      setLoadingList(false);
    }
  };

  React.useEffect(() => {
    loadQuestions();
  }, [contestId]);

  const handleSave = async () => {
    if (!questionText.trim()) {
      alert("Please enter question");
      return;
    }

    // convert comma separated text → array
    const keywords = keywordsText
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      await api.post(
        `/api/contests/${contestId}/questions/descriptive`,
        {
          questionText,
          marks,
          keywords
        }
      );

      alert("Descriptive question added");

      // clear form for next question
      setQuestionText("");
      setMarks(1);
      setKeywordsText("");
      loadQuestions();

    } catch (err) {
      console.error(err);
      alert("Failed to add descriptive question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Add Descriptive Question
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="text-blue-600"
        >
          Back
        </button>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <label className="font-medium text-slate-700">Question</label>
        <textarea
          className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      {/* Marks */}
      <div className="space-y-2">
        <label className="font-medium text-slate-700">Marks</label>
        <input
          type="number"
          min="1"
          className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
        />
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label className="font-medium text-slate-700">
          Keywords (comma separated)
        </label>
        <input
          type="text"
          className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="ai, ml, data"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Used later for auto evaluation.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white rounded"
        >
          {saving ? "Saving..." : "Save Question"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 border rounded"
        >
          Done
        </button>
      </div>

      <div className="pt-6 border-t space-y-3">
        <h2 className="font-semibold">
          Questions added in this contest
        </h2>

        {loadingList ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : savedQuestions.length === 0 ? (
          <p className="text-slate-500 text-sm">No questions added yet.</p>
        ) : (
          <ul className="space-y-2">
            {savedQuestions.map((q, i) => (
              <li key={q.question_id} className="border rounded p-3 text-sm">
                <div className="font-medium">
                  {i + 1}. {q.question_type.toUpperCase()}: {q.question_text}{" "}
                  <span className="text-indigo-600 font-bold">
                    ({q.marks || 0} Marks)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default AddDescriptiveContestQuestion;
