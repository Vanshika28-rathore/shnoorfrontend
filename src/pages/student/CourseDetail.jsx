import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaCheckCircle,
  FaUserTie,
  FaClock,
  FaCalendarAlt,
  FaStar,
  FaGlobe,
  FaCertificate,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { auth } from "../../auth/firebase";
import api from "../../api/axios";
import "../../styles/Dashboard.css";
import "../../styles/Student.css";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        if (!auth.currentUser) return;

        const token = await auth.currentUser.getIdToken(true);

        const [courseRes, statusRes] = await Promise.all([
          // ✅ course details
          api.get(`/api/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),

          // ✅ enrollment status
          api.get(`/api/student-courses/${courseId}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourse(courseRes.data);
        setIsEnrolled(statusRes.data.enrolled);
      } catch (err) {
        console.error("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndStatus();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      // ✅ backend enrollment
      await api.post(
        `/api/student-courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsEnrolled(true);
      alert("Successfully enrolled! 🚀");
    } catch (err) {
      console.error("Enroll failed:", err);
      alert("Failed to enroll");
    }
  };

  const handleContinue = () => {
    navigate(`/student/course/${courseId}/learn`);
  };

  if (loading) return <div className="p-8">Loading course details...</div>;
  if (!course) return <div className="p-8">Course not found.</div>;

  return (
    <div className="course-detail-page">
      <button
        onClick={() => navigate("/student/courses")}
        className="btn-text"
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FaArrowLeft /> Back to Courses
      </button>

      <div className="course-hero">
        <div className="course-hero-content">
          <span className="badge badge-primary">
            {course.category || "General"}
          </span>
          <h1 className="course-hero-title">{course.title}</h1>
          <p className="course-hero-desc">
            {course.description || "No description available."}
          </p>

          <div className="course-meta-row">
            <div className="meta-item">
              <FaGlobe /> {course.level || "All Levels"}
            </div>
            <div className="meta-item">
              <FaStar className="text-yellow-400" /> {course.rating || "4.5"}{" "}
              (120 reviews)
            </div>
            <div className="meta-item">
              <FaCalendarAlt /> Last updated {course.updatedAt || "Recently"}
            </div>
          </div>

          <div className="course-instructor-preview">
            <div className="instructor-avatar-placeholder">
              <FaUserTie />
            </div>
            <div>
              <div className="text-sm text-gray-300">Created by</div>
              <div className="font-semibold">{course.instructor?.name}</div>
            </div>
          </div>
        </div>

        <div className="course-action-card">
          <div className="card-video-preview">
            <FaPlay className="play-icon" />
          </div>
          <div className="card-body">
            <div className="price-tag">Free</div>

            {isEnrolled ? (
              <button className="btn-primary w-100" onClick={handleContinue}>
                Continue Learning
              </button>
            ) : (
              <button className="btn-primary w-100" onClick={handleEnroll}>
                Enroll Now
              </button>
            )}

            <p className="guarantee-text">Full Lifetime Access</p>

            <div className="course-features-list">
              <div className="feature-item">
                <FaClock /> {course.modules?.length * 15 || 60} mins on-demand
                video
              </div>
              <div className="feature-item">
                <FaCheckCircle /> Access on mobile and TV
              </div>
              <div className="feature-item">
                <FaCertificate /> Certificate of completion
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content-container">
        <div className="content-section">
          <h3 className="section-title">What you'll learn</h3>
          <div className="learning-outcomes">
            <div className="outcome-item">
              <FaCheck /> Master the core concepts of {course.title}
            </div>
            <div className="outcome-item">
              <FaCheck /> Build real-world projects
            </div>
            <div className="outcome-item">
              <FaCheck /> Understand industry best practices
            </div>
            <div className="outcome-item">
              <FaCheck /> Become job-ready
            </div>
          </div>
        </div>

        <div className="content-section">
          <h3 className="section-title">Course Content</h3>
          <div className="modules-list-static">
            {course.modules?.map((module, idx) => (
              <div key={idx} className="static-module-item">
                <div className="static-module-icon">
                  {module.type === "video" ? (
                    <FaPlay size={12} />
                  ) : (
                    <FaCheckCircle size={12} />
                  )}
                </div>
                <div className="static-module-info">
                  <div className="module-name">{module.title}</div>
                  <div className="module-meta">
                    {module.type} • {module.duration}
                  </div>
                </div>
                {isEnrolled && idx === 0 && (
                  <span className="badge badge-success">Started</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h3 className="section-title">Instructor</h3>
          <div className="instructor-full-card">
            <div className="instructor-header">
              <div className="instructor-avatar-large">
                <FaUserTie size={30} />
              </div>
              <div>
                <h4 className="instructor-name">{course.instructor?.name}</h4>
                <p className="instructor-title">Senior Instructor</p>
              </div>
            </div>
            <p className="instructor-bio">{course.instructor?.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
