import { useEffect, useState } from "react";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import AssignCourseView from "./view";

const AssignCourse = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchGroup, setSearchGroup] = useState("");
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

        const [groupsRes, studentsRes, coursesRes] = await Promise.all([
          api.get("/api/admin/groups"),
          api.get("/api/admin/students"),
          api.get("/api/admin/courses?status=approved"),
        ]);
        setGroups(
          Array.isArray(groupsRes.data)
            ? groupsRes.data
            : groupsRes.data.groups || groupsRes.data.data || [],
        );

        setStudents(
          Array.isArray(studentsRes.data)
            ? studentsRes.data
            : studentsRes.data.students || studentsRes.data.data || [],
        );

        setCourses(
          Array.isArray(coursesRes.data)
            ? coursesRes.data
            : coursesRes.data.courses || coursesRes.data.data || [],
        );
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
  const toggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };
  const toggleStudent = (userId) => {
    setSelectedStudents((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  /* =========================
     ASSIGN COURSES
  ========================= */
  const handleAssign = async () => {
    if (
      selectedCourses.length === 0 ||
      (selectedGroups.length === 0 && selectedStudents.length === 0)
    ) {
      setError(
        "Select at least one group OR one student and at least one course",
      );
      return;
    }

    try {
      await auth.currentUser.getIdToken();

      await api.post("/api/admin/assign-courses", {
        groupIds: selectedGroups,
        studentIds: selectedStudents,
        courseIds: selectedCourses,
      });

      setSelectedGroups([]);
      setSelectedStudents([]);
      setSelectedCourses([]);
      setShowSuccessPopup(true); // NEW
    } catch (err) {
      console.error("Assign course error:", err);
      setError("Failed to assign courses");
    }
  };

  /* =========================
     FILTERED STUDENTS
  ========================= */
  const filteredGroups = groups.filter((g) =>
    (g.group_name || "").toLowerCase().includes(searchGroup.toLowerCase()),
  );

  const filteredStudents = students.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchStudent.toLowerCase()),
  );

  return (
    <AssignCourseView
      loading={loading}
      error={error}
      groups={filteredGroups}
      selectedGroups={selectedGroups}
      searchGroup={searchGroup}
      setSearchGroup={setSearchGroup}
      toggleGroup={toggleGroup}
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
