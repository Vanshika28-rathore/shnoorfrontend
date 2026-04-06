/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth, storage } from "../../../auth/firebase";
import api from "../../../api/axios";
import ProfileSettingsView from "./view";

const ProfileSettings = () => {
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    bio: "",
    college: "",
    headline: "",
    linkedin: "",
    github: "",
    role: "",
    photoURL: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* =========================
     FETCH PROFILE FROM BACKEND
  ========================= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!auth.currentUser) return;

      const token = await auth.currentUser.getIdToken();

      const res = await api.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData({
        displayName: res.data.name || "",
        email: res.data.email || auth.currentUser.email || "",
        role: res.data.role || "User",
        bio: res.data.bio || "",
        headline: res.data.headline || "",
        linkedin: res.data.linkedin || "",
        github: res.data.github || "",
        college: res.data.college || "",
        photoURL: res.data.photo_url || auth.currentUser.photoURL || "",
      });

      setPreviewUrl(res.data.photo_url || auth.currentUser.photoURL || "");
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORM CHANGE
  ========================= */
  const handleChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
     IMAGE UPLOAD (FIREBASE STORAGE)
  ========================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      // Upload to backend
      const res = await api.post("/api/users/upload-profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const downloadURL = res.data.url;

      setPreviewUrl(downloadURL);
      setUserData((prev) => ({ ...prev, photoURL: downloadURL }));

      // Update Firebase Auth photo
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     SAVE PROFILE TO BACKEND
  ========================= */
  const handleSave = async () => {
    if (!auth.currentUser) return;

    setSaving(true);

    try {
      const token = await auth.currentUser.getIdToken();

      await api.put(
        "/api/users/me",
        {
          displayName: userData.displayName,
          bio: userData.bio,
          college: userData.college,
          headline: userData.headline,
          linkedin: userData.linkedin,
          github: userData.github,
          photoURL: userData.photoURL,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Sync Firebase Auth display name
      if (userData.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: userData.displayName,
        });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileSettingsView
      loading={loading}
      userData={userData}
      saving={saving}
      uploading={uploading}
      previewUrl={previewUrl}
      handleChange={handleChange}
      handleSave={handleSave}
      handleImageUpload={handleImageUpload}
    />
  );
};

export default ProfileSettings;
