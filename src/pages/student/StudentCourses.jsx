import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookReader, FaSearch, FaBookOpen, FaGlobe } from "react-icons/fa";
import { auth } from "../../auth/firebase";
import api from "../../api/axios";
import "../../styles/Dashboard.css";
import "../../styles/Student.css";
import "../../styles/StudentGrid.css";

const StudentCourses = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my-learning");
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.currentUser) return;

      try {
        setLoading(true);
        const token = await auth.currentUser.getIdToken(true);

        // ✅ My Learning (enrolled courses)
        const myRes = await api.get("/api/student/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Explore (NOT enrolled courses)
        const exploreRes = await api.get("/api/courses/explore", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyCourses(myRes.data || []);
        setAllCourses(exploreRes.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const displayCourses = activeTab === "my-learning" ? myCourses : allCourses;

  const filteredCourses = displayCourses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = async (courseId) => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      // ✅ Backend enrollment
      await api.post(
        `/api/student/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // ✅ Refresh both lists
      const [myRes, exploreRes] = await Promise.all([
        api.get("/api/student-courses/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/courses/explore", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMyCourses(myRes.data || []);
      setAllCourses(exploreRes.data || []);

      setActiveTab("my-learning");
    } catch (err) {
      console.error("Enroll failed:", err);
      alert("Failed to enroll.");
    }
  };

  if (loading) {
    return <div className="p-8">Loading your courses...</div>;
  }

  return (
    <div>
      <div className="student-page-header">
        <div>
          <h3>
            {activeTab === "my-learning" ? "My Learning" : "Course Catalog"}
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === "my-learning"
              ? "Continue your progress."
              : "Find your next skill."}
          </p>
        </div>
        <div className="search-bar-container" style={{ display: "none" }}></div>
      </div>

      <div className="courses-filter-bar">
        <div className="filter-search-container">
          <FaSearch className="filter-search-icon" />
          <input
            className="filter-search-input"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {[...new Set(allCourses.map((c) => c.category).filter(Boolean))].map(
            (cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ),
          )}
        </select>

        <select
          className="filter-select"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div
        className="tabs-container"
        style={{
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
        }}
      >
        <button
          className={`tab-btn ${activeTab === "my-learning" ? "active" : ""}`}
          onClick={() => setActiveTab("my-learning")}
          style={{
            padding: "10px 15px",
            color:
              activeTab === "my-learning" ? "var(--color-primary)" : "#6b7280",
            fontWeight: 600,
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "my-learning"
                ? "2px solid var(--color-primary)"
                : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          My Learning
        </button>
        <button
          className={`tab-btn ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => setActiveTab("explore")}
          style={{
            padding: "10px 15px",
            color: activeTab === "explore" ? "var(--color-primary)" : "#6b7280",
            fontWeight: 600,
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "explore"
                ? "2px solid var(--color-primary)"
                : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Explore
        </button>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state-card">
          {activeTab === "my-learning" ? (
            <>
              <FaBookOpen
                className="empty-state-icon"
                style={{
                  fontSize: "4rem",
                  color: "#e2e8f0",
                  marginBottom: "1.5rem",
                  display: "block",
                  margin: "0 auto 1.5rem auto",
                }}
              />
              <h3 className="empty-state-title">No Enrolled Courses</h3>
              <p className="empty-state-text">
                You haven't enrolled in any courses yet.
              </p>
              <button
                className="btn-primary mt-sm"
                onClick={() => setActiveTab("explore")}
              >
                <FaGlobe style={{ marginRight: "8px" }} /> Browse Courses
              </button>
            </>
          ) : (
            <>
              <FaSearch
                className="empty-state-icon"
                style={{
                  fontSize: "4rem",
                  color: "#e2e8f0",
                  marginBottom: "1.5rem",
                  display: "block",
                  margin: "0 auto 1.5rem auto",
                }}
              />
              <h3 className="empty-state-title">No Courses Found</h3>
              <p className="empty-state-text">
                Try adjusting your search terms.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="student-course-grid">
          {filteredCourses.map((courses, index) => {
            const isEnrolled = activeTab === "my-learning";
            return (
              <div key={courses.courses_id} className="student-course-card">
                <div
                  className={`course-thumbnail course-thumbnail-gradient-${index % 4}`}
                  style={{
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaBookReader
                    style={{
                      fontSize: "3.5rem",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  />
                </div>

                <div className="course-details" style={{ padding: "15px" }}>
                  <span
                    className="category-badge"
                    style={{ fontSize: "0.7rem", marginBottom: "5px" }}
                  >
                    {courses.category}
                  </span>
                  <h4
                    className="course-title"
                    style={{ fontSize: "1rem", marginBottom: "5px" }}
                  >
                    {courses.title}
                  </h4>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "15px",
                    }}
                  >
                    By {courses.instructorName || "Instructor"}
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    {isEnrolled ? (
                      <button
                        className="btn-primary w-100"
                        onClick={() =>
                          navigate(`/student/course/${courses.courses_id}`)
                        }
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className="btn-secondary w-100"
                        onClick={() => handleEnroll(courses.courses_id)}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
