import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import CourseDetailView from "./view";

const getCourseCacheKey = (courseId) => `student-course-detail-${courseId}`;

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourseAndStatus = useCallback(async ({ withLoader = false } = {}) => {
    if (withLoader) {
      setLoading(true);
    }

    try {
      if (!auth.currentUser) return;

      const token = await auth.currentUser.getIdToken(true);
      const cacheKey = getCourseCacheKey(courseId);

      const [statusRes, publicCourseRes] = await Promise.all([
        api.get(`/api/student/${courseId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const enrolled = statusRes.data.enrolled;
      const publicCourseData = publicCourseRes.data;
      setIsEnrolled(enrolled);
      setCourse((prev) => prev || publicCourseData);

      let courseData = publicCourseData;
      if (enrolled) {
        try {
          const courseRes = await api.get(`/api/student/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          courseData = courseRes.data;
        } catch (err) {
          console.warn("Detailed progress fetch failed, falling back to public course data:", err);
        }
      }

      setCourse(courseData);
      sessionStorage.setItem(cacheKey, JSON.stringify(courseData));
    } catch (err) {
      console.error("Error loading course:", err);
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  }, [courseId]);

  // Fetch course + enrollment status
  useEffect(() => {
    try {
      const cachedCourse = sessionStorage.getItem(getCourseCacheKey(courseId));
      if (cachedCourse) {
        setCourse(JSON.parse(cachedCourse));
      }
    } catch (error) {
      console.warn("Failed to read cached course detail:", error);
    }

    fetchCourseAndStatus({ withLoader: true });
  }, [fetchCourseAndStatus]);

  // Keep per-module time spent fresh for enrolled learners
  useEffect(() => {
    if (!isEnrolled) return;

    const intervalId = setInterval(() => {
      fetchCourseAndStatus();
    }, 30000);

    const handleFocus = () => fetchCourseAndStatus();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCourseAndStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isEnrolled, fetchCourseAndStatus]);

  // Enroll handler
  const handleEnroll = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      await api.post(
        `/api/student/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsEnrolled(true);
      await fetchCourseAndStatus();
      alert("Successfully enrolled!");
    } catch (err) {
      console.error("Enroll failed:", err);
      alert(err?.response?.data?.message || "Failed to enroll");
    }
  };

  // Continue learning handler
  const handleContinue = () => {
    navigate(`/student/course/${courseId}/learn`);
  };

  return (
    <CourseDetailView
      course={course}
      loading={loading}
      isEnrolled={isEnrolled}
      navigate={navigate}
      handleEnroll={handleEnroll}
      handleContinue={handleContinue}
      courseId={courseId}
    />
  );
};

export default CourseDetail;
