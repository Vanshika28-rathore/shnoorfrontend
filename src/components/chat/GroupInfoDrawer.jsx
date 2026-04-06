import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaPen, FaCheck, FaUsers, FaSignOutAlt, FaTrash, FaUserShield } from 'react-icons/fa';
import api from '../../api/axios';
import { useSocket } from '@context/useSocket';
import { formatChatDate } from '../../utils/chatDateTime';

const GroupInfoDrawer = ({ chat, isOpen, onClose, onLeaveSuccess, onDeleteSuccess }) => {
    const { dbUser } = useSocket();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [resolvedBase, setResolvedBase] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(chat.name);
    const [editDesc, setEditDesc] = useState(chat.description || "");
    const [saving, setSaving] = useState(false);

    const isAdminGroup = chat?.groupType === 'admin';
    const primaryBase = isAdminGroup ? '/api/admingroups' : '/api/chats/groups';
    const fallbackBase = '/api/admingroups';
    const apiBase = resolvedBase || primaryBase;
    const currentUserMember = members.find(m => m.id === dbUser?.id);
    const isAdmin = currentUserMember?.group_role === 'admin';

    useEffect(() => {
        if (isOpen && chat?.id) {
            fetchMembers();
            setEditName(chat.name);
            setEditDesc(chat.description || "");
        }
    }, [isOpen, chat]);

    const fetchMembers = async () => {
        if (!chat?.id) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await api.get(`${primaryBase}/${chat.id}/members`);
            setMembers(res.data || []);
            setResolvedBase(primaryBase);
        } catch (err) {
            const status = err?.response?.status;
            const shouldFallback = !isAdminGroup && (status === 403 || status === 404);

            if (shouldFallback) {
                try {
                    const fallbackRes = await api.get(`${fallbackBase}/${chat.id}/members`);
                    setMembers(fallbackRes.data || []);
                    setResolvedBase(fallbackBase);
                } catch (fallbackErr) {
                    console.error("Failed to fetch members (fallback)", fallbackErr);
                    setErrorMsg(fallbackErr?.response?.data?.message || "Failed to load members");
                }
            } else {
                console.error("Failed to fetch members", err);
                setErrorMsg(err?.response?.data?.message || "Failed to load members");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`${apiBase}/${chat.id}`, {
                name: editName,
                description: editDesc
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Group update error:", err.response?.data || err.message);
            const msg = err.response?.data?.message || err.message;
            alert(`Failed to update group: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const handlePromote = async (userId) => {
        if (!window.confirm("Make this member a Group Admin?")) return;
        try {
            await api.put(`${apiBase}/${chat.id}/promote/${userId}`);
            fetchMembers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to promote member");
        }
    };

    const handleLeave = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await api.post(`${apiBase}/${chat.id}/leave`);
            onClose();
            if (onLeaveSuccess) onLeaveSuccess(chat.id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to leave group");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("CRITICAL: This will delete the group and all messages for everyone. Continue?")) return;
        try {
            await api.delete(`${apiBase}/${chat.id}`);
            onClose();
            if (onDeleteSuccess) onDeleteSuccess(chat.id);
        } catch (err) {
            alert("Failed to delete group");
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Remove this member from the group?")) return;
        try {
            await api.delete(`${apiBase}/${chat.id}/members/${userId}`);
            fetchMembers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove member");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-96 bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-100">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Group Info</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Group Details */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl font-black text-indigo-600 shadow-inner">
                                {chat?.name?.[0] || "?"}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 animate-in fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Group Name</label>
                                    <input
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                    <textarea
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm text-slate-600 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        rows={3}
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{chat.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{chat.description || "No description provided."}</p>
                                <p className="text-[10px] text-slate-300 uppercase tracking-tighter mt-1 font-bold">Group • {formatChatDate(chat.created_at)}</p>
                                {isAdmin && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full hover:bg-indigo-100 transition-colors inline-flex items-center gap-2"
                                    >
                                        <FaPen size={10} /> Edit Group
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Members List */}
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FaUsers className="text-indigo-400" /> {members.length} Members
                            </h4>
                        </div>

                        <div className="space-y-1">
                            {loading ? (
                                <p className="text-sm text-slate-400 italic text-center py-4">Loading members...</p>
                            ) : errorMsg ? (
                                <p className="text-sm text-red-500 text-center py-4">{errorMsg}</p>
                            ) : (
                                members.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 cursor-default group/member">
                                        {member.photo_url ? (
                                            <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-sm border border-indigo-100/50">
                                                {member.name?.[0] || "?"}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                                                {member.group_role === 'admin' && (
                                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase border border-emerald-200 shadow-sm flex items-center gap-1">
                                                        <FaUserShield size={8} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate font-medium">{member.global_role === 'instructor' ? 'Course Staff' : member.email}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {member.global_role === 'instructor' && (
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                                    STAFF
                                                </span>
                                            )}

                                            {isAdmin && member.id !== dbUser?.id && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover/member:opacity-100 transition-all">
                                                    {member.group_role !== 'admin' && (
                                                        <button
                                                            onClick={() => handlePromote(member.id)}
                                                            className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                            title="Promote to Admin"
                                                        >
                                                            <FaUserShield size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Remove Member"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                        <button
                            onClick={handleLeave}
                            className="w-full flex items-center gap-3 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
                        >
                            <FaSignOutAlt className="opacity-70" />
                            <span>Exit Group</span>
                        </button>

                        {isAdmin && (
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all group/delete"
                            >
                                <FaTrash className="opacity-50 group-hover/delete:opacity-100" />
                                <span>Delete Group</span>
                            </button>
                        )}
                    </div>

                    <div className="py-10"></div> {/* Bottom spacer */}
                </div>
            </div>
        </div>
    );
};

export default GroupInfoDrawer;
