/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import StudentCoursesView from "./view";
import { useSocket } from "@context/useSocket";

const StudentCourses = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState("my-learning");
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingCourses, setUpcomingCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [learningPaths, setLearningPaths] = useState([]);
  const [allLearningPaths, setAllLearningPaths] = useState([]);

  const getCourseId = (course) => course?.courses_id ?? course?.id;

  const mergedCourses = [
    ...myCourses,
    ...allCourses.filter(
      (course) => !myCourses.some((mine) => getCourseId(mine) === getCourseId(course)),
    ),
  ];

  // 🔑 derive enrolledIds for the VIEW
  const enrolledIds = myCourses.map((c) => c.courses_id || c.id);

  // Filter upcoming courses (scheduled for future)
  useEffect(() => {
    const now = new Date();
    const upcoming = allCourses.filter((course) => {
      if (!course.schedule_start_at) return false;
      return new Date(course.schedule_start_at) > now;
    });
    setUpcomingCourses(upcoming);
  }, [allCourses]);

  const refreshCourses = useCallback(async (silent = false) => {
    try {
      if (!auth.currentUser) {
        if (!silent) setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      const token = await auth.currentUser.getIdToken(true);

      const [myRes, exploreRes, recRes] = await Promise.all([
        api.get("/api/student/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/courses/explore", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/student/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const nextMyCourses = Array.isArray(myRes.data)
        ? myRes.data
        : Array.isArray(myRes.data?.courses)
          ? myRes.data.courses
          : [];

      const nextAllCourses = Array.isArray(exploreRes.data)
        ? exploreRes.data
        : Array.isArray(exploreRes.data?.courses)
          ? exploreRes.data.courses
          : [];

      const nextRecommendedCourses = Array.isArray(recRes.data)
        ? recRes.data
        : Array.isArray(recRes.data?.courses)
          ? recRes.data.courses
          : [];

      setMyCourses(nextMyCourses);
      setAllCourses(nextAllCourses);
      setRecommendedCourses(nextRecommendedCourses);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshCourses(false);
  }, [refreshCourses]);

  // Re-fetch once auth state is ready (handles page reload timing)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        refreshCourses(false);
      } else {
        setMyCourses([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [refreshCourses]);

  // Real-time refresh via socket events
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeRefresh = () => {
      refreshCourses(true);
    };

    socket.on("dashboard_update", handleRealtimeRefresh);
    socket.on("new_notification", handleRealtimeRefresh);
    socket.on("connect", handleRealtimeRefresh);

    return () => {
      socket.off("dashboard_update", handleRealtimeRefresh);
      socket.off("new_notification", handleRealtimeRefresh);
      socket.off("connect", handleRealtimeRefresh);
    };
  }, [socket, refreshCourses]);

  // Polling fallback
  useEffect(() => {
    const timer = setInterval(() => {
      refreshCourses(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [refreshCourses]);

  // Refresh when user returns to tab/window
  useEffect(() => {
    const onFocus = () => refreshCourses(true);
    const onVisible = () => {
      if (!document.hidden) refreshCourses(true);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshCourses]);

  // Search courses when search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const token = await auth.currentUser.getIdToken(true);
        const res = await api.get("/api/student/search-courses", {
          params: { query: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data || []);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [searchTerm]);

  // Search learning paths when search term changes (debounced)
  useEffect(() => {
    const searchLP = async () => {
      if (!searchTerm.trim() || !auth.currentUser) {
        setLearningPaths([]);
        return;
      }
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await api.get(`/api/learning-paths/search?q=${encodeURIComponent(searchTerm.trim())}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLearningPaths(res.data || []);
      } catch (err) {
        console.error("Learning path search error:", err);
        setLearningPaths([]);
      }
    };
    const timer = setTimeout(searchLP, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all learning paths when tab is switched to "learning-paths"
  useEffect(() => {
    const fetchAllLP = async () => {
      if (activeTab !== "learning-paths" || !auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await api.get("/api/learning-paths/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllLearningPaths(res.data || []);
      } catch (err) {
        console.error("Fetch all learning paths error:", err);
      }
    };
    fetchAllLP();
  }, [activeTab]);

  const getDisplayCourses = () => {
    switch (activeTab) {
      case "my-learning":
        return myCourses.filter((course) => course.is_enrolled && !course.is_completed);

      case "explore":
        return allCourses.filter(
          (course) => course.is_assigned && !course.is_enrolled,
        );

      case "free-courses":
        return mergedCourses.filter((course) => course.price_type === "free");

      case "paid-courses":
        return mergedCourses.filter((course) => course.price_type === "paid");

      case "recommended":
        return recommendedCourses;

      case "upcoming":
        return upcomingCourses;

      case "learning-paths":
        return allCourses;

      default:
        return allCourses;
    }
  };

  // Pick active list
  const displayCourses = getDisplayCourses();

  // Apply filters
  const filteredCourses = displayCourses.filter((course) => {
    const normalizedTitle = (course?.title || course?.name || "").toLowerCase();
    const matchesSearch = normalizedTitle.includes(searchTerm.toLowerCase());

    const applyCatalogFilters = activeTab !== "my-learning";

    const matchesCategory =
      !applyCatalogFilters ||
      selectedCategory === "All" ||
      course.category === selectedCategory;

    const matchesLevel =
      !applyCatalogFilters ||
      selectedLevel === "All" ||
      course.difficulty === selectedLevel;

    const matchesPrice =
      !applyCatalogFilters || (isFreeOnly ? course.price_type === "free" : true);

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  // Enroll handler
  const handleEnroll = async (courseId) => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      const res = await api.post(
        `/api/student/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ FREE course → enrolled
      if (res.data?.success) {
        await refreshCourses(true);
        setActiveTab("my-learning");
      }
    } catch (err) {
      // ✅ PAID course → redirect
      if (
        err.response?.status === 402 &&
        err.response?.data?.redirectToPayment
      ) {
        window.location.href = "https://stripe.com/in";
        return;
      }

      console.error("Enroll failed:", err);
      alert(err.response?.data?.message || "Failed to enroll.");
    }
  };

  // Categories for filter dropdown
  const categories = [
    ...new Set(allCourses.map((c) => c.category).filter(Boolean)),
  ];

  return (
    <StudentCoursesView
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      displayCourses={filteredCourses}
      enrolledIds={enrolledIds}
      categories={categories}
      handleEnroll={handleEnroll}
      navigate={navigate}
      isFreeOnly={isFreeOnly}
      setIsFreeOnly={setIsFreeOnly}
      searchResults={searchResults}
      searchLoading={searchLoading}
      learningPaths={learningPaths}
      allLearningPaths={allLearningPaths}
    />
  );
};

export default StudentCourses;