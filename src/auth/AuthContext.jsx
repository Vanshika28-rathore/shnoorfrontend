{/*import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setCurrentUser(null);
          setUserRole(null);
          setLoading(false);
          setUserStatus(null);
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
          },
        );

        setCurrentUser(user);
        setUserRole(res.data.user.role.toLowerCase());
        setUserStatus(res.data.user.status.toLowerCase());
      } catch (error) {
        console.error("AuthContext backend sync failed:", error);
        setCurrentUser(null);
        setUserRole(null);
        setUserStatus(null);
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
    setUserStatus(null);
  };

  const value = {
    currentUser,
    userRole,
    userStatus,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
*/}

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import api from "../api/axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // 🔐 IMPORTANT

      try {
        if (!user) {
          setCurrentUser(null);
          setUserRole(null);
          setUserStatus(null);
          return;
        }

        const token = await user.getIdToken(true);

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
        setUserRole(res.data.user.role.toLowerCase());
        setUserStatus(res.data.user.status.toLowerCase());
      } catch (error) {
        console.error("AuthContext backend sync failed:", error);
        setCurrentUser(null);
        setUserRole(null);
        setUserStatus(null);
      } finally {
        setLoading(false); // ✅ ONLY here
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
    setUserStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, userRole, userStatus, loading, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
