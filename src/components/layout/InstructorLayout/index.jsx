import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@auth/useAuth";
import api from "../../../api/axios";
import { useSocket } from "@context/useSocket";
import InstructorLayoutView from "./view.jsx";

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [instructor, setInstructor] = useState({
    name: "",
    photoURL: "",
  });
  const { unreadCounts } = useSocket();
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Track screen size
  useEffect(() => {
    const handleResize = () => {
      // Logic could be added here if we wanted to auto-open/close on resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Fetch admin profile from DB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/me");
        setInstructor({
          name: res.data.displayName || res.data.full_name || "",
          photoURL: res.data.photo_url || res.data.photoURL || "",
        });
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
      InstructorName={instructor.name}
      handleLogout={handleLogout}
      handleNavigate={handleNavigate}
      totalUnread={totalUnread}
      photoURL={currentUser?.photoURL || instructor.photoURL}
    />
  );
};

export default InstructorLayout;