import { useEffect, useState } from "react";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AssignCourseView from "./view";

const AssignCourse = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // NEW


  /* =========================
     FETCH STUDENTS + COURSES
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) throw new Error("Not authenticated");

        await auth.currentUser.getIdToken(); // token validated via axios interceptor

        const [studentsRes, coursesRes] = await Promise.all([
          api.get("/api/admin/students"),
          api.get("/api/admin/courses?status=approved"),
        ]);

        setStudents(studentsRes.data || []);
        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        console.error("AssignCourse fetch error:", err);
        setError("Failed to load students or courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     TOGGLE SELECTION
  ========================= */
  const toggleStudent = (userId) => {
    setSelectedStudents((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  /* =========================
     ASSIGN COURSES
  ========================= */
  const handleAssign = async () => {
    if (selectedStudents.length === 0 || selectedCourses.length === 0) {
      throw new Error("Select at least one student and one course");
    }

    try {
      await auth.currentUser.getIdToken();

      await api.post("/api/admin/assign-courses", {
        studentIds: selectedStudents,
        courseIds: selectedCourses,
      });

      setSelectedStudents([]);
      setSelectedCourses([]);
      setShowSuccessPopup(true); // NEW
    } catch (err) {
      console.error("Assign course error:", err);
      throw err;
    }
  };

  /* =========================
     FILTERED STUDENTS
  ========================= */
  const filteredStudents = students.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <AssignCourseView
      loading={loading}
      error={error}
      students={filteredStudents}
      courses={courses}
      selectedStudents={selectedStudents}
      selectedCourses={selectedCourses}
      searchStudent={searchStudent}
      setSearchStudent={setSearchStudent}
      toggleStudent={toggleStudent}
      toggleCourse={toggleCourse}
      handleAssign={handleAssign}
      showSuccessPopup={showSuccessPopup}
      setShowSuccessPopup={setShowSuccessPopup}
    />
  );
};

export default AssignCourse;
