
import React, { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Trophy,
  Trash2,
  Edit2,
  FileText,
  Code
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const ContestList = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active");
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const computeEndDate = (contest) => {
    if (!contest.created_at) return null;

    const start = new Date(contest.created_at);
    const value = Number(contest.validity_value || 0);
    const unit = contest.validity_unit;

    const end = new Date(start);

    if (unit === "day") end.setDate(end.getDate() + value);
    else if (unit === "week") end.setDate(end.getDate() + value * 7);
    else if (unit === "month") end.setMonth(end.getMonth() + value);
    else if (unit === "hour") end.setHours(end.getHours() + value);

    return end;
  };

  const computeStatus = (contest) => {
    const now = new Date();

    const start = contest.created_at
      ? new Date(contest.created_at)
      : null;

    const end = computeEndDate(contest);

    if (!start || !end) return "active";
    if (now < start) return "scheduled";
    if (now > end) return "ended";

    return "active";
  };

  const fetchMyContests = async () => {
    try {
      const res = await api.get("/api/contests/mine");

      const data = res.data.map((c) => ({
        ...c,
        status: computeStatus(c)
      }));

      setContests(data);
    } catch (err) {
      console.error("Failed to load instructor contests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContests();
  }, []);

  const handleDelete = async (examId) => {
    const ok = window.confirm("Are you sure you want to delete this contest?");
    if (!ok) return;

    try {
      await api.delete(`/api/contests/${examId}`);
      setContests((prev) =>
        prev.filter((c) => c.exam_id !== examId)
      );
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete contest");
    }
  };

  const filtered = contests.filter(
    (c) => c.status === activeTab
  );

  if (loading) {
    return <div className="text-slate-500 p-4">Loading contests...</div>;
  }

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6 p-4 md:p-0">

      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Trophy size={24} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Manage Contests</h1>
              <p className="text-slate-400 text-sm mt-0.5">Create and oversee weekly coding challenges.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("create")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all active:scale-95 text-sm font-bold whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-4 md:p-0 md:rounded-none">
        <div className="flex gap-6 overflow-x-auto">
          {["active", "scheduled", "ended"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab} Contests
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 md:px-6 py-4">Contest Title</th>
                  <th className="px-4 md:px-6 py-4">Created</th>
                  <th className="px-4 md:px-6 py-4">Participants</th>
                  <th className="px-4 md:px-6 py-4">Validity</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((contest) => (
                  <tr
                    key={contest.exam_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary-900">
                        {contest.title}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${contest.status === "active"
                              ? "bg-green-500"
                              : contest.status === "ended"
                                ? "bg-slate-400"
                                : "bg-blue-500"
                            }`}
                        />
                        {contest.status}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {new Date(contest.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-slate-400" />
                        <span>{contest.participants_count || 0}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {contest.validity_value} {contest.validity_unit}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        {/* MCQ */}
                        <button
                          onClick={() =>
                            navigate(
                              `/instructor/contests/${contest.exam_id}/questions/add`
                            )
                          }
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add MCQ Question"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {/* Descriptive */}
                        <button
                          onClick={() =>
                            navigate(
                              `/instructor/contests/${contest.exam_id}/questions/descriptive/add`
                            )
                          }
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Add Descriptive Question"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Coding */}
                        <button
                          onClick={() =>
                            navigate(
                              `/instructor/contests/${contest.exam_id}/questions/coding/add`
                            )
                          }
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Add Coding Question"
                        >
                          <Code className="w-4 h-4" />
                        </button>

                        {/* Edit contest */}
                        <button
                          onClick={() =>
                            navigate(
                              `edit/${contest.exam_id}`,
                              { state: { contest } }
                            )
                          }
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit contest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete contest */}
                        <button
                          onClick={() => handleDelete(contest.exam_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete contest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-medium">
              No {activeTab} contests found
            </p>
            <p className="text-sm">
              Get started by creating a new contest.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestList;