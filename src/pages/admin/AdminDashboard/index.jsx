/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AdminDashboardView from "./view";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingCourses: 0,
    totalInstructors: 0,
    certificates: 0,
  });
  const [liveSessionCount, setLiveSessionCount] = useState(0);
  const [error, setError] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Date range state
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [activeFilter, setActiveFilter] = useState(null);

  /* =========================
     FETCH LIVE SESSIONS (REAL-TIME) - From Backend API
  ========================= */
  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const fetchActiveSessions = async () => {
      try {
        const res = await api.get("/api/proctoring/active");
        if (isMounted) {
          setLiveSessionCount((res.data || []).length);
          console.log("[DASHBOARD] Active sessions:", (res.data || []).length);
        }
      } catch (err) {
        console.error("[DASHBOARD] Failed to fetch active sessions:", err);
        // Continue with existing count on error
      }
    };

    // Initial fetch
    fetchActiveSessions();
    // Poll every 8 seconds to stay in sync with proctoring page
    pollTimer = setInterval(fetchActiveSessions, 8000);

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  /* =========================
     FETCH DASHBOARD STATS
  ========================= */
  useEffect(() => {
    fetchStats();
  }, []);

  // Re-fetch when date range changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchStats(dateRange.startDate, dateRange.endDate);
    } else if (!dateRange.startDate && !dateRange.endDate) {
      fetchStats();
    }
  }, [dateRange]);

  const fetchStats = async (startDate, endDate) => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        throw new Error("Not authenticated");
      }

      const token = await auth.currentUser.getIdToken();

      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await api.get("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DATE RANGE HANDLERS
  ========================= */
  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    setActiveFilter(null); // Clear quick filter when manual date is set
  };

  const handleQuickFilter = (filter) => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    if (filter === null) {
      // Reset to all-time
      setDateRange({ startDate: '', endDate: '' });
      setActiveFilter(null);
      return;
    }

    if (filter === 'Today') {
      startDate = endDate;
    } else if (filter === 'This Week') {
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay());
      startDate = firstDay.toISOString().split('T')[0];
    } else if (filter === 'This Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = firstDay.toISOString().split('T')[0];
    }

    setActiveFilter(filter);
    setDateRange({ startDate, endDate });
  };

  /* =========================
     DOWNLOAD REPORT
  ========================= */
  const handleDownloadReport = () => {
    const displayStats = stats?.filteredStats || stats;
    const rows = [
      ['Metric', 'Value'],
      ['Students', displayStats?.totalStudents ?? 0],
      ['Instructors', displayStats?.totalInstructors ?? 0],
      ['Pending Courses', displayStats?.pendingCourses ?? 0],
      ['Certificates', displayStats?.certificates ?? 0],
    ];

    if (dateRange.startDate && dateRange.endDate) {
      rows.push(['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`]);
    } else {
      rows.push(['Date Range', 'All Time']);
    }

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  /* =========================
     SEARCH
  ========================= */
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    try {
      if (!auth.currentUser) {
        throw new Error("Not authenticated");
      }

      const token = await auth.currentUser.getIdToken();

      const res = await api.get("/api/admin/search-courses", {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(res.data || []);

    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = useCallback((query) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    // Set new timer for debounced search (300ms delay)
    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  /* =========================
     NAVIGATION HANDLERS
  ========================= */
  const goToAddInstructor = () => navigate("/admin/add-instructor");
  const goToAddManager = () => navigate("/admin/add-manager");
  const goToApproveCourses = () => navigate("/admin/approve-courses");
  const goToAssignCourse = () => navigate("/admin/assign-course");

  const showingAllTime = !dateRange.startDate && !dateRange.endDate;

  return (
    <AdminDashboardView
      loading={loading}
      error={error}
      stats={stats}
      chartData={stats?.chartData || []}
      recentActivity={stats?.recentActivity || []}
      onSearch={handleSearch}
      searchResults={searchResults}
      searchLoading={searchLoading}
      dateRange={dateRange}
      activeFilter={activeFilter}
      onDateChange={handleDateChange}
      onQuickFilter={handleQuickFilter}
      onDownloadReport={handleDownloadReport}
      showingAllTime={showingAllTime}
      goToAddInstructor={goToAddInstructor}
      goToAddManager={goToAddManager}
      goToApproveCourses={goToApproveCourses}
      goToAssignCourse={goToAssignCourse}
      goToProctoring={() => navigate("/admin/proctoring")}
      liveSessionCount={liveSessionCount}
    />
  );
};

export default AdminDashboard;