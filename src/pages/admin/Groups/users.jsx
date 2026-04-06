/* eslint-disable no-undef */
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";

const GroupUsers = () => {
  const { groupId } = useParams();
  const [users, setUsers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [memberType, setMemberType] = useState("student");

  const getGroupType = (g) => {
    if (g.created_by) return "manual";
    if (g.start_date && g.end_date) return "timestamp";
    return "college";
  };

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const [usersRes, membersRes, groupRes] = await Promise.all([
        api.get(`/api/admin/groups/${groupId}/users`, { params: { role: memberType } }),
        api.get(`/api/admin/users`),
        api.get(`/api/admin/groups/${groupId}`),
      ]);

      setUsers(usersRes.data || []);
      setAllMembers(
        (membersRes.data || []).filter(
          (u) => ["student", "instructor"].includes(u.role) && u.status === "active"
        )
      );
      setGroup(groupRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [groupId, memberType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMember = async () => {
    if (!selectedMember) return;

    setDateError(null);
    setProcessing(selectedMember.user_id);

    try {
      const groupType = getGroupType(group);
      const data = {};

      if (groupType === "timestamp" && selectedMember.role === "student") {
        const userCreatedAt = new Date(selectedMember.created_at);
        const groupStartDate = new Date(group.start_date);
        const groupEndDate = new Date(group.end_date);

        if (userCreatedAt < groupStartDate || userCreatedAt > groupEndDate) {
          setDateError(
            `Student registration date (${userCreatedAt.toLocaleDateString()}) is not within the group's date range (${groupStartDate.toLocaleDateString()} - ${groupEndDate.toLocaleDateString()})`
          );
          setProcessing(null);
          return;
        }
      }

      await api.post(`/api/admin/groups/${groupId}/users/${selectedMember.user_id}`, data);
      setShowAddModal(false);
      setSelectedMember(null);
      fetchData();
    } catch (err) {
      setDateError(err.response?.data?.message || `Failed to add ${memberType}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggle = async (userId, isInGroup) => {
    if (isInGroup) {
      setProcessing(userId);
      try {
        await api.delete(`/api/admin/groups/${groupId}/users/${userId}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || `Failed to remove ${memberType}`);
      } finally {
        setProcessing(null);
      }
    } else {
      const member = allMembers.find((m) => m.user_id === userId);
      setSelectedMember(member);
      setDateError(null);
      setShowAddModal(true);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!group) {
    return <div className="p-4 text-red-600">Group not found</div>;
  }

  const groupType = getGroupType(group);
  const canManageMembers = true;
  const eligibleMembers = allMembers.filter((u) => u.role === memberType);
  const memberLabel = memberType === "student" ? "Student" : "Instructor";
  const memberLabelPlural = memberType === "student" ? "Students" : "Instructors";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{group.group_name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Type:{" "}
            <span className="font-semibold">
              {groupType === "manual" && "Manual Selection"}
              {groupType === "timestamp" && "Timestamp-based"}
              {groupType === "college" && "College-based"}
            </span>
          </p>
        </div>
      </div>

      {error && <div className="text-red-600 mb-2 p-3 bg-red-50 rounded">{error}</div>}

      <div className="mb-4 inline-flex rounded-lg border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setMemberType("student")}
          className={`px-4 py-2 text-sm font-semibold ${memberType === "student" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          Students
        </button>
        <button
          type="button"
          onClick={() => setMemberType("instructor")}
          className={`px-4 py-2 text-sm font-semibold ${memberType === "instructor" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          Instructors
        </button>
      </div>

      {groupType === "college" && memberType === "student" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded mb-4 text-sm text-green-800">
          <p className="font-semibold mb-2">College-based Group</p>
          <p>Students with "{group.group_name}" in their college profile are automatically included. You can also manually add/remove students below.</p>
        </div>
      )}

      {groupType === "timestamp" && memberType === "student" && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded mb-4 text-sm text-purple-800">
          <p className="font-semibold mb-2">Timestamp Group</p>
          <p>
            Date Range: {new Date(group.start_date).toLocaleDateString()} - {new Date(group.end_date).toLocaleDateString()}
          </p>
          <p className="mt-2">
            When adding students manually, their registration date must fall within this range.
          </p>
        </div>
      )}

      {canManageMembers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded">
            <div className="p-4 border-b font-medium">
              {memberLabelPlural} in Group ({users.length})
            </div>
            <div className="max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <div className="p-4 text-gray-500">No {memberType}s assigned to this group yet.</div>
              ) : (
                users.map((u) => (
                  <div key={u.user_id} className="p-4 border-b flex justify-between items-start">
                    <div>
                      <span className="font-medium">{u.full_name}</span>
                      <span className="text-slate-500 ml-2">{u.email}</span>
                      {(u.start_date || u.end_date) && (
                        <div className="text-sm text-slate-600 mt-1">
                          {u.start_date && <span>Start: {new Date(u.start_date).toLocaleString()}</span>}
                          {u.start_date && u.end_date && <span> � </span>}
                          {u.end_date && <span>End: {new Date(u.end_date).toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggle(u.user_id, true)}
                      disabled={processing === u.user_id}
                      className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50 hover:bg-red-700 text-xs"
                    >
                      {processing === u.user_id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border rounded">
            <div className="p-4 border-b font-medium">All Active {memberLabelPlural}</div>
            <div className="max-h-96 overflow-y-auto">
              {eligibleMembers.length === 0 ? (
                <div className="p-4 text-gray-500">No {memberType}s available.</div>
              ) : (
                eligibleMembers.map((m) => {
                  const isInGroup = users.some((u) => u.user_id === m.user_id);
                  return (
                    <div key={m.user_id} className="p-4 border-b flex justify-between items-center">
                      <div>
                        <span className="font-medium">{m.full_name}</span>
                        <span className="text-slate-500 ml-2 text-sm">{m.email}</span>
                      </div>
                      {!isInGroup ? (
                        <button
                          onClick={() => handleToggle(m.user_id, false)}
                          disabled={processing === m.user_id}
                          className="px-2 py-1 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 text-xs"
                        >
                          {processing === m.user_id ? "Adding..." : "Add"}
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium text-xs">In Group</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showAddModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add {memberLabel} to Group</h3>
            <div className="mb-4">
              <p className="font-medium">{selectedMember.full_name}</p>
              <p className="text-slate-500">{selectedMember.email}</p>
              {selectedMember.role === "student" && (
                <p className="text-sm text-gray-600 mt-2">
                  Registration Date: {new Date(selectedMember.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {dateError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {dateError}
              </div>
            )}

            {groupType === "timestamp" && selectedMember.role === "student" && (
              <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                This student's registration date will be validated against the group's date range.
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={processing === selectedMember.user_id}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processing === selectedMember.user_id ? "Adding..." : `Add ${memberLabel}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupUsers;