/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const EditGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    group_name: "",
    group_type: "manual",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/admin/groups/${groupId}`);
        
        const group = res.data;
        
        // Determine group_type
        let group_type = 'college';
        if (group.created_by) {
          group_type = 'manual';
        } else if (group.start_date && group.end_date) {
          group_type = 'timestamp';
        }

        setFormData({
          group_name: group.group_name || "",
          group_type: group.group_type || group_type,
          start_date: group.start_date ? new Date(group.start_date).toISOString().split('T')[0] : "",
          end_date: group.end_date ? new Date(group.end_date).toISOString().split('T')[0] : ""
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch group');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.group_name.trim()) {
      setError("Group name is required");
      return;
    }

    // Validate dates for timestamp groups
    if (formData.group_type === 'timestamp') {
      if (!formData.start_date || !formData.end_date) {
        setError("Both start date and end date are required for timestamp groups");
        return;
      }
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        setError("Start date must be before end date");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        group_name: formData.group_name.trim(),
      };

      // Only include dates for timestamp groups
      if (formData.group_type === 'timestamp') {
        payload.start_date = formData.start_date;
        payload.end_date = formData.end_date;
      }

      const res = await api.put(`/api/admin/groups/${groupId}`, payload);
      
      navigate("/admin/groups");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update group");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.group_name) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Error Loading Group</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin/groups")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Groups
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Group</h1>
        <p className="text-gray-600 mt-1">Update group information</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Group Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="group_name"
            value={formData.group_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
            required
          />
        </div>

        {/* Group Type Display */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Group Type
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
            {formData.group_type === 'manual' && 'Manual (Students added individually)'}
            {formData.group_type === 'timestamp' && 'Timestamp (Students by registration date)'}
            {formData.group_type === 'college' && 'College (Students by college name)'}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Group type cannot be changed after creation
          </p>
        </div>

        {/* Dates - Only for Timestamp Groups */}
        {formData.group_type === 'timestamp' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        )}

        {/* Info Messages */}
        {formData.group_type === 'college' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Students are automatically added to this group based on their college name in their profile.
            </p>
          </div>
        )}

        {formData.group_type === 'manual' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Students must be added manually to this group.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/groups")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGroup;