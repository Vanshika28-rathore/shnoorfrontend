import React, { useState } from "react";
import { ArrowLeft, Save, Calendar, PenTool, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const CreateContest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    rules: "",
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // ✅ FIXED submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        duration: 30,          // fixed for now
        validityValue: 1,      // fixed for now
        validityUnit: "week",  // fixed for now
        passPercentage: 50
      };

      await api.post("/api/contests", payload);

      navigate("/instructor/contests");

    } catch (error) {
      console.error("Error creating contest:", error);
      alert("Server error while creating contest");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/instructor/contests")}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Create New Contest</h1>
          <p className="text-slate-500 text-sm">
            Set up a new weekly challenge for students.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

          {/* Contest Details */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <PenTool className="w-4 h-4 text-indigo-600" />
              Contest Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contest Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
            </div>
          </section>

          {/* Schedule (UI only for now) */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Schedule
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Status (UI only for now) */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Status
              </h3>

              <div className="flex items-center gap-3 pt-4">
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                  />

                  <label
                    htmlFor="isActive"
                    className={`block h-6 rounded-full ${
                      formData.isActive ? "bg-green-500" : "bg-slate-300"
                    }`}
                  ></label>

                  <div
                    className={`absolute left-0 top-0 h-6 w-6 bg-white rounded-full shadow transform ${
                      formData.isActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>

                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Publish Immediately
                </label>
              </div>
            </div>
          </section>

          {/* Rules (UI only for now) */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MoreVertical className="w-4 h-4 text-indigo-600" />
              Rules & Guidelines
            </h3>

            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </section>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/instructor/contests")}
              className="px-6 py-2.5 text-slate-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-900 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Contest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContest;