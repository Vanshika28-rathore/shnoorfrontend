{/*import React from "react";
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
    if (userRole === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "instructor")
      return <Navigate to="/instructor/dashboard" replace />;
    if (userRole === "student")
      return <Navigate to="/student/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;*/}

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser, userRole, userStatus, loading } = useAuth();

  // 1️⃣ Still checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // 2️⃣ Not logged in → go to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Suspended / inactive account
  if (userStatus !== "active") {
    return <Navigate to="/suspended" replace />;
  }

  // 4️⃣ Role-based access
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!roles.includes(userRole)) {
      if (userRole === "admin")
        return <Navigate to="/admin/dashboard" replace />;
      if (userRole === "instructor")
        return <Navigate to="/instructor/dashboard" replace />;
      if (userRole === "student")
        return <Navigate to="/student/dashboard" replace />;

      return <Navigate to="/" replace />;
    }
  }

  // 5️⃣ Access granted
  return children ? children : <Outlet />;
};

export default ProtectedRoute;

