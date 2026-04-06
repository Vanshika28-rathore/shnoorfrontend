import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const AddContestQuestion = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);

  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ]);

  const [saving, setSaving] = useState(false);

  // ✅ list of already added questions
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // -----------------------------
  // Load already added questions
  // -----------------------------
  const loadQuestions = async () => {
    try {
      const res = await api.get(
        `/api/contests/${contestId}/questions`
      );
      setSavedQuestions(res.data || []);
    } catch (err) {
      console.error("Failed to load saved questions", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [contestId]);

  // -----------------------------
  // option helpers
  // -----------------------------
  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  };

  const updateOptionText = (index, value) => {
    const copy = [...options];
    copy[index].text = value;
    setOptions(copy);
  };

  const markCorrect = (index) => {
    const copy = options.map((o, i) => ({
      ...o,
      isCorrect: i === index
    }));
    setOptions(copy);
  };

  // -----------------------------
  // save
  // -----------------------------
  const handleSave = async () => {
    if (!questionText.trim()) {
      alert("Please enter question");
      return;
    }

    if (options.some(o => !o.text.trim())) {
      alert("Please fill all options");
      return;
    }

    const correctCount = options.filter(o => o.isCorrect).length;

    if (correctCount !== 1) {
      alert("Select exactly one correct option");
      return;
    }

    try {
      setSaving(true);

      await api.post(
        `/api/contests/${contestId}/questions`,
        {
          questionText,
          marks,
          options
        }
      );

      // ✅ clear form so next question can be added
      setQuestionText("");
      setMarks(1);
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]);

      // ✅ refresh list
      loadQuestions();

    } catch (err) {
      console.error(err);
      alert("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 space-y-8">

      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Add Contest Question
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="text-blue-600"
        >
          Back
        </button>
      </div>

      {/* form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-medium text-slate-700">Question Text</label>
          <textarea
            className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text..."
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium text-slate-700">Marks</label>
          <input
            type="number"
            min="1"
            className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">Points awarded for correct answer.</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="font-medium">
          Options (select correct one)
        </label>

        {options.map((opt, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
          >
            <input
              type="radio"
              name="correct"
              checked={opt.isCorrect}
              onChange={() => markCorrect(index)}
            />

            <input
              type="text"
              className="flex-1 border rounded p-2"
              placeholder={`Option ${index + 1}`}
              value={opt.text}
              onChange={(e) =>
                updateOptionText(index, e.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="text-green-600 text-sm"
        >
          + Add option
        </button>
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

      {/* -----------------------------
          Already added questions
         ----------------------------- */}

      <div className="pt-6 border-t space-y-3">
        <h2 className="font-semibold">
          Questions added in this contest
        </h2>

        {loadingList ? (
          <p className="text-slate-500 text-sm">
            Loading...
          </p>
        ) : savedQuestions.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No questions added yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {savedQuestions.map((q, i) => (
              <li
                key={q.question_id}
                className="border rounded p-3 text-sm"
              >
                <div className="font-medium">
                  {i + 1}. {q.question_text}{" "}
                  <span className="text-indigo-600 font-bold">
                    ({q.marks || 0} Marks)
                  </span>
                </div>

                <ul className="list-disc ml-5 text-slate-600 mt-1">
                  {q.options?.map((o) => (
                    <li key={o.option_id}>
                      {o.option_text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default AddContestQuestion;