import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import api from "../../../api/axios.js";
import { auth, googleProvider } from "../../../auth/firebase.js";
import LoginView from "./view.jsx";   

const Login = () => {
  const navigate = useNavigate();

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
  
    const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "instructor") navigate("/instructor/dashboard");
    else navigate("/student/dashboard");
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);

      const res = await api.post(
        "/api/auth/login",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      else localStorage.removeItem("rememberedEmail");

      redirectByRole(res.data.user.role);
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 403) {
        await signOut(auth);
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError("Account not found. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(true);

      const res = await api.post(
        "/api/auth/login",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      redirectByRole(res.data.user.role);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        await signOut(auth);
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError("Account not found. Please register first.");
      } else {
        setError("Google Sign-In failed.");
      }
    } finally {
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


 

