import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const CreateGroup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    group_name: "",
    group_type: "manual", // 'timestamp', 'manual', 'college'
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [matchingStudents, setMatchingStudents] = useState([]);

  // Normalize college name using same logic as backend for consistent matching
  const normalizeCollegeName = (name) => {
    if (!name) return '';
    return name
      .toUpperCase()
      .trim()
      .replace(/[,.\-_() ]+/g, ' ')
      .trim();
  };

  useEffect(() => {
    if (form.group_type === "manual" || form.group_type === "college") {
      const fetchStudents = async () => {
        try {
          const res = await api.get("/api/admin/users");
          setAllStudents(
            res.data.filter((u) => u.role === "student" && u.status === "active") || []
          );
        } catch (err) {
          console.error("Failed to fetch students", err);
        }
      };
      fetchStudents();
    }
  }, [form.group_type]);

  // Check for matching college students when group_name changes
  // Uses same normalization as backend to show accurate preview
  useEffect(() => {
    if (form.group_type === "college" && form.group_name && allStudents.length > 0) {
      const normalizedGroupName = normalizeCollegeName(form.group_name);
      const matching = allStudents.filter(
        (student) =>
          student["college"] &&
          normalizeCollegeName(student["college"]) === normalizedGroupName
      );
      setMatchingStudents(matching);
    } else {
      setMatchingStudents([]);
    }
  }, [form.group_name, form.group_type, allStudents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.group_name) return setError("Group name is required");

    if (form.group_type === "timestamp") {
      if (!form.start_date || !form.end_date) {
        return setError("Both start and end dates are required for timestamp groups");
      }
      if (new Date(form.start_date) >= new Date(form.end_date)) {
        return setError("Start date must be before end date");
      }
    }

    if (form.group_type === "college" && matchingStudents.length === 0) {
      const confirmCreate = window.confirm(
        "Create the group anyway? Students will auto-join when they add this college to their profile."
      );
      if (!confirmCreate) return;
    }

    try {
      setLoading(true);
      const groupData = {
        group_name: form.group_name,
        group_type: form.group_type,
      };

      if (form.group_type === "timestamp") {
        groupData.start_date = form.start_date;
        groupData.end_date = form.end_date;
      }

      const res = await api.post("/api/admin/groups", groupData);
      const groupId = res.data.group_id;

      // For manual groups, add selected students
      if (form.group_type === "manual" && selectedStudents.length > 0) {
        await Promise.all(
          selectedStudents.map((studentId) =>
            api.post(`/api/admin/groups/${groupId}/users/${studentId}`)
          )
        );
      }

      navigate("/admin/groups");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-360 mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}>
        <div className="relative z-10">
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Create Group</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create a new group with manual, timestamp, or college-based membership.</p>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 space-y-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
          <p className="font-semibold mb-2">Group Types</p>
          <ul className="list-disc list-inside space-y-1 text-indigo-700">
            <li><strong>Manual:</strong> Admin selects specific students</li>
            <li><strong>Timestamp:</strong> Auto-populate by registration date range</li>
            <li><strong>College:</strong> Auto-populate by college name in user profile</li>
          </ul>
        </div>

        {error && <div className="text-red-700 font-semibold p-3 bg-red-50 border border-red-100 rounded-xl">{error}</div>}

        <div className="space-y-3">
          <label className="block font-semibold text-slate-700">Group Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["manual", "timestamp", "college"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setForm({ ...form, group_type: type, start_date: "", end_date: "" });
                  setSelectedStudents([]);
                }}
                className={`p-3 rounded-xl border-2 transition text-left ${
                  form.group_type === type
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold capitalize text-slate-800">{type}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {type === "manual" && "Manual selection"}
                  {type === "timestamp" && "Date range"}
                  {type === "college" && "Auto by college"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-slate-700">Group Name *</label>
          <input
            required
            placeholder={
              form.group_type === "college" ? "e.g., SRM University" : "Enter group name"
            }
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
            value={form.group_name}
            onChange={(e) => setForm({ ...form, group_name: e.target.value })}
          />
        </div>

        {form.group_type === "timestamp" && (
          <div className="space-y-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm font-semibold text-indigo-900">
              Students will be auto-added if their registration date falls within this range
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Start Date *</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">End Date *</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {form.group_type === "college" && (
          <div className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-1">
                Students will automatically join when they add this college name to their profile
              </p>
              <p className="text-xs text-emerald-800 mt-2">
                <strong>Smart Matching:</strong> The system ignores case, extra spaces, commas, periods, and special characters. For example, "SRM University, AP" matches "SRM UNIVERSITY AP" and "srm university ap".
              </p>
            </div>
            {matchingStudents.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-emerald-800 mb-2">
                  {matchingStudents.length} student{matchingStudents.length !== 1 ? "s" : ""} will be auto-added:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {matchingStudents.map((student) => (
                    <div key={student.user_id} className="text-xs text-emerald-700 pl-2">
                      • {student.full_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {form.group_type === "manual" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">Select Students</h3>
            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl p-2 md:p-3 space-y-2 bg-slate-50/50">
              {allStudents.length === 0 ? (
                <p className="text-slate-500 text-sm p-2">No active students available</p>
              ) : (
                allStudents.map((student) => (
                  <label key={student.user_id} className="flex items-center p-2.5 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.user_id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((id) => id !== student.user_id));
                        }
                      }}
                      className="mr-3 h-4 w-4 accent-indigo-600"
                    />
                    <div>
                      <div className="font-medium text-sm text-slate-700">{student.full_name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selectedStudents.length > 0 && (
              <p className="text-sm text-slate-600">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/groups")}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;