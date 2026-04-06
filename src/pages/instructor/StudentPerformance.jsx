import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaEnvelope,
} from "react-icons/fa";
import { auth } from "../../auth/firebase";
import api from "../../api/axios";
import "../../styles/Dashboard.css";

const StudentPerformance = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredStudents = students.filter((student) => {
    const studentName = student.student_name || "";
    const courseTitle = student.course_title || "";

    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  {
    /*const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "Good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "At Risk":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };*/
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = await auth.currentUser.getIdToken(true);

        const res = await api.get("/api/assignments/instructor/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch enrolled students", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-6">
      <div className="flex-between-center mb-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Student Performance
            </h2>
            <p className="text-gray-500">
              Track progress and identify students who need help.
            </p>
          </div>
        </div>
      </div>

      <div className="grid-3 mb-xl">
        <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div className="flex-between-center">
            <div>
              <span className="stat-label">Total Students</span>
              <div className="stat-number">{students.length}</div>
            </div>
            <div className="icon-circle indigo">
              <FaChartLine size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
          <div className="flex-between-center">
            <div>
              <span className="stat-label">At Risk</span>
              <div className="stat-number text-red-600">
                {students.filter((s) => s.status === "At Risk").length}
              </div>
            </div>
            <div
              className="icon-circle"
              style={{ background: "#fee2e2", color: "#ef4444" }}
            >
              <FaExclamationTriangle size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="flex-between-center">
            <div>
              <span className="stat-label">High Performers</span>
              <div className="stat-number text-green-600">
                {students.filter((s) => s.status === "Excellent").length}
              </div>
            </div>
            <div className="icon-circle green">
              <FaCheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="form-box full-width">
        <div className="flex-between-center mb-lg">
          <h3 className="section-title mb-0">Enrolled Students</h3>
          <div className="search-bar-styled mb-0" style={{ width: "300px" }}>
            <div className="input-icon-wrapper">
              <FaSearch />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container shadow-none border-0">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Avg. Quiz Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={index}>
                    <td>
                      <div className="font-semibold text-gray-800">
                        {student.student_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {student.student_id.slice(0, 8)}
                      </div>
                    </td>

                    <td>{student.course_title}</td>

                    {/* STATIC VALUES FOR NOW */}
                    <td>
                      <div
                        className="w-full bg-gray-200 rounded-full h-2.5"
                        style={{ width: "120px" }}
                      >
                        <div
                          className="h-2.5 rounded-full bg-blue-600"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        60% Completed
                      </div>
                    </td>

                    <td>
                      <span className="font-bold text-gray-700">80%</span>
                    </td>

                    <td>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800">
                        GOOD
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-action-sm"
                        onClick={() => navigate("/instructor/chat")}
                      >
                        <FaEnvelope /> Message
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No enrolled students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
