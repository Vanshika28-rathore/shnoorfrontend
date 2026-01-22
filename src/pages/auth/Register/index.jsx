import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import api from "../../../api/axios";
import { auth } from "../../../auth/firebase";
import RegisterView from "./view.jsx";

const Register = () => {
  const [step, setStep] = useState(1); // ✅ REQUIRED
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ STEP 1 → STEP 2 (THIS WAS MISSING)
  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setError("");
    setSuccessMessage("");
    setStep(2);
  };

  // ✅ Back button logic
  const handleBack = () => {
    setError("");
    setStep(1);
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // ✅ Final registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const token = await userCredential.user.getIdToken();

      await api.post("/api/auth/register", {
        token,
        fullName: formData.fullName,
        role: formData.role,
      });

      setSuccessMessage(
        "Account created successfully. Your account is pending Admin approval."
      );

      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already in use.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterView
      step={step} // ✅ REQUIRED
      formData={formData}
      error={error}
      loading={loading}
      successMessage={successMessage}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      handleChange={handleChange}
      handleRoleSelect={handleRoleSelect} // ✅ REQUIRED
      handleBack={handleBack}             // ✅ REQUIRED
      handleRegister={handleRegister}
      togglePasswordVisibility={togglePasswordVisibility}
      toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
    />
  );
};

export default Register;
