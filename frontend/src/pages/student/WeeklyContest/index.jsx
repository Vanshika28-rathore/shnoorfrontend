import React, { useEffect, useState } from "react";
import { Search, Filter, Calendar, Trophy, Clock, ArrowRight } from "lucide-react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const WeeklyContest = () => {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // helpers
  // -----------------------------

  // ✅ Use start_at (fallback to created_at)
  const getStartDate = (contest) => {
    return contest.start_at
      ? new Date(contest.start_at)
      : contest.created_at
      ? new Date(contest.created_at)
      : null;
  };

  const computeEndDate = (contest) => {
    const start = getStartDate(contest);
    if (!start) return null;

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
    const start = getStartDate(contest);
    const end = computeEndDate(contest);

    if (!start) return "active";

    if (now < start) return "upcoming";
    if (end && now > end) return "ended";

    return "active";
  };

  // -----------------------------
  // fetch
  // -----------------------------

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get("/api/contests/available");

        const enriched = res.data.map((c) => ({
          ...c,
          status: computeStatus(c),
          endDate: computeEndDate(c)
        }));

        setContests(enriched);
      } catch (err) {
        console.error("Failed to load contests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  // -----------------------------
  // filtering
  // -----------------------------

  const filteredContests = contests.filter((contest) => {
    const matchesTab = contest.status === activeTab;

    const matchesSearch =
      contest.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-emerald-50 text-emerald-600 border-emerald-100",
      upcoming: "bg-amber-50 text-amber-600 border-amber-100",
      ended: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return map[status] || "bg-slate-50 text-slate-400 border-slate-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Loading contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Trophy size={24} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Weekly Contests</h1>
              <p className="text-slate-400 text-sm mt-0.5">Compete with peers, showcase your skills, and win rewards.</p>
            </div>
          </div>

          <div className="flex bg-white/10 p-1 rounded-xl border border-white/20 backdrop-blur-sm">
            {["active", "upcoming", "ended"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-primary-900 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search contests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm font-medium placeholder:text-slate-300"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-medium transition-colors text-sm">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Grid */}
      {filteredContests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <div
              key={contest.exam_id}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              {/* Card Header */}
              <div className="h-28 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <Trophy className="text-indigo-400/30 w-12 h-12 group-hover:text-indigo-400/50 transition-colors" />
                <span className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded-lg font-bold uppercase border ${getStatusBadge(contest.status)}`}>
                  {contest.status}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-primary-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {contest.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {contest.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock size={12} />
                  {contest.duration} minutes
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-1"
                    onClick={() => navigate(`/student/contest/${contest.exam_id}`)}
                  >
                    Join <ArrowRight size={12} />
                  </button>
                  <button
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    onClick={() => navigate(`/student/contest/${contest.exam_id}/result`)}
                  >
                    Result
                  </button>
                  <button
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 transition-all"
                    onClick={() => navigate(`/student/contest/${contest.exam_id}/leaderboard`)}
                  >
                    🏆
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-primary-900 mb-1">
            No contests found
          </h3>
          <p className="text-slate-400 text-sm max-w-md text-center">
            There are no {activeTab} contests matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyContest;