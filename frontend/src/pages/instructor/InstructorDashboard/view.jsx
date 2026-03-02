import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  BookOpen,
  Star,
  Plus,
  Folder,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  Download,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DateRangeFilter from "../../../components/DateRangeFilter";
import Papa from "papaparse";

const InstructorDashboardView = ({
  loading,
  userName,
  stats,
  navigate,
  onSearch,
  searchResults = [],
  searchLoading = false,
  dateRange = null,
  setDateRange = () => {},
}) => {
  const performanceData = [];
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsSearchExpanded(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // — file1 loading spinner style —
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value.trim()), 400);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchExpanded(false);
    onSearch("");
  };

  const handleDownload = () => {
    const formattedData = {
      "Report Type": "Instructor Dashboard Report",
      "Generated": new Date().toLocaleString(),
      "Date Range": dateRange
        ? `${dateRange.startDate} to ${dateRange.endDate}`
        : "All Time",
      "": "",
      "Metric": "Value",
      "My Courses": stats.myCourses,
      "Total Students": stats.totalStudents,
      "Average Rating": stats.avgRating,
      "Courses Change (%)": stats.coursesChange,
      "Students Change (%)": stats.studentsChange,
    };
    const csv = Papa.unparse([formattedData]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `instructor-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/instructor/courses`);
    handleClearSearch();
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: "bg-green-100 text-green-700",
      Intermediate: "bg-yellow-100 text-yellow-700",
      Advanced: "bg-red-100 text-red-700",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // — file1 greeting logic —
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // — file1 sparkline —
  const sparkData = [[3, 5, 4, 7, 6, 8, 9], [2, 4, 3, 5, 7, 6, 8], [1, 2, 3, 4, 5, 6, 8]];
  const Sparkline = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 80, h = 28;
    const points = data
      .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
      .join(" ");
    return (
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 font-sans max-w-[1440px] mx-auto">

      {/* WELCOME BANNER — file1 */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">👋 {greeting}, {userName}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Instructor Portal</h1>
            <p className="text-slate-400 mt-1 text-sm">Overview of your course performance and student engagement.</p>
          </div>

          {/* Search — file1 glass style */}
          <div className="relative z-50 w-full sm:w-auto">
            <div className={`relative transition-all duration-300 ${isSearchExpanded ? "w-full sm:w-96" : "w-full sm:w-72"}`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm w-full text-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 focus:bg-white/15 transition-all placeholder:text-slate-400"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchExpanded(true)}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown — file2 content, file1 style */}
            {isSearchExpanded && searchQuery && (
              <div className="absolute top-full right-0 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-[60]">
                {searchLoading ? (
                  <div className="p-6 text-center text-slate-500 text-sm">Searching...</div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleCourseClick(result.id)}
                      >
                        <div className="flex items-start gap-3">
                          {result.thumbnail_url ? (
                            <img
                              src={result.thumbnail_url}
                              alt={result.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="text-indigo-600" size={20} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-slate-900 truncate">{result.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-bold ${result.type === "module" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                              >
                                {result.type === "module" ? "Module" : "Course"}
                              </span>
                            </div>
                            {result.instructor_name && (
                              <p className="text-xs text-indigo-600 font-medium mb-1">👤 {result.instructor_name}</p>
                            )}
                            {result.type === "module" && result.course_title && (
                              <p className="text-xs text-slate-500 font-medium mb-1">📚 In Course: {result.course_title}</p>
                            )}
                            <p className="text-xs text-slate-600 line-clamp-1">{result.description || "No description"}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {result.category && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">{result.category}</span>
                              )}
                              {result.difficulty && (
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>{result.difficulty}</span>
                              )}
                              {result.status && (
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(result.status)}`}>{result.status}</span>
                              )}
                            </div>
                            {result.validity_value && result.validity_unit && (
                              <p className="text-xs text-slate-500 mt-1">Valid for: {result.validity_value} {result.validity_unit}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">No courses or modules found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decorative blobs — file1 */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}></div>
        <div className="absolute -left-8 -bottom-20 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }}></div>
      </div>

      {isSearchExpanded && (
        <div className="fixed inset-0 z-40" onClick={() => setIsSearchExpanded(false)} />
      )}

      {/* KPI CARDS — file2 data, file1 dark card style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="My Courses"
          value={stats.myCourses}
          trend="Active"
          isPositive
          icon={<BookOpen size={20} />}
          color="#6366f1"
          spark={sparkData[0]}
        />
        <KpiCard
          title="Total Students"
          value={stats.totalStudents}
          trend={`${stats.studentsChange >= 0 ? "+" : ""}${stats.studentsChange}%`}
          isPositive={stats.studentsChange >= 0}
          icon={<Users size={20} />}
          color="#3b82f6"
          spark={sparkData[1]}
        />
        <KpiCard
          title="Average Rating"
          value={stats.avgRating}
          trend="4.8 Target"
          isPositive={stats.avgRating >= 4}
          icon={<Star size={20} />}
          color="#f59e0b"
          spark={sparkData[2]}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* ENGAGEMENT TRENDS — file1 card style */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[380px]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
              <div>
                <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Engagement Trends</h3>
                <p className="text-xs text-slate-400 mt-0.5">Student activity over time</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Students
              </div>
            </div>
            <div className="flex-1 p-5">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line dataKey="students" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                    <BarChart3 className="text-slate-300" size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No engagement data yet</p>
                  <p className="text-xs text-slate-300 mt-1">Data will appear as students interact with your courses.</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS — file1 grid style */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ActionButton
                icon={<Plus size={18} />}
                title="Create New Course"
                description="Start building content"
                onClick={() => navigate("/instructor/add-course")}
                color="indigo"
              />
              <ActionButton
                icon={<Folder size={18} />}
                title="Manage Courses"
                description="View and edit library"
                onClick={() => navigate("/instructor/courses")}
                color="amber"
              />
              <ActionButton
                icon={<MessageSquare size={18} />}
                title="Message Students"
                description="Broadcast announcements"
                onClick={() => navigate("/instructor/chat")}
                color="emerald"
              />
            </div>
          </div>
        </div>

        {/* DOWNLOAD ANALYTICS — file1 card style */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Reports</h3>
            <p className="text-xs text-slate-400 mt-0.5">Export performance data</p>
          </div>
          <div className="px-5 py-4 flex flex-col flex-1">
            <div className="rounded-lg border border-slate-200 p-4 mb-4">
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-primary-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-4 active:scale-[0.98]"
            >
              <Download size={14} /> Download Report
            </button>
            <div className="border-t border-slate-50 pt-3 mt-auto">
              <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Summary</h4>
              <div className="space-y-2">
                {[
                  { label: "Courses", value: stats.myCourses },
                  { label: "Students", value: stats.totalStudents },
                  { label: "Avg Rating", value: stats.avgRating },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                    <span className="text-xs font-bold text-primary-900 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM OVERVIEW — file1 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Activity size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-900">Teaching Overview</h3>
              <p className="text-xs text-slate-400">Your performance at a glance</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-lg font-extrabold text-primary-900">{stats.myCourses}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Courses</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-blue-600">{stats.totalStudents}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Students</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-amber-600">{stats.avgRating}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-emerald-600">{stats.studentsChange}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT PERFORMANCE MATRIX — file2 only */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-slate-50 gap-3">
          <div>
            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Student Performance Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Detailed per-student breakdown</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter students..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Student Name", "Course", "Progress", "Avg. Score", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="text-center py-14 text-slate-300 text-sm font-medium">
                  No student data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardView;

/* ---------- SUB COMPONENTS — file2 logic, file1 styling ---------- */

const KpiCard = ({ title, value, trend, isPositive, icon, color, spark }) => {
  const Sparkline = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 80, h = 28;
    const points = data
      .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
      .join(" ");
    return (
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
    );
  };

  return (
    <div className="bg-[#181F4D] rounded-2xl p-5 border border-white/10 shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/10">
          <span className="text-white">{icon}</span>
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
        >
          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-white tracking-tight tabular-nums">{value}</h3>
        </div>
        <div className="opacity-80">
          {spark && <Sparkline data={spark} color={color} />}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, title, description, onClick, color }) => {
  const colorMap = {
    indigo: { bg: "#6366f115", text: "#6366f1" },
    amber: { bg: "#f59e0b15", text: "#f59e0b" },
    emerald: { bg: "#10b98115", text: "#10b981" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group w-full"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0"
        style={{ background: c.bg }}
      >
        <span style={{ color: c.text }}>{icon}</span>
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-700 group-hover:text-primary-900 transition-colors">{title}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
    </button>
  );
};