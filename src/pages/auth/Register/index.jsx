import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import api from "../../api/axios";
import { auth } from "../../auth/firebase";
import RegisterView from "./RegisterView";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      formData={formData}
      handleChange={handleChange}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      error={error}
      loading={loading}
      successMessage={successMessage}
      handleRegister={handleRegister}
    />
  );
};

export default Register;
