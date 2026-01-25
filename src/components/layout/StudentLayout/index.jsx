import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import api from "../../../api/axios";
import StudentLayoutView from "./view";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [studentName, setStudentName] = useState("");
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState("Novice");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch student profile + XP
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/me");

        setStudentName(res.data.displayName);
        setXp(res.data.xp || 0);

        // Rank calculation (same logic as dashboard)
        const xpValue = res.data.xp || 0;
        setRank(
          xpValue >= 500
            ? "Expert"
            : xpValue >= 200
            ? "Intermediate"
            : "Novice"
        );
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <StudentLayoutView
      studentName={studentName}
      xp={xp}
      setXp={setXp}       
      rank={rank}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      handleLogout={handleLogout}
      navigate={navigate}
      location={location}
    />
  );
};

export default StudentLayout;