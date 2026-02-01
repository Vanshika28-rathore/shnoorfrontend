import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import api from "../../../api/axios";
import { useSocket } from "../../../context/SocketContext";
import InstructorLayoutView from "./view.jsx";

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [InstructorName, setInstructorName] = useState("");

  const { unreadCounts } = useSocket();
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Fetch admin profile from DB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/me");
        setInstructorName(res.data.displayName);
      } catch (err) {
        console.error("Failed to fetch instructor profile");
      }
    };
    fetchProfile();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <InstructorLayoutView
      location={location}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      InstructorName={InstructorName}
      handleLogout={handleLogout}
      handleNavigate={handleNavigate}
      totalUnread={totalUnread}
    />
  );
};

export default InstructorLayout;
