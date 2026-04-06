import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const AddCodingContestQuestion = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("python");
  const [starterCode, setStarterCode] = useState("");
  const [marks, setMarks] = useState(1);

  const [testCases, setTestCases] = useState([
    { input: "", expected_output: "", is_hidden: false }
  ]);

  const [saving, setSaving] = useState(false);

  const addTestCase = () => {
    setTestCases((p) => [
      ...p,
      { input: "", expected_output: "", is_hidden: false }
    ]);
  };

  const updateTC = (index, field, value) => {
    const copy = [...testCases];
    copy[index][field] = value;
    setTestCases(copy);
  };

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
    if (!title.trim()) {
      alert("Title required");
      return;
    }

    try {
      setSaving(true);

      await api.post(
        `/api/contests/${contestId}/questions/coding`,
        {
          title,
          description,
          language,
          starterCode,
          marks,
          testCases
        }
      );

      alert("Coding question added");
      setTitle("");
      setDescription("");
      setStarterCode("");
      setMarks(1);
      setTestCases([{ input: "", expected_output: "", is_hidden: false }]);
      loadQuestions();

    } catch (err) {
      console.error(err);
      alert("Failed to add coding question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl p-6 space-y-5">

      <div className="flex justify-between items-center text-slate-800">
        <h2 className="text-xl font-semibold">Add Coding Question</h2>

        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-medium text-sm text-slate-700">Title</label>
          <input
            className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sum of two numbers"
          />
        </div>

        <div>
          <label className="font-medium text-sm text-slate-700">Description</label>
          <textarea
            rows={4}
            className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter problem description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-sm text-slate-700">Language</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-sm text-slate-700">Marks</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="font-medium text-sm text-slate-700">Starter Code</label>
          <textarea
            rows={6}
            className="w-full border rounded-lg p-2 font-mono text-sm bg-slate-50 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            placeholder="# Write your starter code here..."
          />
        </div>

        <div className="space-y-3">
          <label className="font-medium text-sm text-slate-700">Test Cases</label>
          <div className="space-y-4">
            {testCases.map((tc, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <input
                  className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) => updateTC(i, "input", e.target.value)}
                />
                <input
                  className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  placeholder="Expected output"
                  value={tc.expected_output}
                  onChange={(e) => updateTC(i, "expected_output", e.target.value)}
                />
                <label className="flex gap-2 items-center text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-indigo-600"
                    checked={tc.is_hidden}
                    onChange={(e) => updateTC(i, "is_hidden", e.target.checked)}
                  />
                  Hidden test case
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTestCase}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            + Add test case
          </button>
        </div>

        <div className="pt-4 flex gap-3 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Coding Question"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="pt-10 border-t space-y-4">
        <h2 className="font-bold text-lg text-primary-900 flex items-center gap-2">
          Existing Questions
        </h2>

        {loadingList ? (
          <p className="text-slate-500 text-sm italic">Loading...</p>
        ) : savedQuestions.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">No questions added yet to this contest.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {savedQuestions.map((q, i) => (
              <div key={q.question_id} className="border border-slate-200 bg-white rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                    {q.question_type}
                  </span>
                  <div className="font-semibold text-slate-800">
                    {i + 1}. {q.question_text}
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                  {q.marks || 0} Marks
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AddCodingContestQuestion;
