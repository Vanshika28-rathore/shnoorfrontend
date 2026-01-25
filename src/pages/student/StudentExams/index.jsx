import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentExamsView from "./view";
import api from "../../../api/axios";

const StudentExams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);

  const [passedExams, setPassedExams] = useState([]);

  const [accessStatus, setAccessStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const [courseNames, setCourseNames] = useState({});

  useEffect(() => {
    const initExams = async () => {
      try {
        const res = await api.get("/api/student/exams");

        setExams(res.data);

        // derive passed exams
        const passed = res.data
          .filter((e) => e.attempted)
          .map((e) => e.exam_id);

        setPassedExams(passed);

        // all returned exams are unlocked
        const access = {};
        res.data.forEach((e) => {
          access[e.exam_id] = true;
        });

        setAccessStatus(access);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoading(false);
      }
    };

    initExams();
  }, []);

  const isPassed = (examId) => passedExams.includes(examId);

  return (
    <StudentExamsView
      loading={loading}
      exams={exams}
      isPassed={isPassed}
      accessStatus={accessStatus}
      courseNames={courseNames}
      navigate={navigate}
    />
  );
};

export default StudentExams;
