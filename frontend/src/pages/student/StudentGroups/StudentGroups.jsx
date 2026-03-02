
import React, { useState, useEffect } from 'react';
import api from "../../../api/axios";
import './StudentGroups.css';
const StudentGroups = () => {
    const [groups, setGroups] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [activeTab, setActiveTab] = useState('my-groups');
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [userCollege, setUserCollege] = useState(""); // This would come from auth context

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Fetch college/public groups
            const myGroupsRes = await api.get('/api/chats/groups/my');

            // Fetch admin-assigned groups (Cohorts)
            // The endpoint /api/admingroups/my-groups returns groups the student interaction with
            // OR we can use the endpoint `getStudentGroups` logic which is mapped to `/api/admingroups/my-groups`
            let adminGroupsRes = { data: [] };
            try {
                adminGroupsRes = await api.get('/api/admingroups/my-groups');
            } catch (err) {
                console.error("Failed to fetch admin groups:", err);
            }

            // Merge groups
            // Normalize data structure if needed
            const collegeGroups = myGroupsRes.data.map(g => ({ ...g, type: 'college' }));
            const adminGroups = adminGroupsRes.data.map(g => ({
                ...g,
                type: 'admin',
                // Map fields to match UI expectations if different
                creator_id: g.admin_id
            }));

            // Combine and remove duplicates if any (based on group_id)
            const allGroups = [...collegeGroups, ...adminGroups];
            // Simple uniq by group_id but handle collision via composite key
            // Note: UI might need unique key prop, so ensure rendering uses something unique if possible.
            // But here we just want the list. 
            // If we use group_id as key in Map, we lose one.
            // So key by type+id
            const uniqueGroups = Array.from(new Map(allGroups.map(item => [`${item.type}-${item.group_id}`, item])).values());

            setGroups(uniqueGroups);

            // Fetch available groups (the backend already filters by college)
            const availableRes = await api.get('/api/chats/groups/available');
            setAvailableGroups(availableRes.data);

            // Get user info to display college
            const meRes = await api.get('/api/auth/me'); // Assuming this endpoint exists
            setUserCollege(meRes.data.college);
        } catch (err) {
            console.error("Error loading groups:", err);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        // --- THE IF CONDITION: College check ---
        if (!userCollege) {
            alert("Please update your profile with your college name before creating a group.");
            return;
        }

        try {
            const res = await api.post('/api/chats/groups', formData);
            if (res.status === 201) {
                alert("Group created successfully within " + userCollege + "!");
                setShowCreateModal(false);
                fetchInitialData();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create group");
        }
    };

    const handleJoinGroup = async (groupId, groupCollege) => {
        // --- THE IF CONDITION: Same college join check ---
        if (groupCollege !== userCollege) {
            alert(`Restriction: You belong to ${userCollege}, but this group is for ${groupCollege}. Groups are restricted to same-college students only.`);
            return;
        }

        try {
            await api.post(`/api/chats/groups/${groupId}/join`);
            alert("Joined successfully!");
            setActiveTab('my-groups');
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to join group");
        }
    };


    const handleUpdateMeeting = async (groupId, link) => {
        try {
            await api.put(`/api/chats/groups/${groupId}/meeting`, { meetingLink: link });
            alert("Meeting link updated!");
            fetchInitialData();
        } catch (err) {
            alert("Failed to update meeting link.");
        }
    };

    const handleSelectGroup = async (group) => {
        setActiveGroup(group);
        try {
            let url = `/api/chats/groups/${group.group_id}/messages`;
            if (group.type === 'admin') {
                url = `/api/admingroups/${group.group_id}/messages`;
            }
            const res = await api.get(url);
            setMessages(res.data);
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeGroup) return;

        try {
            let res;
            if (activeGroup.type === 'admin') {
                res = await api.post(`/api/admingroups/${activeGroup.group_id}/messages`, {
                    text: newMessage
                });
            } else {
                // College group message
                // Assuming there is an endpoint or socket event for this
                // For now, let's use the socket or if there is an API
                // Looking at chat.routes.js, there isn't a clear "send message" API for college groups 
                // distinct from specific socket events, BUT generic chat might handle it.
                // However, let's implement the admin group sending first as that's the fix.
                // For college groups, if it was working before via socket, we keep it, but the previous code was just a console.log!
                // Let's assume we need to use the socket for college groups as per the `ChatWindow` logic,
                // OR we can try to find a generic endpoint. The `app.js` has `send_message` socket event.

                // Since this file didn't have real sending logic before (just console.log), 
                // I will strictly implement the Admin Group sending via API which I know exists.
                // For completeness, I'll add a comment about college groups requiring socket.
                console.warn("College group messaging not fully implemented in this view yet - requires socket connection");
            }

            if (res && res.data) {
                setMessages([...messages, {
                    ...res.data,
                    sender_name: 'Me', // Optimistic/Response adjustment
                    created_at: new Date().toISOString()
                }]);
                setNewMessage("");
            }

        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message");
        }
    };

    return (
        <div className="student-group-module">
            <header className="module-header">
                <div>
                    <h1 className="module-title">Student Groups</h1>
                    <p className="text-slate-500">Connect with peers from {userCollege || 'your college'}</p>
                </div>
                <button
                    className="create-group-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create New Group
                </button>
            </header>

            <div className="flex gap-8 items-start">
                <div className="flex-1">
                    <div className="tab-container mb-6">
                        <button
                            className={`tab-btn ${activeTab === 'my-groups' ? 'active' : ''}`}
                            onClick={() => setActiveTab('my-groups')}
                        >
                            My Groups
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
                            onClick={() => setActiveTab('discover')}
                        >
                            Discover (Same College)
                        </button>
                    </div>

                    {activeTab === 'my-groups' ? (
                        <div className="group-grid">
                            {groups.map(group => (
                                <div key={`${group.type}-${group.group_id}`} className="group-card" onClick={() => handleSelectGroup(group)}>
                                    <span className="college-badge">{group.college}</span>
                                    <h3 className="font-bold text-xl mb-2">{group.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{group.description}</p>


                                    {group.meeting_link ? (
                                        <div className="meeting-link-box">
                                            <span className="text-xs font-bold text-emerald-600 uppercase">Live Meeting</span>
                                            <a href={group.meeting_link} target="_blank" rel="noreferrer" className="meeting-btn">
                                                Join Video Meet
                                            </a>
                                            {group.creator_id === 'currentUser_ID' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newLink = prompt("Enter new meeting link:", group.meeting_link);
                                                        if (newLink) handleUpdateMeeting(group.group_id, newLink);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 text-xs font-bold"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        group.creator_id === 'currentUser_ID' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newLink = prompt("Enter meeting link (Zoom/Meet):");
                                                    if (newLink) handleUpdateMeeting(group.group_id, newLink);
                                                }}
                                                className="mt-4 w-full py-2 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all"
                                            >
                                                + Set Meeting Link
                                            </button>
                                        )
                                    )}

                                    <div className="group-meta">
                                        <span className="text-indigo-600 font-semibold cursor-pointer">Open Chat →</span>
                                    </div>
                                </div>
                            ))}
                            {groups.length === 0 && <p className="text-slate-400">You haven't joined any groups yet.</p>}
                        </div>
                    ) : (
                        <div className="group-grid">
                            {availableGroups.map(group => (
                                <div key={group.group_id} className="group-card">
                                    <span className="college-badge">{group.college}</span>
                                    <h3 className="font-bold text-xl mb-2">{group.name}</h3>
                                    <p className="text-slate-500 text-sm mb-6">{group.description}</p>
                                    <button
                                        className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                                        onClick={() => handleJoinGroup(group.group_id, group.college)}
                                    >
                                        Join Group
                                    </button>
                                </div>
                            ))}
                            {availableGroups.length === 0 && <p className="text-slate-400">No new groups available for your college at the moment.</p>}
                        </div>
                    )}
                </div>

                {activeGroup && (
                    <div className="w-96 flex flex-col bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <div className="mb-6">
                            <h2 className="font-bold text-lg">{activeGroup.name} Chat</h2>
                            <p className="text-xs text-slate-500">Group members can interact here</p>
                        </div>

                        <div className="h-96 overflow-y-auto mb-4 bg-white rounded-xl p-4 shadow-inner border border-slate-100">
                            {messages.map((m, i) => (
                                <div key={i} className={`message-bubble ${m.sender_name === 'Me' ? 'message-sent' : 'message-received'}`}>
                                    <span className="block text-[10px] opacity-70 mb-1 font-bold">{m.sender_name}</span>
                                    {m.text}
                                </div>
                            ))}
                            {messages.length === 0 && <p className="text-center text-slate-300 mt-20">No messages yet. Start the conversation!</p>}
                        </div>

                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                                placeholder="Message members..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Send</button>
                        </form>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-bold mb-6">Create New Student Group</h3>
                        <p className="text-sm text-slate-500 mb-6">Groups are automatically restricted to <strong>{userCollege}</strong> students.</p>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Group Name</label>
                                <input
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Computer Science Study Circle"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What's this group about?"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    className="flex-1 py-3 bg-slate-100 rounded-xl font-bold"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentGroups;