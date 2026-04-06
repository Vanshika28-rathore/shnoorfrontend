/* eslint-disable no-undef */
import React from "react";
import { Users, Plus, Pencil, Trash2, Calendar, User } from "lucide-react";

const GroupsView = ({ groups = [], loading = false, onCreate, onSelectGroup, onDelete, onEdit }) => {
  const getGroupTypeLabel = (group) => {
    if (group.created_by) return "Manual";
    else if (group.start_date && group.end_date) return "Timestamp";
    else return "College";
  };

  const getGroupTypeBadgeColor = (group) => {
    if (group.created_by) return "bg-indigo-50 text-indigo-600 border-indigo-100";
    else if (group.start_date && group.end_date) return "bg-violet-50 text-violet-600 border-violet-100";
    else return "bg-emerald-50 text-emerald-600 border-emerald-100";
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Loading groups...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Users size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Groups</h1>
              <p className="text-slate-400 text-sm mt-0.5">Create and manage student groups.</p>
            </div>
          </div>
          <button onClick={onCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
            <Plus size={16} /> Create Group
          </button>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        {groups.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Users className="text-slate-300" size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-400 mb-1">No groups yet</p>
            <p className="text-xs text-slate-300 mb-4">Click "Create Group" to add one.</p>
            <button onClick={onCreate}
              className="px-5 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors">
              Create First Group
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Group Name</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date Range</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Students</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {groups.map((g) => (
                  <tr key={g.group_id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="py-4 px-6" onClick={() => onSelectGroup(g.group_id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                          <Users className="text-indigo-500" size={16} />
                        </div>
                        <span className="font-semibold text-sm text-primary-900">{g.group_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getGroupTypeBadgeColor(g)}`}>
                        {getGroupTypeLabel(g)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 font-medium tabular-nums" onClick={() => onSelectGroup(g.group_id)}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-300" />
                        {g.start_date && g.end_date
                          ? `${new Date(g.start_date).toLocaleDateString()} – ${new Date(g.end_date).toLocaleDateString()}`
                          : "—"}
                      </div>
                    </td>
                    <td className="py-4 px-6" onClick={() => onSelectGroup(g.group_id)}>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-300" />
                        <span className="text-sm font-semibold text-slate-600 tabular-nums">{g.user_count ?? 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-2 items-center justify-end">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(g.group_id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                          title="Edit group">
                          <Pencil size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(g.group_id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete group">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsView;