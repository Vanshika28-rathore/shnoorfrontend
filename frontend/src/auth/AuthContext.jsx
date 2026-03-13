import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import api from "../api/axios"; // Keeps your existing axios path

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // We consolidate everything into 'userData' to match the database row
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Only set syncing if we are not in initial load (loading handles that)
      if (!loading) setIsSyncing(true);

      if (user) {
        try {
          const token = await user.getIdToken(true);

          const res = await api.post(
            "/api/auth/login",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          // 3. Status Check (Critical for new DB)
          // The DB returns 'pending', 'active', or 'blocked'.
          // We must block access if not active.
          const dbStatus = res.data.user.status.toLowerCase();

          if (dbStatus === 'blocked' || dbStatus === 'pending') {
            throw new Error("Account is not active");
          }

          // 4. Save User Data (The Fix)
          // We save the UUID (user_id) so we can use it for course enrollment later
          setCurrentUser(user);
          setUserData({
            user_id: res.data.user.user_id, // <--- THIS IS THE KEY FIX
            role: res.data.user.role.toLowerCase(),
            status: dbStatus,
            full_name: user.displayName,
            email: user.email
          });

        } catch (error) {
          console.error("AuthContext backend sync failed:", error);
          console.error("Error response:", error.response?.status, error.response?.data);

          // Auto-register new Google users as students (status='pending')
          if (error.response?.status === 404) {
            try {
              const token = await user.getIdToken(true);

              // Register the user in PostgreSQL
              await api.post("/api/auth/register", {
                token,
                fullName: user.displayName || user.email.split('@')[0],
                role: "student"
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

              // Check if account is pending or blocked
              if (dbStatus === 'blocked' || dbStatus === 'pending') {
                throw new Error("Account is not active");
              }

              // Successfully registered and logged in
              setCurrentUser(user);
              setUserData({
                user_id: loginRes.data.user.user_id,
                role: loginRes.data.user.role.toLowerCase(),
                status: dbStatus,
                full_name: user.displayName,
                email: user.email
              });

              setLoading(false);
              setIsSyncing(false);
              return;
            } catch (registerError) {
              console.error("Auto-registration failed:", registerError);

              // Reset loading state BEFORE showing alerts
              setCurrentUser(null);
              setUserData(null);
              setLoading(false);
              setIsSyncing(false);

              // If registration succeeded but account is pending
              if (registerError.message === "Account is not active") {
                await signOut(auth);
                alert("Account created successfully! Your account is pending admin approval.");
              } else {
                await signOut(auth);
                alert("Failed to create your account. Please try again or contact support.");
              }

              return;
            }
          }


          // Handle blocked/pending users (403)
          if (error.response?.status === 403 || error.message === "Account is not active") {
            setCurrentUser(null);
            setUserData(null);
            setLoading(false);
            setIsSyncing(false);
            await signOut(auth);
            alert("Access Denied: Your account is pending approval or blocked.");
            return;
          }

          // For any other error - show visible message to diagnose
          const errMsg = error.response?.data?.message || error.message || "Unknown error";
          const errStatus = error.response?.status || "Network Error";
          console.error(`[LOGIN ERROR] Status: ${errStatus}, Message: ${errMsg}`);
          alert(`Login failed (${errStatus}): ${errMsg}\n\nPlease check if the backend is running on port 5000.`);

          setCurrentUser(null);
          setUserData(null);
        }
      } else {
        // User logged out
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
      setIsSyncing(false);
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