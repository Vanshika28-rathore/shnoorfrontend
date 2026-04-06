import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import StudentDashboardView from "./view";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrolledcount, setEnrolledCount] = useState(0);
  const [lastCourse, setLastCourse] = useState(null);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [deadlines, setDeadlines] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [paidCourses, setPaidCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Get initial view from URL params or default to 'overview'
  const [activeView, setActiveView] = useState(
    searchParams.get("view") || "overview",
  );

  const [gamification, setGamification] = useState({
    xp: 0,
    rank: "Novice",
    streak: 0,
    progress: 0,
    nextLevelXP: 100,
  });

  // Sync activeView with URL parameters
  useEffect(() => {
    const view = searchParams.get("view") || "overview";
    setActiveView(view);
  }, [searchParams]);

  // Update URL when activeView changes
  const handleViewChange = (view) => {
    setSearchParams({ view });
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/student/dashboard");

        setEnrolledCount(res.data.enrolled_count);

        setGamification({
          xp: res.data.xp,
          streak: res.data.streak,
          rank:
            res.data.xp >= 500
              ? "Expert"
              : res.data.xp >= 200
                ? "Intermediate"
                : "Novice",
          progress: Math.min((res.data.xp / 500) * 100, 100),
          nextLevelXP: 500,
        });

        setLastCourse(res.data.last_learning || null);
        setRecentActivity(res.data.recent_activity || []);
        setDeadlines(res.data.deadlines || []);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch course buckets for dashboard sections
  useEffect(() => {
    const fetchCourseBuckets = async () => {
      try {
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken(true);

        const [exploreRes, recRes] = await Promise.all([
          api.get("/api/courses/explore", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/student/recommendations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const exploreCourses = exploreRes.data || [];
        setFreeCourses(exploreCourses.filter((c) => c.price_type === "free"));
        setPaidCourses(exploreCourses.filter((c) => c.price_type === "paid"));
        setRecommendedCourses(recRes.data || []);
      } catch (err) {
        console.error("Course bucket fetch failed:", err);
      }
    };

    fetchCourseBuckets();
  }, []);



  // Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/me");
        setStudentName(res.data.name);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };

    fetchProfile();
  }, []);

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

      const res = await api.get("/api/student/search-courses", {
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
  return (
    <StudentDashboardView
      navigate={navigate}
      enrolledCount={enrolledcount}
      lastCourse={lastCourse}
      assignmentsCount={assignmentsCount}
      studentName={studentName}
      gamification={gamification}
      recentActivity={recentActivity}
      deadlines={deadlines}
      activeView={activeView}
      onViewChange={handleViewChange}
      onSearch={handleSearch}
      searchResults={searchResults}
      searchLoading={searchLoading}
      freeCourses={freeCourses}
      paidCourses={paidCourses}
      recommendedCourses={recommendedCourses}
    />
  );
};

export default StudentDashboard;