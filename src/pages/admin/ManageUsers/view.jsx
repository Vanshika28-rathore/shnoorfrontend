import React from "react";
import { Search, Ban, CheckCircle2, Shield, GraduationCap, Briefcase, Building, Users, Crown } from "lucide-react";

const ManageUsersView = ({
  loading, searchInput, setSearchInput, handleSearch, filterRole, setFilterRole, filteredUsers, handleStatusChange,
}) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <Crown className="text-amber-500" size={16} />;
      case "manager": return <Shield className="text-indigo-500" size={16} />;
      case "instructor": return <Briefcase className="text-violet-500" size={16} />;
      case "company": return <Building className="text-amber-500" size={16} />;
      default: return <GraduationCap className="text-emerald-500" size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-emerald-50 text-emerald-600 border-emerald-100",
      blocked: "bg-red-50 text-red-600 border-red-100",
      pending: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${map[status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
        {status || "Unknown"}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-125">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Loading users...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans max-w-360 mx-auto space-y-6">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Users size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">User Management</h1>
              <p className="text-slate-400 text-sm mt-0.5">Search, filter, and manage all platform users.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search users..." value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white w-full sm:w-56 focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 focus:bg-white/15 transition-all placeholder:text-slate-400" />
            </div>
            <button onClick={handleSearch}
              className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-all w-full sm:w-auto">
              Search
            </button>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white font-medium focus:ring-2 focus:ring-indigo-400/30 transition-all cursor-pointer [&>option]:text-slate-900 [&>option]:bg-white w-full sm:w-auto">
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="manager">Managers</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Join Date</th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500 border border-slate-200">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-primary-900">{user.full_name || "No Name"}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize text-sm font-medium text-slate-600">{user.role}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-400 tabular-nums">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user.status === "blocked" ? (
                        <button onClick={() => handleStatusChange(user.user_id, "active")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                          <CheckCircle2 size={14} /> Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.user_id, "blocked")}
                          disabled={user.role === "admin"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${user.role === "admin"
                              ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                              : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                            }`}>
                          <Ban size={14} /> Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center"><Users className="text-slate-300" size={24} /></div>
                      <p className="text-sm text-slate-400 font-medium">No users found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
          Total Users: {filteredUsers.length}
        </div>
      </div>
    </div>
  );
};

export default ManageUsersView;
