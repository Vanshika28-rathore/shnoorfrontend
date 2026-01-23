import { useEffect, useState } from "react";
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
  });
  const [error, setError] = useState("");

  /* =========================
     FETCH DASHBOARD STATS
  ========================= */
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        throw new Error("Not authenticated");
      }

      const token = await auth.currentUser.getIdToken();

      const res = await api.get("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
     NAVIGATION HANDLERS
  ========================= */
  const goToAddInstructor = () => navigate("/admin/add-instructor");
  const goToApproveCourses = () => navigate("/admin/approve-courses");
  const goToAssignCourse = () => navigate("/admin/assign-course");

  return (
    <AdminDashboardView
      loading={loading}
      error={error}
      stats={stats}
      goToAddInstructor={goToAddInstructor}
      goToApproveCourses={goToApproveCourses}
      goToAssignCourse={goToAssignCourse}
    />
  );
};

export default AdminDashboard;
