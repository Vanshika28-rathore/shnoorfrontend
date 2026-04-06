import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import CoursePlayerView from "./view";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { setXp } = useOutletContext();

  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [completedModuleIds, setCompletedModuleIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const [moduleTimes, setModuleTimes] = useState({}); // { moduleId: seconds }
  const [markingComplete, setMarkingComplete] = useState(false);

  // Fetch course + progress
  useEffect(() => {
    const fetchCourseAndRecommendations = async () => {
      try {
        if (!auth.currentUser) return;

        setLoading(true);

        const token = await auth.currentUser.getIdToken(true);

        const [courseRes, recRes] = await Promise.all([
          api.get(`/api/student/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/student/recommendations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourse(courseRes.data);

        // Debug logging for video URLs
        console.log('[CoursePlayer] Course data received:', courseRes.data);
        if (courseRes.data.modules) {
          courseRes.data.modules.forEach((m, idx) => {
            console.log(`[Module ${idx}] Type: ${m.type}, URL: ${m.url}, Title: ${m.title}`);
          });
        }

        setCurrentModule(courseRes.data.modules?.[0] || null);
        setCompletedModuleIds(courseRes.data.completedModules || []);

        // Initialize module times
        const times = {};
        courseRes.data.modules?.forEach(m => {
          times[m.id] = m.time_spent_seconds || 0;
        });
        setModuleTimes(times);

        setRecommendedCourses(recRes.data || []);
        setAuthToken(token);
      } catch (err) {
        console.error("Error loading course or recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndRecommendations();
  }, [courseId]);

  // Mark module complete
  const handleMarkComplete = async () => {
    if (!currentModule || markingComplete) return;

    try {
      setMarkingComplete(true);
      const res = await api.post(`/api/student/courses/${courseId}/progress`, {
        moduleId: currentModule.id,
      });

      setCompletedModuleIds((prev) =>
        prev.includes(currentModule.id)
          ? prev
          : [...prev, currentModule.id]
      );

      // XP update (syncs with dashboard)
      const xpEarned = Number(res?.data?.xpEarned || 0);
      if (xpEarned > 0) {
        setXp((prev) => prev + xpEarned);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      // Intentionally no alert/modal: completion should stay silent.
    } finally {
      setMarkingComplete(false);
    }
  };

  const isModuleCompleted = (id) => completedModuleIds.includes(id);

  const progressPercentage =
    course?.modules?.length > 0
      ? Math.round(
        (completedModuleIds.length / course.modules.length) * 100
      )
      : 0;

  // --- TIME TRACKING LOGIC ---
  // 1. Visually tick every second in the UI
  useEffect(() => {
    if (!currentModule?.id || loading) return;
    const moduleId = currentModule.id;

    const uiInterval = setInterval(() => {
      setModuleTimes((prev) => ({
        ...prev,
        [moduleId]: (prev[moduleId] || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(uiInterval);
  }, [currentModule?.id, loading]);

  // 2. Report to backend every 10 seconds
  useEffect(() => {
    if (!currentModule?.id || loading || !authToken) return;

    let lastReportTime = Date.now();
    const moduleId = currentModule.id;

    console.log(`[TimeTracking] Started backend tracking for module: ${moduleId}`);

    const syncInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastReportTime) / 1000);

      if (elapsed > 0) {
        reportTime(moduleId, elapsed);
        lastReportTime = Date.now();
      }
    }, 10000);

    return () => {
      clearInterval(syncInterval);
      const elapsed = Math.floor((Date.now() - lastReportTime) / 1000);
      if (elapsed > 0) {
        reportTime(moduleId, elapsed);
      }
    };
  }, [currentModule?.id, loading, authToken]);

  const reportTime = async (moduleId, seconds) => {
    try {
      if (!authToken) return;
      await api.post(`/api/modules/${moduleId}/time`, { seconds }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`[TimeTracking] Reported ${seconds}s for module ${moduleId}`);
    } catch (err) {
      console.error("Failed to report module time:", err);
    }
  };

  const handleSyncVideoProgress = async (moduleId, lastPositionSeconds) => {
    try {
      if (!authToken) return;

      // Update local state so switching modules doesn't reset resume point
      setCourse(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map(m =>
            m.id === moduleId ? { ...m, last_position_seconds: lastPositionSeconds } : m
          )
        };
      });

      // ALSO update currentModule if it's the one being synced
      setCurrentModule(prev => {
        if (prev?.id === moduleId) {
          return { ...prev, last_position_seconds: lastPositionSeconds };
        }
        return prev;
      });

      await api.put(`/api/student/courses/${courseId}/modules/${moduleId}/progress`, {
        lastPositionSeconds,
        timeSpentSeconds: 0
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`[VideoSync] Synced position ${lastPositionSeconds}s for module ${moduleId}`);
    } catch (err) {
      console.error("Failed to sync video progress:", err);
    }
  };

  return (
    <CoursePlayerView
      course={course}
      currentModule={currentModule}
      setCurrentModule={setCurrentModule}
      completedModuleIds={completedModuleIds}
      loading={loading}
      progressPercentage={progressPercentage}
      isModuleCompleted={isModuleCompleted}
      handleMarkComplete={handleMarkComplete}
      recommendedCourses={recommendedCourses}
      navigate={navigate}
      courseId={courseId}
      authToken={authToken}
      moduleTimes={moduleTimes}
      onSyncVideoProgress={handleSyncVideoProgress}
      markingComplete={markingComplete}
    />
  );
};

export default CoursePlayer;