import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../auth/firebase';
import StudentExamsView from './view';

const StudentExams = () => {
    const navigate = useNavigate();
    // TODO: [Backend] Fetch available exams from /api/student/exams
    // Expected JSON Shape: 
    // [{ 
    //   id: string, 
    //   title: string, 
    //   duration: number, 
    //   passScore: number, 
    //   linkedCourseId: string,
    //   questions: Array,
    //   totalMarks: number 
    // }]
    const [exams, setExams] = useState([]);

    // TODO: [Backend] Fetch user's passed exams from /api/student/exams/passed
    // Expected JSON Shape: string[] (list of passed exam IDs)
    const [passedExams, setPassedExams] = useState([]);

    // TODO: [Backend] Fetch access status (unlocked/locked) for exams
    // Expected JSON Shape: { [examId: string]: boolean }
    const [accessStatus, setAccessStatus] = useState({});
    const [loading, setLoading] = useState(true);

    const [courseNames, setCourseNames] = useState({});

    useEffect(() => {
        const initExams = async () => {
            // TODO: [Backend] Fetch exams and status here
            // setExams(...);
            // setPassedExams(...);
            setLoading(false);
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
