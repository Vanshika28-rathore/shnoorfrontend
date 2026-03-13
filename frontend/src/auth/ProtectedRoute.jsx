import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser, userRole, userStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔴 Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 🔴 Account suspended / inactive
  if (userStatus !== "active") {
    return <Navigate to="/suspended" replace />;
  }

  // 🔐 Role-based access
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  if (allowedRoles && !roles.includes(userRole)) {
    console.warn(`[ProtectedRoute] Access Denied. UserRole: '${userRole}', Required: ${JSON.stringify(allowedRoles)}. Redirection logic triggering...`);
    if (userRole === "admin"){
      console.log("[ProtectedRoute] Redirecting ADMIN to admin/dashboard");
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "instructor"){
     console.log("[ProtectedRoute] Redirecting INSTRUCTOR to instructor/dashboard");
 
      return <Navigate to="/instructor/dashboard" replace />;
    }
    if (userRole === "student"){
      console.log("[ProtectedRoute] Redirecting STUDENT to student/dashboard");
      return <Navigate to="/student/dashboard" replace />;
    }
    console.log("[ProtectedRoute] Redirecting to ROOT (No role match)");
    return <Navigate to="/" replace />;
  }
  console.log(`[ProtectedRoute] Access Granted. Current Role: '${userRole}', Path Allowed.`);
  return children ? children : <Outlet />;
};

export default ProtectedRoute;


