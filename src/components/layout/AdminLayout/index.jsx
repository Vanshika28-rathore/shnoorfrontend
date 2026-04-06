import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@auth/useAuth";
import api from "../../../api/axios";
import AdminLayoutView from "./view.jsx";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [adminName, setAdminName] = useState("");

  // Track screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Keep it as is or show it
      } else {
        // setIsSidebarOpen(false); // Close on mobile resize
      }
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
        setAdminName(res.data.displayName);
      } catch (err) {
        console.error("Failed to fetch admin profile");
      }
    };
    fetchProfile();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <AdminLayoutView
      location={location}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      adminName={adminName}
      handleLogout={handleLogout}
      handleNavigate={handleNavigate}
    />
  );
};

export default AdminLayout;