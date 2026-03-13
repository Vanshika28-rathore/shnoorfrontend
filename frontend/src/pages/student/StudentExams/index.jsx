import React, { useState } from "react";
import StudentExamsView from "./view";

const StudentExams = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartExam = () => {
    setShowQuiz(true);
  };

  const handleBackToExams = () => {
    setShowQuiz(false);
  };

  return (
    <StudentExamsView
      showQuiz={showQuiz}
      onStartExam={handleStartExam}
      onBack={handleBackToExams}
    />
  );
};

export default StudentExams;
