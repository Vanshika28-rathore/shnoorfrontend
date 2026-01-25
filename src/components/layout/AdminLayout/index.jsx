import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import api from "../../../api/axios";
import AdminLayoutView from "./view.jsx";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");

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
    setIsSidebarOpen(false);
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
