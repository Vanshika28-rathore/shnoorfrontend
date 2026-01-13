import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import api from "../../api/axios";
import { auth, googleProvider } from "../../auth/firebase";
import { FaEye, FaEyeSlash, FaSignInAlt, FaGoogle } from "react-icons/fa";
import "../../styles/Auth.css";
import brandLogo from "../../assets/SHnoor_logo_1.jpg";
import markLogo from "../../assets/just_logo.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

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
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      redirectByRole(res.data.user.role);
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 403) {
        setError(err.response.data.message); // pending / blocked
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
      const user = result.user;

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
      redirectByRole(res.data.user.role);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
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
    <div className="login-container flex bg-background-muted">
      <div className="auth-brand-section hidden md:flex">
        <div className="brand-content">
          <img
            src={brandLogo}
            alt="Shnoor Logo"
            style={{
              maxWidth: "150px",
              marginBottom: "20px",
              borderRadius: "10px",
              display: "block",
              margin: "0 auto 20px auto",
            }}
          />
          <p className="brand-description">
            Empower your institution with a world-class Learning Management
            System. Streamline administration, enhance learning, and drive
            results.
          </p>
          <div className="brand-testimonial">
            <span className="quote-text">
              "Shnoor has completely transformed how we manage our curriculum
              and student progress. A true game changer!"
            </span>
            <span className="quote-author">- Dr. Sarah Miller, Principal</span>
          </div>
        </div>
      </div>

      <div className="auth-form-section flex-1 flex items-center justify-center">
        <div className="login-card w-full max-w-md">
          <div className="login-header">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={markLogo}
                alt="Shnoor International"
                style={{ width: "70px", height: "60px", borderRadius: "1px" }}
              />
              <div>
                <h1 className="brand-logo text-primary text-xl md:text-2xl font-semibold mb-1 tracking-tight leading-tight">
                  Shnoor International
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium tracking-[0.18em] uppercase">
                  Learning Platform
                </p>
              </div>
            </div>
            <p className="brand-subtitle text-sm md:text-base mt-1">
              Sign in to your Shnoor LMS account.
            </p>
          </div>

          {error && <div className="error-message"> {error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <label style={{ marginBottom: 0 }}>Password</label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me on this device</label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  <FaSignInAlt /> Sign In
                </>
              )}
            </button>

            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <button
              type="button"
              className="login-btn google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FaGoogle style={{ color: "#EA4335" }} /> Google
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "var(--color-primary)", fontWeight: 600 }}
              >
                Sign up
              </Link>
            </p>
            <p style={{ marginTop: "10px", fontSize: "0.8rem" }}>
              Welcome to Shnoor LMS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
