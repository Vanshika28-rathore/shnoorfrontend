/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../../auth/firebase";
import { useAuth } from "../../../auth/useAuth";
import LoginView from "./view";

const Login = () => {
  const navigate = useNavigate();
  const { userData, loading: authLoading, isSyncing } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Navigate after successful authentication
  useEffect(() => {
    if (!authLoading && userData?.role) {
      const role = userData.role.toLowerCase();
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "instructor") navigate("/instructor/dashboard");
      else if (role === "manager") navigate("/manager/dashboard");
      else navigate("/student/dashboard");
    }
  }, [userData, authLoading, navigate]);

  // Reset loading state when AuthContext finishes processing (using isSyncing)
  useEffect(() => {
    if (!isSyncing) {
      setLoading(false);
    }
  }, [isSyncing]);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError("");
    setLoading(true);

    try {
      // Firebase Auth - AuthContext will handle backend sync via onAuthStateChanged
      await signInWithEmailAndPassword(auth, email, password);

      // Handle Remember Me
      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      else localStorage.removeItem("rememberedEmail");

      // Navigation will happen via useEffect when userData updates

    } catch (err) {
      console.error("Login error:", err);

      // Handle Firebase auth errors
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      // Firebase Google Sign In - AuthContext will handle backend sync
      await signInWithPopup(auth, googleProvider);

      // Navigation will happen via useEffect when userData updates

    } catch (err) {
      console.error("Google Sign-In error:", {
        code: err?.code,
        message: err?.message,
        full: err,
      });

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Pop-up blocked. Please allow pop-ups and try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized for Firebase Google login. Add this domain in Firebase Console -> Authentication -> Settings -> Authorized domains.",
        );
      } else if (err.code === "auth/operation-not-allowed") {
        setError(
          "Google sign-in is not enabled in Firebase. Enable Google provider in Firebase Authentication -> Sign-in method.",
        );
      } else if (err.code === "auth/invalid-api-key") {
        setError("Firebase API key is invalid or missing in frontend environment variables.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error during Google sign-in. Check internet and try again.");
      } else {
        setError(`Google Sign-In failed (${err?.code || "unknown_error"}). Please try again.`);
      }
      setLoading(false);
    }
  };


  return (
    <LoginView
      formData={{ email, password, rememberMe }}
      setFormData={{ setEmail, setPassword, setRememberMe }}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      error={error}
      loading={loading}
      handleLogin={handleLogin}
      handleGoogleSignIn={handleGoogleSignIn}
    />
  );
};

export default Login;