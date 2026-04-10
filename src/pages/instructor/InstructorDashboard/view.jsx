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
  Activity,
} from "lucide-react";
import DateRangeFilter from "../../../components/DateRangeFilter";
import Papa from "papaparse";

const InstructorDashboardView = ({
  loading,
  userName,
  stats,
  studentRows = [],
  navigate,
  onSearch,
  searchResults = [],
  searchLoading = false,
  dateRange = null,
  setDateRange = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [sortBy, setSortBy] = useState("progress");
  const debounceRef = useRef(null);
  const matrixRef = useRef(null);

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

  const sparkData = [[3, 5, 4, 7, 6, 8, 9], [2, 4, 3, 5, 7, 6, 8], [1, 2, 3, 4, 5, 6, 8]];

  const normalizedRows = Array.isArray(studentRows) ? studentRows : [];
  const studentSummary = normalizedRows.reduce(
    (acc, row) => {
      const status = String(row.status || "").toLowerCase();
      const progress = Math.max(0, Math.min(100, Number(row.progress || 0)));

      acc.progressTotal += progress;

      if (status === "completed") acc.completed += 1;
      else if (status === "in progress") acc.inProgress += 1;
      else acc.notStarted += 1;

      return acc;
    },
    { completed: 0, inProgress: 0, notStarted: 0, progressTotal: 0 }
  );
  const averageProgress = normalizedRows.length
    ? Math.round(studentSummary.progressTotal / normalizedRows.length)
    : 0;
  const needsAttentionRows = normalizedRows
    .filter((row) => {
      const progress = Number(row.progress || 0);
      const avgScore = Number(row.avg_score || 0);
      return progress < 30 || avgScore < 40;
    })
    .slice(0, 5);
  const activeCourses = Object.entries(
    normalizedRows.reduce((acc, row) => {
      const title = row.course_title || "Untitled Course";
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const topPerformer = normalizedRows.reduce((best, row) => {
    const score = Number(row.avg_score || 0);
    if (!best || score > best.score) {
      return { name: row.student_name || "N/A", score };
    }
    return best;
  }, null);

  const filteredStudentRows = normalizedRows
    .filter((row) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(row.student_name || "").toLowerCase().includes(q) ||
        String(row.course_title || "").toLowerCase().includes(q) ||
        String(row.status || "").toLowerCase().includes(q);

      const status = String(row.status || "Not Started");
      const matchesStatus = statusFilter === "All" ? true : status === statusFilter;

      const progress = Number(row.progress || 0);
      const avgScore = Number(row.avg_score || 0);
      const isAttention = progress < 30 || avgScore < 40;
      const matchesAttention = attentionOnly ? isAttention : true;

      return matchesSearch && matchesStatus && matchesAttention;
    })
    .sort((a, b) => {
      if (sortBy === "score") return Number(b.avg_score || 0) - Number(a.avg_score || 0);
      if (sortBy === "name") return String(a.student_name || "").localeCompare(String(b.student_name || ""));
      return Number(b.progress || 0) - Number(a.progress || 0);
    });

  const applyAttentionFocus = () => {
    setStatusFilter("All");
    setAttentionOnly(true);
    setSortBy("progress");
    setSearchTerm("");
    matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetMatrixFilters = () => {
    setStatusFilter("All");
    setAttentionOnly(false);
    setSortBy("progress");
    setSearchTerm("");
  };

  const handleDownloadStudentMatrix = () => {
    const csvRows = filteredStudentRows.map((row) => ({
      Student: row.student_name || "",
      Course: row.course_title || "",
      Progress: `${Math.round(Number(row.progress || 0))}%`,
      "Avg Score": `${Number(row.avg_score || 0).toFixed(1)}%`,
      Status: row.status || "Not Started",
    }));

    if (!csvRows.length) return;

    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-matrix-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans max-w-[1440px] mx-auto p-4 md:p-0">

      {/* WELCOME BANNER */}
      <div
        className="relative rounded-2xl p-5 md:p-6 lg:p-8 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
      >
        {/* Decorative glows - behind content */}
        <div className="absolute right-0 top-0 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px] rounded-full -z-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}></div>
        <div className="absolute -left-10 md:-left-20 -bottom-10 md:-bottom-20 w-[150px] md:w-[200px] lg:w-[300px] h-[150px] md:h-[200px] lg:h-[300px] rounded-full -z-10" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)' }}></div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative z-10">
            <p className="text-indigo-300 text-sm font-medium mb-1">👋 {greeting}, {userName}</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">Instructor Portal</h1>
            <p className="text-slate-400 mt-1 text-sm">Overview of your course performance and student engagement.</p>
          </div>

          {/* Search */}
          <div className="relative z-10 w-full sm:w-auto">
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
              <div
                className="absolute top-full right-0 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto overscroll-contain z-[60]"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                style={{ touchAction: "pan-y" }}
              >
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

          {/* STUDENT INSIGHTS */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[380px]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
              <div>
                <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Student Insights</h3>
                <p className="text-xs text-slate-400 mt-0.5">Live status and attention indicators</p>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Avg Progress <span className="text-indigo-600">{averageProgress}%</span>
              </div>
            </div>
            <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Status Split</h4>
                <div className="space-y-2">
                  {[
                    { label: "Completed", value: studentSummary.completed, className: "bg-emerald-50 text-emerald-700" },
                    { label: "In Progress", value: studentSummary.inProgress, className: "bg-blue-50 text-blue-700" },
                    { label: "Not Started", value: studentSummary.notStarted, className: "bg-slate-100 text-slate-700" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">{item.label}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.className}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Needs Attention</h4>
                {needsAttentionRows.length > 0 ? (
                  <div className="space-y-2">
                    {needsAttentionRows.map((row) => (
                      <div
                        key={`attention-${row.student_id}-${row.course_id}`}
                        className="flex items-center justify-between bg-rose-50/60 border border-rose-100 rounded-lg px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{row.student_name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{row.course_title}</p>
                        </div>
                        <p className="text-[11px] font-bold text-rose-600">{Math.round(Number(row.progress || 0))}%</p>
                      </div>
                    ))}
                    <button
                      onClick={applyAttentionFocus}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
                    >
                      Open Matrix With Attention Filter
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No students currently flagged.</p>
                )}
              </div>

              <div className="md:col-span-2 rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Most Active Courses</h4>
                {activeCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCourses.map(([courseTitle, learners]) => (
                      <div key={courseTitle} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-sm text-slate-700 truncate">{courseTitle}</p>
                        <span className="text-xs font-bold text-indigo-600">{learners} learners</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Active courses will appear once students enroll.</p>
                )}
              </div>
              <div className="md:col-span-2 rounded-xl border border-slate-100 p-4 bg-slate-50/60">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Performer</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {topPerformer ? `${topPerformer.name} (${topPerformer.score.toFixed(1)}%)` : "No data yet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">At-Risk Learners</p>
                    <p className="text-sm font-semibold text-rose-600">{needsAttentionRows.length}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={handleDownloadStudentMatrix}
                      disabled={!filteredStudentRows.length}
                      className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      Export Filtered Matrix
                    </button>
                  </div>
                </div>
              </div>
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
      <div ref={matrixRef} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
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
        <div className="px-6 py-3 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Completed", "In Progress", "Not Started"].map((item) => {
              const count =
                item === "All"
                  ? normalizedRows.length
                  : normalizedRows.filter((row) => String(row.status || "Not Started") === item).length;
              const active = statusFilter === item;
              return (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item} ({count})
                </button>
              );
            })}
            <button
              onClick={() => setAttentionOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                attentionOnly ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
            >
              Needs Attention Only
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="progress">Progress</option>
              <option value="score">Score</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={resetMatrixFilters}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <span className="text-xs font-semibold text-slate-500">Showing {filteredStudentRows.length}</span>
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
              {filteredStudentRows.length > 0 ? (
                filteredStudentRows.map((row) => {
                  const progress = Math.max(0, Math.min(100, Number(row.progress || 0)));
                  const avgScore = Number(row.avg_score || 0);
                  const status = row.status || "Not Started";
                  const statusClass =
                    status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700";

                  return (
                    <tr key={`${row.student_id}-${row.course_id}`} className="border-b border-slate-100 last:border-0">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.student_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.course_title}</td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{progress}%</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{avgScore.toFixed(1)}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate("/instructor/courses")}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-300 text-sm font-medium">
                    No student data available
                  </td>
                </tr>
              )}
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