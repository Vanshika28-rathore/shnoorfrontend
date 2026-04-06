import React, { useEffect, useState } from "react";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import { Timer, Clock, RefreshCw, ShieldCheck } from "lucide-react";

const AdminExamTimer = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timerInputs, setTimerInputs] = useState({});
  const [updating, setUpdating] = useState({});
  const [successMap, setSuccessMap] = useState({});

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await auth.currentUser.getIdToken(true);
      const res = await api.get("/api/exams/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExams(res.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const updateTimer = async (examId, newTime) => {
    if (!newTime || newTime <= 0) {
      alert("Please enter a valid timer value");
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [examId]: true }));

      const token = await auth.currentUser.getIdToken(true);
      await api.put(
        `/api/exams/admin/${examId}/grace-timer`,
        { disconnect_grace_time: Number(newTime) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMap((prev) => ({ ...prev, [examId]: true }));
      setTimeout(() => setSuccessMap((prev) => ({ ...prev, [examId]: false })), 2500);
      setTimerInputs((prev) => ({ ...prev, [examId]: "" }));
      fetchExams();
    } catch (err) {
      console.error("Error updating timer:", err);
      alert(err.response?.data?.message || "Failed to update timer");
    } finally {
      setUpdating((prev) => ({ ...prev, [examId]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Loading exam timers...</p>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      {/* GRADIENT HEADER */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ShieldCheck size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Disconnect Grace Timers
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Set per-exam grace periods for student disconnections.
              </p>
            </div>
          </div>
          <button
            onClick={fetchExams}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
        ></div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
            <Timer className="text-slate-300" size={28} />
          </div>
          <h3 className="text-lg font-bold text-primary-900 mb-2">No Exams Found</h3>
          <p className="text-sm text-slate-400">No exams are currently available to configure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.exam_id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-50">
                <h3 className="text-sm font-bold text-primary-900 line-clamp-2">{exam.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                {/* Duration */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Clock className="text-indigo-500" size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Duration</p>
                    <p className="text-sm font-bold text-primary-900">{exam.duration} mins</p>
                  </div>
                </div>

                {/* Current Grace Timer */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Timer className="text-amber-500" size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                      Current Grace Timer
                    </p>
                    <p className="text-sm font-bold text-primary-900">
                      {exam.disconnect_grace_time} seconds
                    </p>
                  </div>
                </div>

                {/* Update Input */}
                <div className="pt-1 flex gap-2">
                  <input
                    type="number"
                    placeholder="New timer (secs)"
                    value={timerInputs[exam.exam_id] || ""}
                    onChange={(e) =>
                      setTimerInputs((prev) => ({ ...prev, [exam.exam_id]: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                  />
                  <button
                    onClick={() => updateTimer(exam.exam_id, timerInputs[exam.exam_id])}
                    disabled={updating[exam.exam_id]}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {updating[exam.exam_id] ? "..." : "Update"}
                  </button>
                </div>

                {/* Success Message */}
                {successMap[exam.exam_id] && (
                  <p className="text-xs text-emerald-500 font-semibold">
                    ✓ Timer updated successfully
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminExamTimer;