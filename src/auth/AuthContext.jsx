import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import api from "../api/axios"; // axios instance with baseURL

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      if (!user) {
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // 🔴 ALWAYS get token directly from user
      const token = await user.getIdToken(true);

      // 🔴 SEND TOKEN IN HEADER (NOT BODY)
      const res = await api.post(
        "/api/auth/login",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentUser(user);
      setUserRole(res.data.user.role);
    } catch (error) {
      console.error("AuthContext backend sync failed:", error);
      setCurrentUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);


  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
  };

  const value = {
    currentUser,
    userRole,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
