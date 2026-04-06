/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import GroupsView from "./view";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching groups...');
      const res = await api.get("/api/admin/groups");
      console.log('Groups fetched:', res.data);
      setGroups(res.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      const errorMsg = err.response?.data?.message || "Failed to fetch groups";
      setError({
        message: errorMsg,
        details: err.response?.status === 500 ? "Server error (500) - Check backend logs" : null,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      console.log('Deleting group:', id);
      await api.delete(`/api/admin/groups/${id}`);
      setGroups(groups.filter(g => g.group_id !== id));
      console.log('Group deleted successfully');
    } catch (err) {
      console.error('Error deleting group:', err);
      alert(err.response?.data?.message || "Failed to delete group");
    }
  };

  const handleManageStudents = (id) => {
    console.log('Managing students for group:', id);
    navigate(`/admin/groups/${id}/users`);
  };

  const handleEdit = (id) => {
    console.log('Editing group:', id);
    navigate(`/admin/groups/edit/${id}`);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error Loading Groups</h3>
              <p className="text-red-700 text-sm mb-1">{error.message}</p>
              {error.details && <p className="text-red-600 text-xs">{error.details}</p>}
              <p className="text-red-500 text-xs mt-1">Time: {error.timestamp}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-lg"
                title="Dismiss"
              >
                ✕
              </button>
              <button
                onClick={fetchGroups}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      <GroupsView
        groups={groups}
        loading={loading}
        onCreate={() => navigate("/admin/groups/create")}
        onSelectGroup={(id) => navigate(`/admin/groups/${id}/users`)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onManageStudents={handleManageStudents}
      />
    </div>
  );
};

export default Groups;