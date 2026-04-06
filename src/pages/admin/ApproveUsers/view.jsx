import React from 'react';
import { CheckCircle2, XCircle, UserCheck, AlertCircle, ShieldAlert, GraduationCap, Briefcase } from 'lucide-react';

const ApproveUsersView = ({ loading, pendingUsers, handleAction }) => {

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium text-sm">Loading pending requests...</p>
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
                            <UserCheck size={24} className="text-indigo-300" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">User Approval Queue</h1>
                            <p className="text-slate-400 text-sm mt-0.5">Review and manage new account requests.</p>
                        </div>
                    </div>
                    {pendingUsers.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <AlertCircle size={16} className="text-amber-400" />
                            <span className="text-sm font-bold text-amber-300">{pendingUsers.length} Pending</span>
                        </div>
                    )}
                </div>
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                            <tr>
                                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest md:table-cell hidden">Role Requested</th>
                                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest md:table-cell hidden">Date Registered</th>
                                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pendingUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <CheckCircle2 size={28} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-400">No pending user requests.</p>
                                            <p className="text-xs text-slate-300">All caught up! 🎉</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingUsers.map(user => (
                                    <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-sm text-indigo-600 border border-indigo-100">
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-primary-900">{user.full_name || 'Unknown Name'}</div>
                                                    <div className="text-xs text-slate-400">{user.email}</div>
                                                    <div className="md:hidden mt-1">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                                                user.role === 'instructor' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            }`}>{user.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 md:table-cell hidden">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                                    user.role === 'instructor' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {user.role === 'admin' && <ShieldAlert size={13} />}
                                                {user.role === 'instructor' && <Briefcase size={13} />}
                                                {user.role === 'student' && <GraduationCap size={13} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 md:table-cell hidden">
                                            <div className="text-sm font-semibold text-slate-600 tabular-nums">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-300 tabular-nums">
                                                {user.created_at ? new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleAction(user.user_id, 'rejected', user.full_name)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                                                    title="Reject">
                                                    <XCircle size={16} />
                                                </button>
                                                <button onClick={() => handleAction(user.user_id, 'active', user.full_name)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5"
                                                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                                                    title="Approve">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApproveUsersView;
