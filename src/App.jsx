import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// Layouts (always needed — keep eager)
import AdminLayout from "./components/layout/AdminLayout";
import InstructorLayout from "./components/layout/InstructorLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ManagerLayout from "./components/layout/ManagerLayout";
import { SocketProvider } from "./context/SocketContext";
import CookieBanner from "./components/CookieBanner";

// Auth pages (small, keep eager for fast login)
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CreatePassword from "./pages/auth/CreatePassword";

// ===== LAZY LOADED PAGES (code-split for page speed) =====
const Landing = React.lazy(() => import("./pages/Landing"));
const Contact = React.lazy(() => import("./pages/Contact"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = React.lazy(
  () => import("./pages/TermsAndConditions"),
);
const Suspended = React.lazy(() => import("./pages/auth/Suspended"));
const VerifyCertificate = React.lazy(
  () => import("./pages/public/VerifyCertificate"),
);
const ProfileSettings = React.lazy(
  () => import("./pages/shared/ProfileSettings"),
);

// Admin
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const ApproveUsers = React.lazy(() => import("./pages/admin/ApproveUsers"));
const ProfileManagement = React.lazy(
  () => import("./pages/admin/ProfileManagement"),
);
const ApproveCourses = React.lazy(() => import("./pages/admin/ApproveCourses"));
const AssignCourse = React.lazy(() => import("./pages/admin/AssignCourse"));
const CertificateConfig = React.lazy(
  () => import("./pages/admin/CertificateConfig"),
);
const AddInstructor = React.lazy(() => import("./pages/admin/AddInstructor"));
const AdminLiveProctoring = React.lazy(
  () => import("./pages/admin/AdminLiveProctoring"),
);
const AdminViolations = React.lazy(
  () => import("./pages/admin/AdminViolations"),
);
const AddManager = React.lazy(() => import("./pages/admin/AddManager"));
const ManagerList = React.lazy(() => import("./pages/admin/ManagerList"));
const ManageUsers = React.lazy(() => import("./pages/admin/ManageUsers"));
const AddStudent = React.lazy(() => import("./pages/admin/AddStudent"));
const AdminExamTimer = React.lazy(
  () => import("./pages/admin/ExamTimer/AdminExamTimer"),
);
const Groups = React.lazy(() => import("./pages/admin/Groups"));
const CreateGroup = React.lazy(() => import("./pages/admin/Groups/create"));
const EditGroup = React.lazy(() => import("./pages/admin/Groups/edit"));
const GroupUsers = React.lazy(() => import("./pages/admin/Groups/users"));
const ChatWithStudents = React.lazy(
  () => import("./pages/admin/ChatWithStudents"),
);
const AdminMessages = React.lazy(() => import("./pages/admin/Messages"));

// Instructor
const InstructorDashboard = React.lazy(
  () => import("./pages/instructor/InstructorDashboard"),
);
const AddCourse = React.lazy(() => import("./pages/instructor/AddCourse"));
const CourseList = React.lazy(() => import("./pages/instructor/CourseList"));
const ExamBuilder = React.lazy(() => import("./pages/instructor/ExamBuilder"));
const InstructorSettings = React.lazy(
  () => import("./pages/instructor/InstructorSettings"),
);
const LearningPaths = React.lazy(
  () => import("./pages/instructor/LearningPaths"),
);
const StudentPerformance = React.lazy(
  () => import("./pages/instructor/StudentPerformance"),
);
const InstructorChat = React.lazy(
  () => import("./pages/instructor/InstructorChat"),
);
const AddPractice = React.lazy(() => import("./pages/instructor/AddPractice"));
const InstructorPracticeList = React.lazy(
  () => import("./pages/instructor/PracticeList"),
);
const InstructorGroups = React.lazy(() => import("./pages/instructor/Groups"));
const InstructorGroupChat = React.lazy(
  () => import("./pages/instructor/GroupChat"),
);
const ContestManagement = React.lazy(
  () => import("./pages/instructor/ContestManagement"),
);
const CreateContest = React.lazy(
  () => import("./pages/instructor/ContestManagement/CreateContext"),
);

// Student
const StudentDashboard = React.lazy(
  () => import("./pages/student/StudentDashboard"),
);
const StudentCourses = React.lazy(
  () => import("./pages/student/StudentCourses"),
);
const CourseDetail = React.lazy(
  () => import("./pages/student/CourseDetail/index"),
);
const CoursePlayer = React.lazy(() => import("./pages/student/CoursePlayer"));
const ExamRunner = React.lazy(() => import("./pages/student/ExamRunner"));
const MockExam = React.lazy(() => import("./pages/student/MockTest/Exam"));
const MockTest = React.lazy(() => import("./pages/student/MockTest"));
const MyCertificates = React.lazy(
  () => import("./pages/student/MyCertificates"),
);
const PracticeList = React.lazy(() => import("./pages/student/PracticeList"));
const PracticeSession = React.lazy(
  () => import("./pages/student/PracticeSession"),
);
const StudentExams = React.lazy(() => import("./pages/student/StudentExams"));
const StudentChat = React.lazy(() => import("./pages/student/StudentChat"));
const Leaderboard = React.lazy(() => import("./pages/student/Leaderboard"));
const WeeklyContest = React.lazy(() => import("./pages/student/WeeklyContest"));
const ContestDetail = React.lazy(
  () => import("./pages/student/WeeklyContest/ContestDetail"),
);
const ContestResult = React.lazy(() => import("./pages/student/ContestResult"));
const ContestLeaderboard = React.lazy(
  () => import("./pages/student/ContestLeaderboard"),
);
const MyGroups = React.lazy(() => import("./pages/student/MyGroups"));
const GroupChat = React.lazy(() => import("./pages/student/GroupChat"));

// Manager
const ManagerDashboard = React.lazy(
  () => import("./pages/manager/ManagerDashboard"),
);
const ViewStudents = React.lazy(() => import("./pages/manager/ViewStudents"));
const CourseProgress = React.lazy(
  () => import("./pages/manager/CourseProgress"),
);
const ExamProgress = React.lazy(() => import("./pages/manager/ExamProgress"));
const ManagerCertificates = React.lazy(
  () => import("./pages/manager/Certificates"),
);
const ManagerMessages = React.lazy(() => import("./pages/manager/Messages"));

// Lazy loading spinner
const LazyFallback = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#D8E2EB",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #4f46e5",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CookieBanner />
        <SocketProvider>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create-password" element={<CreatePassword />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="add-instructor" element={<AddInstructor />} />
                <Route path="add-student" element={<AddStudent />} />
                <Route path="add-manager" element={<AddManager />} />
                <Route path="manager-list" element={<ManagerList />} />
                <Route path="approve-users" element={<ApproveUsers />} />
                <Route path="approve-courses" element={<ApproveCourses />} />
                <Route path="assign-course" element={<AssignCourse />} />
                <Route path="certificates" element={<CertificateConfig />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/create" element={<CreateGroup />} />
                <Route path="groups/edit/:groupId" element={<EditGroup />} />
                <Route path="groups/:groupId/users" element={<GroupUsers />} />
                <Route path="settings" element={<ProfileSettings />} />
                <Route path="group-messages" element={<ChatWithStudents />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="/admin/exam-timers" element={<AdminExamTimer />} />

                <Route
                  path="profile-management"
                  element={<ProfileManagement />}
                />
                <Route path="proctoring" element={<AdminLiveProctoring />} />
                <Route path="violations" element={<AdminViolations />} />
              </Route>

              <Route
                path="/instructor"
                element={
                  <ProtectedRoute allowedRoles="instructor">
                    <InstructorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="add-course" element={<AddCourse />} />
                <Route path="courses" element={<CourseList />} />
                <Route path="practice" element={<InstructorPracticeList />} />
                <Route path="practice/new" element={<AddPractice />} />
                <Route path="contests/*" element={<ContestManagement />} />
                <Route path="contests/create" element={<CreateContest />} />
                <Route path="exams" element={<ExamBuilder />} />
                <Route path="learning-paths" element={<LearningPaths />} />
                <Route path="performance" element={<StudentPerformance />} />
                <Route path="settings" element={<ProfileSettings />} />
                <Route path="chat" element={<InstructorChat />} />
                <Route path="groups" element={<InstructorGroups />} />
                <Route
                  path="groups/:groupId"
                  element={<InstructorGroupChat />}
                />
              </Route>

              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles="manager">
                    <ManagerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="students" element={<ViewStudents />} />
                <Route path="course-progress" element={<CourseProgress />} />
                <Route path="exam-progress" element={<ExamProgress />} />
                <Route path="certificates" element={<ManagerCertificates />} />
                <Route path="messages" element={<ManagerMessages />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["student", "learner"]}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="course/:courseId" element={<CourseDetail />} />
                <Route
                  path="course/:courseId/learn"
                  element={<CoursePlayer />}
                />
                <Route path="practice" element={<PracticeList />} />
                <Route
                  path="practice/session/:challengeId"
                  element={<PracticeSession />}
                />
                <Route path="contests" element={<WeeklyContest />} />
                <Route path="contest/:contestId" element={<ContestDetail />} />
                <Route
                  path="/student/contest/:contestId/result"
                  element={<ContestResult />}
                />

                <Route
                  path="/student/contest/:contestId/leaderboard"
                  element={<ContestLeaderboard />}
                />
                <Route path="exams" element={<StudentExams />} />
                <Route path="mock-test" element={<MockTest />} />
                <Route path="mock-exam" element={<MockExam />} />
                <Route path="exam/:examId" element={<ExamRunner />} />
                <Route path="settings" element={<ProfileSettings />} />
                <Route path="certificates" element={<MyCertificates />} />
                <Route path="chat" element={<StudentChat />} />
                <Route path="/student/groups" element={<MyGroups />} />
                <Route
                  path="/student/groups/:groupId"
                  element={<GroupChat />}
                />

                {/* <Route path="leaderboard" element={<Leaderboard />} /> */}
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/suspended" element={<Suspended />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
