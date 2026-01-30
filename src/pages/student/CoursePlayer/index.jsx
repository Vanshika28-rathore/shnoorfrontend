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
      setCurrentModule(courseRes.data.modules?.[0] || null);
      setCompletedModuleIds(courseRes.data.completedModules || []);
      setRecommendedCourses(recRes.data || []);
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
    if (!currentModule) return;

    try {
      await api.post(`/api/student/courses/${courseId}/progress`, {
        moduleId: currentModule.id,
      });

      setCompletedModuleIds((prev) =>
        prev.includes(currentModule.id)
          ? prev
          : [...prev, currentModule.id]
      );

      // XP update (syncs with dashboard)
      setXp((prev) => prev + 50);
    } catch (error) {
      console.error("Failed to update progress:", error);
      alert("Failed to mark module as complete");
    }
  };

  const isModuleCompleted = (id) => completedModuleIds.includes(id);

  const progressPercentage =
    course?.modules?.length > 0
      ? Math.round(
          (completedModuleIds.length / course.modules.length) * 100
        )
      : 0;

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
    />
  );
};

export default CoursePlayer;