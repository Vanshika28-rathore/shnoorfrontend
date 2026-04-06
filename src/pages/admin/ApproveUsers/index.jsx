import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ApproveUsersView from "./view";

const ApproveUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users/pending");
      setPendingUsers(res.data.users);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action, fullName) => {
    const confirmMessage =
      action === "active"
        ? `Approve access for ${fullName}?`
        : `Reject access for ${fullName}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await api.patch(`/api/admin/users/${userId}/status`, {
        status: action,
      });

      setPendingUsers((prev) =>
        prev.filter((user) => user.user_id !== userId)
      );

      alert(
        `User ${
          action === "active" ? "approved" : "rejected"
        } successfully`
      );
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user status.");
    }
  };

  return (
    <ApproveUsersView
      loading={loading}
      pendingUsers={pendingUsers}
      handleAction={handleAction}
    />
  );
};

export default ApproveUsers;
