import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaUserGraduate,
  FaStar,
  FaPlus,
  FaFolderOpen,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import api from "../../api/axios";
import "../../styles/Dashboard.css";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    avgRating: 4.8,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Instructor");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const token = await auth.currentUser.getIdToken(true);

        const [courseRes, studentRes] = await Promise.all([
          api.get("/api/courses/instructor/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/assignments/instructor/students/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          myCourses: Number(courseRes.data.total_courses),
          totalStudents: Number(studentRes.data.total_students),
          avgRating: 4.8, // keep static
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) fetchDashboardStats();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <div className="flex-between-center mb-xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hello, {userName}! 👋
          </h2>
          <p className="text-gray-500">
            Here's what's happening with your courses today.
          </p>
        </div>
        <div
          className="text-sm px-3 py-1 rounded-full border font-medium"
          style={{
            background: "#DBEAFE",
            color: "#003B5C",
            borderColor: "#BFDBFE",
          }}
        >
          Instructor Portal
        </div>
      </div>

      <div className="grid-3">
        <div className="stat-card" style={{ borderLeft: "4px solid #E8AA25" }}>
          <div className="flex-between-center">
            <div>
              <span className="stat-label">My Courses</span>
              <div className="stat-number">{stats.myCourses}</div>
            </div>
            <div
              className="stat-icon"
              style={{ background: "#FEF3C7", color: "#C58A12" }}
            >
              <FaBookOpen size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #003B5C" }}>
          <div className="flex-between-center">
            <div>
              <span className="stat-label">Students Enrolled</span>
              <div className="stat-number">{stats.totalStudents}</div>
            </div>
            <div
              className="stat-icon"
              style={{ background: "#DBEAFE", color: "#003B5C" }}
            >
              <FaUserGraduate size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #E8AA25" }}>
          <div className="flex-between-center">
            <div>
              <span className="stat-label">Avg. Rating</span>
              <div className="stat-number">
                {stats.avgRating}{" "}
                <span className="text-sm font-normal text-gray-400">/ 5</span>
              </div>
            </div>
            <div
              className="stat-icon"
              style={{ background: "#FEF3C7", color: "#C58A12" }}
            >
              <FaStar size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        <div className="form-box full-width">
          <div className="flex-between-center mb-md">
            <h3 className="section-title mb-0">
              Student Performance Analytics
            </h3>
            <button
              className="btn-secondary"
              style={{ fontSize: "0.85rem", padding: "5px 12px" }}
              onClick={() => navigate("/instructor/performance")}
            >
              View Report <FaArrowRight size={12} />
            </button>
          </div>
          <div className="analytics-chart">
            {[
              { label: "React Basics", value: 85 },
              { label: "Adv. Node.js", value: 65 },
              { label: "UI/UX Design", value: 92 },
              { label: "Python Intro", value: 78 },
            ].map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-value">{item.value}%</div>
                <div
                  className="chart-bar"
                  style={{
                    height: `${item.value}%`,
                    background: item.value > 80 ? "#E8AA25" : "#003B5C",
                  }}
                ></div>
                <div className="chart-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="section-title mb-md">Quick Actions</h3>
      <div className="grid-3">
        <button
          className="quick-action-card"
          onClick={() => navigate("/instructor/add-course")}
          style={{
            padding: "20px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            textAlign: "left",
            cursor: "pointer",
            transition: "transform 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div
            style={{
              background: "#eff6ff",
              padding: "12px",
              borderRadius: "50%",
              color: "#3b82f6",
            }}
          >
            <FaPlus />
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>
              Create New Course
            </div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Start building content
            </div>
          </div>
        </button>

        <button
          className="quick-action-card"
          onClick={() => navigate("/instructor/courses")}
          style={{
            padding: "20px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            textAlign: "left",
            cursor: "pointer",
            transition: "transform 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div
            style={{
              background: "#fef3c7",
              padding: "12px",
              borderRadius: "50%",
              color: "#d97706",
            }}
          >
            <FaFolderOpen />
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>
              Manage Courses
            </div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              View/Edit your library
            </div>
          </div>
        </button>

        <button
          className="quick-action-card"
          onClick={() => navigate("/instructor/chat")}
          style={{
            padding: "20px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            textAlign: "left",
            cursor: "pointer",
            transition: "transform 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div
            style={{
              background: "#d1fae5",
              padding: "12px",
              borderRadius: "50%",
              color: "#059669",
            }}
          >
            <FaEnvelope />
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>
              Message Students
            </div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Broadcast announcements
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default InstructorDashboard;
