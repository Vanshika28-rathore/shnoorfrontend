import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

const ContestLeaderboard = () => {
  const { contestId } = useParams();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await api.get(
          `/api/contests/${contestId}/leaderboard`
        );

        setRows(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [contestId]);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <div className="space-y-6">

      <h2 className="text-xl font-bold">
        Leaderboard
      </h2>

      <div className="bg-white border rounded">

        <table className="w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Marks</th>
              <th className="p-3 text-left">Submitted At</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500">
                  No submissions yet
                </td>
              </tr>
            )}

            {rows.map((r, index) => (
              <tr key={r.student_id} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{r.student_name}</td>
                <td className="p-3">{r.total_marks}</td>
                <td className="p-3">
                  {r.submitted_at
                    ? new Date(r.submitted_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default ContestLeaderboard;