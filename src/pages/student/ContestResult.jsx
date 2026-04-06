import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

const ContestResult = () => {

  const { contestId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(
          `/api/contests/${contestId}/my-result`
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert("Result not available yet");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [contestId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">

      <h1 className="text-xl font-bold">
        Contest Result
      </h1>

      <div className="bg-white p-4 rounded border">
        <p><b>Total Marks:</b> {data.totalMarks}</p>
        <p><b>Obtained Marks:</b> {data.obtainedMarks}</p>
      </div>

      <div className="space-y-3">
        {data.questions.map((q, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded border"
          >
            <p className="font-medium">
              {q.question_text}
            </p>

            <p className="text-sm">
              Type: {q.question_type}
            </p>

            <p className="text-sm">
              Marks: {q.marks_obtained} / {q.max_marks}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ContestResult;