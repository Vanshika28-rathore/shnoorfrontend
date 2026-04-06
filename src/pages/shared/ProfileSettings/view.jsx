import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaSave,
  FaCamera,
} from "react-icons/fa";

const ProfileSettingsView = ({
  loading,
  userData,
  saving,
  handleChange,
  handleSave,
  handleImageUpload,
  uploading,
  previewUrl,
}) => {
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="w-full pb-12">
      <h2 className="text-2xl font-bold mb-8 text-primary-900">
        Account Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center h-fit">
          <div className="relative mb-6 group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-4xl border-4 border-white shadow-lg overflow-hidden relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : userData.displayName ? (
                userData.displayName[0].toUpperCase()
              ) : (
                <FaUser />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-slate-800 transition-colors cursor-pointer">
              <FaCamera size={12} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <h3 className="text-xl font-bold text-primary-900 mb-1">
            {userData.displayName || "User"}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {userData.headline || "No headline set"}
          </p>

          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${userData.role === "admin" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
          >
            {userData.role}
          </div>

          <div className="w-full pt-6 border-t border-slate-100 text-left">
            <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
              <FaEnvelope className="text-slate-400" /> {userData.email}
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-primary-900 mb-6 pb-4 border-b border-slate-100">
            Edit Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2 col-span-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                name="displayName"
                value={userData.displayName}
                onChange={handleChange}
                placeholder="Enter User name"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                Professional Headline
              </label>
              <input
                name="headline"
                value={userData.headline}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                College
              </label>
              <input
                type="text"
                name="college"
                value={userData.college || ""}
                onChange={handleChange}
                placeholder="e.g. Stanford University"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
              />
              <p className="text-sm text-slate-500 mt-1">
                Required for student groups
              </p>
            </div>
            
            <div className="space-y-2 col-span-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Bio</label>
              <textarea
                name="bio"
                rows="4"
                value={userData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all font-medium"
              />
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Social Links
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FaLinkedin className="text-indigo-600" /> LinkedIn URL
              </label>
              <input
                name="linkedin"
                value={userData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FaGithub /> GitHub URL
              </label>
              <input
                name="github"
                value={userData.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              className={`flex items-center gap-2 px-8 py-3 bg-primary-900 text-white rounded-xl font-bold shadow-lg shadow-primary-900/30 transition-all ${saving ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-800 hover:-translate-y-0.5"}`}
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsView;
