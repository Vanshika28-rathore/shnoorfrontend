import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "./firebase";
import api from "../api/axios"; // Keeps your existing axios path

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // We consolidate everything into 'userData' to match the database row
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Set syncing if we are re-authing (not initial load)
      if (!loading) setIsSyncing(true);

      try {
        if (user) {
          const token = await user.getIdToken(true);

          try {
            const res = await api.post(
              "/api/auth/login",
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const dbStatus = res.data.user.status.toLowerCase();

            if (dbStatus === 'blocked' || dbStatus === 'pending') {
              throw new Error("Account is not active");
            }

            setCurrentUser(user);
            setUserData({
              user_id: res.data.user.user_id,
              role: res.data.user.role.toLowerCase(),
              status: dbStatus,
              full_name: res.data.user.full_name || user.displayName || user.email.split('@')[0],
              email: user.email
            });

          } catch (error) {
            console.error("AuthContext backend sync failed:", error);

            // AUTO-REGISTER if user not found (404)
            if (error.response?.status === 404) {
              try {
                // Get selected role from session if it exists (set by Register page)
                const pendingRole = sessionStorage.getItem("pendingRegistrationRole") || "student";
                sessionStorage.removeItem("pendingRegistrationRole");

                // Register the user in PostgreSQL
                await api.post("/api/auth/register", {
                  token,
                  fullName: user.displayName || user.email.split('@')[0],
                  role: pendingRole
                });

                // Retry login after registration
                const loginRes = await api.post(
                  "/api/auth/login",
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const dbStatus = loginRes.data.user.status.toLowerCase();

                if (dbStatus === 'blocked' || dbStatus === 'pending') {
                  throw new Error("Account is not active");
                }

                setCurrentUser(user);
                setUserData({
                  user_id: loginRes.data.user.user_id,
                  role: loginRes.data.user.role.toLowerCase(),
                  status: dbStatus,
                  full_name: loginRes.data.user.full_name || user.displayName || user.email.split('@')[0],
                  email: user.email
                });

              } catch (registerError) {
                console.error("Auto-registration/Retry login failed:", registerError);
                await signOut(auth);
                setCurrentUser(null);
                setUserData(null);

                if (registerError.message === "Account is not active" || registerError.response?.status === 403) {
                  alert("Account created! Status: Pending Approval. Contact your admin.");
                } else {
                  alert(`Registration failed: ${registerError.response?.data?.message || registerError.message}`);
                }
              }
            } else if (error.response?.status === 403 || error.message === "Account is not active") {
              await signOut(auth);
              setCurrentUser(null);
              setUserData(null);
              alert("Access Denied: Your account is pending approval or blocked.");
            } else {
              // Network or other critical error
              const errMsg = error.response?.data?.message || error.message || "Unknown error";
              console.error(`[LOGIN ERROR] Status: ${error.response?.status}, Message: ${errMsg}`);

              await signOut(auth);
              setCurrentUser(null);
              setUserData(null);
              alert(`Login failed: ${errMsg}\n\nPlease check if your backend is running.`);
            }
          }
        } else {
          // User logged out
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (fatalError) {
        console.error("AuthContext fatal error:", fatalError);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    });

    return () => unsubscribe();
  }, [loading]); // Added loading as dependency to access latest state if needed, though mostly for setup

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserData(null);
  };

  const value = {
    currentUser,
    userData,
    userRole: userData?.role || null,
    userStatus: userData?.status || null,
    loading,
    isSyncing,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}