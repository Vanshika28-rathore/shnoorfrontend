import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ManagerDashboardView from "./view";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "Manager",
    email: "",
    college: "",
    bio: "",
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourseEnrollments: 0,
    averageCourseProgress: 0,
    totalExamAttempts: 0,
    totalCertificates: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, studentsRes, courseProgressRes, examProgressRes, certificatesRes] =
          await Promise.allSettled([
            api.get("/api/users/me"),
            api.get("/api/manager/students"),
            api.get("/api/manager/course-progress"),
            api.get("/api/manager/exam-progress"),
            api.get("/api/manager/certificates"),
          ]);

        const profileData =
          profileRes.status === "fulfilled" && profileRes.value?.data ? profileRes.value.data : {};

        setProfile({
          fullName: profileData.displayName || profileData.full_name || "Manager",
          email: profileData.email || "",
          college: profileData.college || "",
          bio: profileData.bio || "",
        });

        const students =
          studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value?.data)
            ? studentsRes.value.data
            : [];

        const courseProgressRows =
          courseProgressRes.status === "fulfilled" && Array.isArray(courseProgressRes.value?.data)
            ? courseProgressRes.value.data
            : [];

        const examProgressRows =
          examProgressRes.status === "fulfilled" && Array.isArray(examProgressRes.value?.data)
            ? examProgressRes.value.data
            : [];

        const certificateRows =
          certificatesRes.status === "fulfilled" && Array.isArray(certificatesRes.value?.data)
            ? certificatesRes.value.data
            : [];

        const validCourseProgressValues = courseProgressRows
          .map((item) => Number(item.progress_percent))
          .filter((value) => Number.isFinite(value));

        const averageCourseProgress =
          validCourseProgressValues.length > 0
            ? Number(
                (
                  validCourseProgressValues.reduce((sum, value) => sum + value, 0) /
                  validCourseProgressValues.length
                ).toFixed(1),
              )
            : 0;

        setStats({
          totalStudents: students.length,
          totalCourseEnrollments: courseProgressRows.length,
          averageCourseProgress,
          totalExamAttempts: examProgressRows.filter((item) => item?.exam_id).length,
          totalCertificates: certificateRows.filter((item) => item?.certificate_id).length,
        });
      } catch (error) {
        console.error("Failed to fetch manager dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return <ManagerDashboardView loading={loading} profile={profile} stats={stats} />;
};

export default ManagerDashboard;
