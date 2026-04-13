import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Calendar, PenTool, Loader2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../api/axios";

const EditContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    validityValue: 1,
    validityUnit: "week",
    passPercentage: 50,
    isActive: true
  });

  useEffect(() => {
    const fetchContest = async () => {
      try {
        // Try to use passed state if available
        if (location.state?.contest) {
          const c = location.state.contest;
          setFormData({
            title: c.title || "",
            description: c.description || "",
            duration: c.duration || 30,
            validityValue: c.validity_value || 1,
            validityUnit: c.validity_unit || "week",
            passPercentage: c.pass_percentage || 50,
            isActive: c.status === "active"
          });
          setLoading(false);
          return;
        }

        // Fetch from API
        const res = await api.get(`/api/contests/${id}`);
        const c = res.data;
        setFormData({
          title: c.title || "",
          description: c.description || "",
          duration: c.duration || 30,
          validityValue: c.validity_value || 1,
          validityUnit: c.validity_unit || "week",
          passPercentage: c.pass_percentage || 50,
          isActive: c.status === "active"
        });
      } catch (error) {
        console.error("Error fetching contest:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration),
        validityValue: parseInt(formData.validityValue),
        validityUnit: formData.validityUnit,
        passPercentage: parseInt(formData.passPercentage)
      };

      await api.put(`/api/contests/${id}`, payload);
      navigate("/instructor/contests");
    } catch (error) {
      console.error("Error updating contest:", error);
      alert("Server error while updating contest");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-primary-900">Edit Contest</h1>
          <p className="text-slate-500 text-sm">
            Update the contest details and configuration.
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

          {/* Configuration */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pass %
                  </label>
                  <input
                    type="number"
                    name="passPercentage"
                    value={formData.passPercentage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Validity Value
                  </label>
                  <input
                    type="number"
                    name="validityValue"
                    value={formData.validityValue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Validity Unit
                  </label>
                  <select
                    name="validityUnit"
                    value={formData.validityUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="day">Day(s)</option>
                    <option value="week">Week(s)</option>
                    <option value="month">Month(s)</option>
                  </select>
                </div>
              </div>
            </div>

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
                    className={`block h-6 rounded-full transition-colors ${formData.isActive ? "bg-green-500" : "bg-slate-300"
                      }`}
                  ></label>
                  <div
                    className={`absolute left-0 top-0 h-6 w-6 bg-white rounded-full shadow transform transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-0"
                      }`}
                  ></div>
                </div>
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Active / Published
                </label>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/instructor/contests")}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary-900 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-primary-800 transition-colors shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContest;