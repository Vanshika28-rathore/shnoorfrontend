import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../../auth/firebase";
import CreatePasswordView from "./view.jsx";

const CreatePassword = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const actionCode = searchParams.get("oobCode");

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingLink, setValidatingLink] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [linkReady, setLinkReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateLink = async () => {
      if (!actionCode) {
        if (isMounted) {
          setError("This password setup link is invalid or incomplete.");
          setValidatingLink(false);
        }
        return;
      }

      try {
        const resolvedEmail = await verifyPasswordResetCode(auth, actionCode);
        if (!isMounted) {
          return;
        }

        setEmail(resolvedEmail);
        setLinkReady(true);
      } catch (verificationError) {
        if (!isMounted) {
          return;
        }

        setError("This password setup link is invalid or has expired.");
      } finally {
        if (isMounted) {
          setValidatingLink(false);
        }
      }
    };

    validateLink();

    return () => {
      isMounted = false;
    };
  }, [actionCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!actionCode) {
      setError("This password setup link is invalid or incomplete.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await confirmPasswordReset(auth, actionCode, password);
      localStorage.setItem("rememberedEmail", email);
      setSuccess("Password created successfully. Redirecting to login...");
      window.setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (resetError) {
      console.error("Create password error:", resetError);
      setError("Unable to set your password. Please request a new invite link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreatePasswordView
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      setPassword={setPassword}
      setConfirmPassword={setConfirmPassword}
      loading={loading}
      validatingLink={validatingLink}
      error={error}
      success={success}
      linkReady={linkReady}
      handleSubmit={handleSubmit}
    />
  );
};

export default CreatePassword;