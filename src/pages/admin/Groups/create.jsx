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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Create Group</h1>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800 mb-6">
          <p className="font-semibold mb-2">Group Types:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Manual:</strong> Admin selects specific students</li>
            <li><strong>Timestamp:</strong> Auto-populate by registration date range</li>
            <li><strong>College:</strong> Auto-populate by college name in user profile</li>
          </ul>
        </div>
      </div>

      {error && <div className="text-red-600 font-semibold p-3 bg-red-50 rounded">{error}</div>}

      {/* Group Type Selection */}
      <div className="space-y-3">
        <label className="block font-semibold">Group Type</label>
        <div className="grid grid-cols-3 gap-3">
          {["manual", "timestamp", "college"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setForm({ ...form, group_type: type, start_date: "", end_date: "" });
                setSelectedStudents([]);
              }}
              className={`p-3 rounded border-2 transition ${
                form.group_type === type
                  ? "border-primary-900 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="font-semibold capitalize">{type}</div>
              <div className="text-xs text-gray-600">
                {type === "manual" && "Manual selection"}
                {type === "timestamp" && "Date range"}
                {type === "college" && "Auto by college"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Group Name */}
      <div>
        <label className="block font-semibold mb-2">Group Name *</label>
        <input
          required
          placeholder={
            form.group_type === "college" ? "e.g., SRM University" : "Enter group name"
          }
          className="w-full border p-3 rounded focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
          value={form.group_name}
          onChange={(e) => setForm({ ...form, group_name: e.target.value })}
        />
      </div>

      {/* Timestamp Group - Date Range */}
      {form.group_type === "timestamp" && (
        <div className="space-y-4 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm font-semibold text-blue-900">
            Students will be auto-added if their registration date falls within this range
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Start Date *</label>
              <input
                required
                type="date"
                className="w-full border p-3 rounded focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">End Date *</label>
              <input
                required
                type="date"
                className="w-full border p-3 rounded focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* College Group - Info */}
      {form.group_type === "college" && (
        <div className="space-y-4 p-4 bg-green-50 rounded border border-green-200">
          <div>
            <p className="text-sm font-semibold text-green-900 mb-1">
              Students will automatically join when they add this college name to their profile
            </p>
            <p className="text-xs text-green-800 mt-2">
              💡 <strong>Smart Matching:</strong> The system uses flexible matching that ignores case, extra spaces, commas, periods, and other special characters. 
              For example, a group named "SRM University, AP" will match students who entered "SRM UNIVERSITY AP", "srm university ap", or "SRM University,AP"
            </p>
          </div>
          {matchingStudents.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-green-800 mb-2">
                {matchingStudents.length} student{matchingStudents.length !== 1 ? "s" : ""} will be auto-added:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {matchingStudents.map((student) => (
                  <div key={student.user_id} className="text-xs text-green-700 pl-2">
                    • {student.full_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Group - Student Selection */}
      {form.group_type === "manual" && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Select Students</h3>
          <div className="max-h-80 overflow-y-auto border rounded p-3 space-y-2">
            {allStudents.length === 0 ? (
              <p className="text-gray-500 text-sm">No active students available</p>
            ) : (
              allStudents.map((student) => (
                <label key={student.user_id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
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
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm">{student.full_name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          {selectedStudents.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-900 text-white rounded font-semibold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/groups")}
          className="px-6 py-3 border border-gray-300 rounded font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateGroup;