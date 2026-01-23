import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ApproveCoursesView from "./view";

const ApproveCourses = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      const res = await api.get("/api/admin/courses/pending");
      setPendingCourses(res.data.courses);
    } catch (err) {
      console.error("Failed to load pending courses", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courses_id) => {
    try {
      const res = await api.get(`/api/courses/${course.courses_id}/modules`);
      setModules(res.data);
    } catch (err) {
      console.error("Failed to load modules", err);
      setModules([]);
    }
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    await fetchModules(course.courses_id);
  };

  const closeDetails = () => {
    setSelectedCourse(null);
    setModules([]);
  };

  const updateStatus = async (status) => {
    if (!selectedCourse) return;
    if (!window.confirm(`Are you sure you want to ${status}?`)) return;

    try {
      await api.patch(
        `/api/admin/courses/${selectedCourse.courses_id}/status`,
        { status }
      );

      setPendingCourses((prev) =>
        prev.filter((c) => c.courses_id !== selectedCourse.courses_id)
      );
      closeDetails();
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update course status");
    }
  };

  return (
    <ApproveCoursesView
      loading={loading}
      pendingCourses={pendingCourses}
      selectedCourse={selectedCourse}
      setSelectedCourse={setSelectedCourse}
      modules={modules}
      selectCourse={selectCourse}
      closeDetails={closeDetails}
      handleAction={updateStatus}
    />
  );
};

export default ApproveCourses;
