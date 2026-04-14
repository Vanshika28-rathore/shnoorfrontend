import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@auth/useAuth";
import api from "../../../api/axios";
import ManagerLayoutView from "./view";

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [managerName, setManagerName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/me");
        setManagerName(res.data.displayName || res.data.full_name || "Manager");
        setPhotoURL(res.data.photo_url || res.data.photoURL || "");
      } catch (err) {
        console.error("Failed to fetch manager profile");
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
    <ManagerLayoutView
      location={location}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      managerName={managerName}
      handleLogout={handleLogout}
      handleNavigate={handleNavigate}
      photoURL={currentUser?.photoURL || photoURL}
    />
  );
};

export default ManagerLayout;
