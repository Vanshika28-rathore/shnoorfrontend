// src/pages/admin/ChatWithStudents.jsx
{/*import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, X, Loader2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import api from '../../api/axios';
import { getAuth } from 'firebase/auth';

const ChatWithStudents = () => {
  const { socket, dbUser, unreadCounts, markChatRead, handleSetActiveChat } = useSocket();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState(null);

  // Group modal
  const [addMode, setAddMode] = useState('college'); // 'college' or 'manual'
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const fetchExecuted = useRef(false);
  const fetchData = async () => {
  try {
    setLoadingChats(true);
    setError(null);

    // Fetch only group chats for admin
    const groupsRes = await api.get('/api/admingroups');
    const adminGroups = groupsRes.data.map(g => ({
      id: g.group_id,
      type: 'group',
      name: g.name,
      recipientName: g.name,
      lastMessage: 'Group chat',
      unread: 0,
      memberCount: g.member_count || 0,
      groupType: 'admin',
    }));

    setChats(adminGroups);
  } catch (err) {
    console.error('Failed to load admin groups:', err);
    setError('Failed to load groups');
  } finally {
    setLoadingChats(false);
  }
};

  useEffect(() => {
    if (fetchExecuted.current) return;
    fetchExecuted.current = true;

    fetchData();
  }, [unreadCounts]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      if (msg.chat_id === activeChat?.id) {
        setMessages(prev => [...prev, {
          ...msg,
          isMyMessage: msg.sender_id === dbUser?.id
        }]);
      }
    };

    socket.on('new_message', onNewMessage);
    return () => socket.off('new_message', onNewMessage);
  }, [socket, activeChat, dbUser]);

  const handleSelectChat = async (chat) => {
  setActiveChat(chat);
  handleSetActiveChat(chat.id);
  markChatRead(chat.id);

  setLoadingMessages(true);
  setMessages([]);

  if (chat.id.startsWith('new_')) {
    setMessages([]);
    setLoadingMessages(false);
    return;
  }

  try {
    let res;

    if (chat.type === 'group') {
      // JOIN GROUP ROOM (this was missing for admin!)
      if (socket) {
        socket.emit('join_group', chat.id);
        console.log(`[Admin] Joined group room: ${chat.id}`);
      }

      res = await api.get(`/api/admingroups/${chat.id}/messages`);
    } else {
      res = await api.get(`/api/chats/messages/${chat.id}`);
    }

    setMessages(
      res.data.map(m => ({
        ...m,
        isMyMessage: m.sender_id === dbUser?.id,
        sender_name: m.sender_name || 'Unknown',
      }))
    );
  } catch (err) {
    console.error('[Messages] Failed to load:', err);
    setError('Could not load messages');
  } finally {
    setLoadingMessages(false);
  }
};
useEffect(() => {
  if (!socket) return;

  const handleGroupMessage = (msg) => {
    // Only append if this is the currently open group
    if (msg.group_id === activeChat?.id) {
      setMessages(prev => [...prev, {
        ...msg,
        isMyMessage: msg.sender_id === dbUser?.id,
        sender_name: msg.sender_name || 'Unknown',
      }]);
    }

    // Optional: show notification/toast for other groups
    // e.g. if (msg.group_id !== activeChat?.id) { show toast }
  };

  socket.on('group_message', handleGroupMessage);

  return () => {
    socket.off('group_message', handleGroupMessage);
  };
}, [socket, activeChat, dbUser]);

  const handleSendMessage = async (text, file) => {
  if (!socket || !activeChat || (!text?.trim() && !file)) return;

  const isGroupChat = activeChat.type === 'group';

  // ── 1. Handle new 1-on-1 chat creation (only for private chats) ─────────────
  let chatId = activeChat.id;

  if (!isGroupChat && chatId.startsWith('new_')) {
    try {
      const createRes = await api.post('/api/chats', {
        recipientId: activeChat.recipientId,
      });
      chatId = createRes.data.chat_id;
      setActiveChat(prev => ({ ...prev, id: chatId, type: '1on1' }));
    } catch (err) {
      console.error('Failed to create 1-on-1 chat:', err);
      alert('Failed to start conversation');
      return;
    }
  }

  // ── 1.5. Handle file upload ──────────────────────────────────────────────────
  let attachmentFileId = null;
  let attachmentName = null;
  let attachmentType = null;
  let attachmentUrl = null;

  if (file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/chats/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      attachmentFileId = res.data.file_id;
      attachmentName = file.name;
      attachmentType = file.type;
      attachmentUrl = URL.createObjectURL(file);
    } catch (err) {
      console.error("Upload failed:", err);
      alert('Failed to upload file');
      return;
    }
  }

  // ── 2. Prepare payload according to chat type ───────────────────────────────
  const payload = {
    // Common fields
    text: text?.trim() || null,
    senderId: dbUser?.id,
    senderUid: dbUser?.firebase_uid || dbUser?.uid,
    senderName: dbUser?.full_name || dbUser?.name || 'You',

    // Type-specific fields
    ...(isGroupChat
      ? { groupId: chatId }                 // group chat → send groupId
      : { chatId, recipientId: activeChat.recipientId }  // 1-on-1 → chatId + recipient
    ),

    // Attachments
    attachment_file_id: attachmentFileId,
    attachment_type: attachmentType,
    attachment_name: attachmentName,
  };

  // ── 3. Optimistic UI update ─────────────────────────────────────────────────
  const optimisticMessage = {
    text,
    created_at: new Date().toISOString(),
    sender_id: dbUser?.id,
    sender_name: dbUser?.full_name || 'You',
    isMyMessage: true,
    attachment_file_id: attachmentFileId,
    attachment_name: attachmentName,
    attachment_type: attachmentType,
    attachment_url: attachmentUrl,
    // Optional: group-specific fields for rendering
    ...(isGroupChat && { group_id: chatId }),
  };

  setMessages(prev => [...prev, optimisticMessage]);

  // ── 4. Emit the correct event with correct payload ───────────────────────────
  try {
    socket.emit('send_message', payload);
  } catch (err) {
    console.error('Socket emit failed:', err);
    // Optional: rollback optimistic message
    setMessages(prev => prev.filter(m => m.created_at !== optimisticMessage.created_at));
    alert('Failed to send message');
  }
};

  const handleCreateGroup = async () => {
  if (!groupName.trim()) return alert('Group name is required');

  setCreatingGroup(true);

  try {
    let payload = {
      name: groupName.trim(),
      description: groupDescription.trim() || null,
    };

    let endpoint = '/api/admingroups'; // default for manual

    if (addMode === 'college') {
      if (!selectedCollege) return alert('Please select a college');
      payload.college_id = selectedCollege;
      endpoint = '/api/admingroups/by-college';
    } else {
      // Manual mode
      if (selectedMembers.length === 0) return alert('Select at least one student');
      payload.studentIds = selectedMembers;
    }

    const res = await api.post(endpoint, payload);

    alert(`Group created successfully!\nAdded ${res.data.member_count || selectedMembers.length || '?'} students.`);

    setShowGroupModal(false);
    setGroupName('');
    setGroupDescription('');
    setSelectedCollege('');
    setSelectedMembers([]);
    setAddMode('college'); // reset to default
  } catch (err) {
    console.error('Group creation failed:', err);
    alert('Failed to create group: ' + (err.response?.data?.message || err.message));
  } finally {
    setCreatingGroup(false);
  }
};
// Fetch colleges when modal opens
useEffect(() => {
  if (showGroupModal) {
    setLoadingColleges(true);
    api.get('/api/admingroups/colleges')
      .then(res => setColleges(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingColleges(false));
  }
}, [showGroupModal]);

// Fetch colleges only when needed
useEffect(() => {
  if (showGroupModal && addMode === 'college') {
    setLoadingColleges(true);
    api.get('/api/admingroups/colleges')
      .then(res => setColleges(res.data))
      .catch(err => console.error('Failed to load colleges:', err))
      .finally(() => setLoadingColleges(false));
  }
}, [showGroupModal, addMode]);

// Fetch students only when needed for manual selection
useEffect(() => {
  if (showGroupModal && addMode === 'manual') {
    setLoadingStudents(true);
    api.get('/api/admin/users')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setStudents(list.filter(u => u.role === 'student' && u.status === 'active'));
      })
      .catch(err => console.error('Failed to load students:', err))
      .finally(() => setLoadingStudents(false));
  }
}, [showGroupModal, addMode]);

 return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 md:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b bg-white sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setShowGroupModal(true)}
            disabled={loadingChats || creatingGroup}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-3 rounded-lg font-medium shadow-sm transition-all transform hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={20} />
            Create New Group
          </button>
        </div>

        {loadingChats ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="flex-1 p-6 text-center text-red-600">{error}</div>
        ) : (
          <ChatList
            chats={chats}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            unreadCounts={unreadCounts}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          loadingMessages={loadingMessages}
        />
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Create New Student Group</h3>
              <button onClick={() => setShowGroupModal(false)}>
                <X size={24} className="text-gray-600 hover:text-gray-800" />
              </button>
            </div>

  
<div className="p-6 space-y-6">
  //Group Name 
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Group Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={groupName}
      onChange={e => setGroupName(e.target.value)}
      placeholder="e.g. B.Tech CSE 2025 Batch"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
      required
    />
  </div>

  //Description
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Description (optional)
    </label>
    <textarea
      value={groupDescription}
      onChange={e => setGroupDescription(e.target.value)}
      placeholder="Purpose, schedule, rules..."
      rows={4}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
    />
  </div>

  //New: Mode Toggle
  <div className="flex items-center gap-4">
    <label className="text-sm font-medium text-gray-700">
      Add students by:
    </label>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="addMode"
          value="college"
          checked={addMode === 'college'}
          onChange={() => setAddMode('college')}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500"
        />
        <span>College (auto-add all)</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="addMode"
          value="manual"
          checked={addMode === 'manual'}
          onChange={() => setAddMode('manual')}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500"
        />
        <span>Manual Selection</span>
      </label>
    </div>
  </div>

  //Conditional content based on mode 
  {addMode === 'college' ? (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select College <span className="text-red-500">*</span>
      </label>

      {loadingColleges ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading colleges...
        </div>
      ) : colleges.length === 0 ? (
        <p className="text-red-600">No colleges found in the system</p>
      ) : (
        <select
          value={selectedCollege}
          onChange={e => setSelectedCollege(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          required
        >
          <option value="">-- Choose a college --</option>
          {colleges.map(c => (
            <option key={c.college_id} value={c.college_id}>
              {c.name} ({c.student_count || 0} students)
            </option>
          ))}
        </select>
      )}

      <p className="mt-2 text-sm text-gray-500">
        All students from the selected college will be automatically added.
      </p>
    </div>
  ) : (
    // Manual mode – old checkbox list (keep your existing code here)
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Students <span className="text-red-500">*</span>
      </label>
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
        {loadingStudents ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <p className="text-red-600">No active students found</p>
        ) : (
          students.map(student => (
            <label key={student.user_id} className="flex items-center gap-3 p-3 hover:bg-white rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMembers.includes(student.user_id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedMembers([...selectedMembers, student.user_id]);
                  } else {
                    setSelectedMembers(selectedMembers.filter(id => id !== student.user_id));
                  }
                }}
                className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              />
              <span className="text-gray-900 font-medium">{student.full_name || student.name || student.email}</span>
            </label>
          ))
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {selectedMembers.length} student{selectedMembers.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  )}
</div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-5 flex justify-end gap-4">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                disabled={creatingGroup}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creatingGroup || !groupName.trim() || (addMode === 'college' && (!selectedCollege || loadingColleges)) || (addMode === 'manual' && selectedMembers.length === 0)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingGroup && <Loader2 className="h-5 w-5 animate-spin" />}
                {creatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithStudents;*/}


/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/pages/admin/ChatWithStudents.jsx
// src/pages/admin/ChatWithStudents.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/pages/admin/ChatWithStudents.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, X, Loader2, Search } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import api from '../../api/axios';

const ChatWithStudents = () => {
  const { socket, dbUser, unreadCounts, markChatRead, handleSetActiveChat } = useSocket();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState(null);

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // ── Group modal ─────────────────────────────────────────────────────────────
  const [addMode, setAddMode] = useState('college'); // 'college' | 'manual'
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchExecuted = useRef(false);

  // ── Fetch groups ────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoadingChats(true);
      setError(null);

      const groupsRes = await api.get('/api/admingroups');
      const adminGroups = groupsRes.data.map(g => ({
        id: g.group_id,
        type: 'group',
        name: g.name,
        recipientName: g.name,
        lastMessage: 'Group chat',
        unread: 0,
        memberCount: g.member_count || 0,
        groupType: 'admin',
      }));

      setChats(adminGroups);
    } catch (err) {
      console.error('Failed to load admin groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoadingChats(false);
    }
  };

  // ── Fetch all messages for search ───────────────────────────────────────────
  const fetchAllMessages = async (chatList) => {
    const list = chatList || chats;
    if (!list.length) return;

    try {
      setLoadingSearch(true);
      const groupMessages = [];

      for (const chat of list) {
        try {
          const res = await api.get(`/api/admingroups/${chat.id}/messages`);
          const messagesWithChat = res.data.map(m => ({
            ...m,
            chat_id: chat.id,
            chat_name: chat.name,
          }));
          groupMessages.push(...messagesWithChat);
        } catch (err) {
          console.error(`Failed to load messages for group ${chat.id}:`, err);
        }
      }

      setAllMessages(groupMessages);
    } catch (err) {
      console.error('Failed to fetch all messages:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (fetchExecuted.current) return;
    fetchExecuted.current = true;
    fetchData();
  }, [unreadCounts]);

  // Lazy-load all messages once search panel opens
  useEffect(() => {
    if (showSearch && allMessages.length === 0 && chats.length > 0) {
      fetchAllMessages(chats);
    }
  }, [showSearch, chats]);

  // ── Search filter ───────────────────────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      setSearchResults([]);
      setGroupResults([]);
      return;
    }

    // Filter groups / contacts by name
    const matchedGroups = chats.filter(c =>
      c.name?.toLowerCase().includes(q)
    );
    setGroupResults(matchedGroups);

    // Filter messages by text
    if (allMessages.length > 0) {
      const matchedMsgs = allMessages
        .filter(msg => msg.text?.toLowerCase().includes(q))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setSearchResults(matchedMsgs);
    }
  }, [searchQuery, allMessages, chats]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        if (!searchQuery.trim()) setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // ── Socket: 1-on-1 messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      if (msg.chat_id === activeChat?.id) {
        setMessages(prev => [...prev, { ...msg, isMyMessage: msg.sender_id === dbUser?.id }]);
      }
    };
    socket.on('new_message', onNewMessage);
    return () => socket.off('new_message', onNewMessage);
  }, [socket, activeChat, dbUser]);

  // ── Socket: group messages ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleGroupMessage = (msg) => {
      if (msg.group_id === activeChat?.id) {
        setMessages(prev => [...prev, {
          ...msg,
          isMyMessage: msg.sender_id === dbUser?.id,
          sender_name: msg.sender_name || 'Unknown',
        }]);
      }
    };
    socket.on('group_message', handleGroupMessage);
    return () => socket.off('group_message', handleGroupMessage);
  }, [socket, activeChat, dbUser]);

  // ── Select chat ─────────────────────────────────────────────────────────────
  const handleSelectChat = async (chat) => {
    setActiveChat(chat);
    handleSetActiveChat(chat.id);
    markChatRead(chat.id);
    setLoadingMessages(true);
    setMessages([]);

    if (chat.id.startsWith('new_')) {
      setLoadingMessages(false);
      return;
    }

    try {
      let res;
      if (chat.type === 'group') {
        if (socket) {
          socket.emit('join_group', chat.id);
        }
        res = await api.get(`/api/admingroups/${chat.id}/messages`);
      } else {
        res = await api.get(`/api/chats/messages/${chat.id}`);
      }

      setMessages(
        res.data.map(m => ({
          ...m,
          isMyMessage: m.sender_id === dbUser?.id,
          sender_name: m.sender_name || 'Unknown',
        }))
      );
    } catch (err) {
      console.error('[Messages] Failed to load:', err);
      setError('Could not load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = async (text, file) => {
    if (!socket || !activeChat || (!text?.trim() && !file)) return;

    const isGroupChat = activeChat.type === 'group';
    let chatId = activeChat.id;

    if (!isGroupChat && chatId.startsWith('new_')) {
      try {
        const createRes = await api.post('/api/chats', { recipientId: activeChat.recipientId });
        chatId = createRes.data.chat_id;
        setActiveChat(prev => ({ ...prev, id: chatId, type: '1on1' }));
      } catch (err) {
        console.error('Failed to create 1-on-1 chat:', err);
        alert('Failed to start conversation');
        return;
      }
    }

    let attachmentFileId = null;
    let attachmentName = null;
    let attachmentType = null;
    let attachmentUrl = null;

    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/api/chats/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        attachmentFileId = res.data.file_id;
        attachmentName = file.name;
        attachmentType = file.type;
        attachmentUrl = URL.createObjectURL(file);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Failed to upload file');
        return;
      }
    }

    const payload = {
      text: text?.trim() || null,
      senderId: dbUser?.id,
      senderUid: dbUser?.firebase_uid || dbUser?.uid,
      senderName: dbUser?.full_name || dbUser?.name || 'You',
      ...(isGroupChat
        ? { groupId: chatId }
        : { chatId, recipientId: activeChat.recipientId }
      ),
      attachment_file_id: attachmentFileId,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    };

    const optimisticMessage = {
      text,
      created_at: new Date().toISOString(),
      sender_id: dbUser?.id,
      sender_name: dbUser?.full_name || 'You',
      isMyMessage: true,
      attachment_file_id: attachmentFileId,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
      attachment_url: attachmentUrl,
      ...(isGroupChat && { group_id: chatId }),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      socket.emit('send_message', payload);
    } catch (err) {
      console.error('Socket emit failed:', err);
      setMessages(prev => prev.filter(m => m.created_at !== optimisticMessage.created_at));
      alert('Failed to send message');
    }
  };

  // ── Create group ────────────────────────────────────────────────────────────
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert('Group name is required');
    setCreatingGroup(true);

    try {
      let payload = {
        name: groupName.trim(),
        description: groupDescription.trim() || null,
      };
      let endpoint = '/api/admingroups';

      if (addMode === 'college') {
        if (!selectedCollege) return alert('Please select a college');
        payload.college_id = selectedCollege;
        endpoint = '/api/admingroups/by-college';
      } else {
        if (selectedMembers.length === 0) return alert('Select at least one student');
        payload.studentIds = selectedMembers;
      }

      const res = await api.post(endpoint, payload);
      alert(`Group created successfully!\nAdded ${res.data.member_count || selectedMembers.length || '?'} students.`);

      setShowGroupModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedCollege('');
      setSelectedMembers([]);
      setAddMode('college');

      // Refresh chat list & reset message cache so search stays fresh
      fetchExecuted.current = false;
      setAllMessages([]);
      fetchData();
    } catch (err) {
      console.error('Group creation failed:', err);
      alert('Failed to create group: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingGroup(false);
    }
  };

  // Fetch colleges when modal opens or mode is 'college'
  useEffect(() => {
    if (showGroupModal && addMode === 'college') {
      setLoadingColleges(true);
      api.get('/api/admingroups/colleges')
        .then(res => setColleges(res.data))
        .catch(err => console.error('Failed to load colleges:', err))
        .finally(() => setLoadingColleges(false));
    }
  }, [showGroupModal, addMode]);

  // Fetch students when mode is 'manual'
  useEffect(() => {
    if (showGroupModal && addMode === 'manual') {
      setLoadingStudents(true);
      api.get('/api/admin/users')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : [];
          setStudents(list.filter(u => u.role === 'student' && u.status === 'active'));
        })
        .catch(err => console.error('Failed to load students:', err))
        .finally(() => setLoadingStudents(false));
    }
  }, [showGroupModal, addMode]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchPanel = showSearch && hasSearchQuery;

  const handleSearchResultClick = async (chatId) => {
    const chatToLoad = chats.find(c => c.id === chatId);
    if (chatToLoad) {
      setShowSearch(false);
      setSearchQuery('');
      await handleSelectChat(chatToLoad);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <div className="w-80 md:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">

        {/* Header */}
        <div className="p-4 border-b bg-white sticky top-0 z-10 shadow-sm space-y-3">
          <button
            onClick={() => setShowGroupModal(true)}
            disabled={loadingChats || creatingGroup}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600/10 text-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={20} />
            Create New Group
          </button>

          {/* Search bar */}
          <div ref={searchRef} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search groups or messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
            {hasSearchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Search results panel ── */}
        {showSearchPanel ? (
          <div className="flex-1 overflow-y-auto">
            {loadingSearch ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                {/* Group / contact matches */}
                {groupResults.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                      Groups
                    </div>
                    {groupResults.map(group => (
                      <div
                        key={group.id}
                        onClick={() => handleSearchResultClick(group.id)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 border-b transition-colors ${activeChat?.id === group.id ? 'bg-orange-50' : ''}`}
                      >
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-bold text-sm">
                            {group.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{group.name}</div>
                          <div className="text-xs text-gray-400">{group.memberCount} members</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message matches */}
                {searchResults.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                      Messages
                    </div>
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSearchResultClick(result.chat_id)}
                        className="p-4 border-b cursor-pointer hover:bg-orange-50 transition-colors"
                      >
                        <div className="font-semibold text-gray-900 text-sm mb-1">{result.chat_name}</div>
                        <div className="text-gray-600 text-sm line-clamp-2">{result.text || '(No text)'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(result.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {groupResults.length === 0 && searchResults.length === 0 && !loadingSearch && (
                  <div className="p-6 text-center text-gray-500">
                    No groups or messages found
                  </div>
                )}
              </>
            )}
          </div>
        ) : loadingChats ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="flex-1 p-6 text-center text-red-600">{error}</div>
        ) : chats.length === 0 ? (
          <div className="flex-1 p-6 text-center text-gray-500">
            No groups yet. Create one to get started!
          </div>
        ) : (
          <ChatList
            chats={chats}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            unreadCounts={unreadCounts}
          />
        )}
      </div>

      {/* ── Chat window ── */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          loadingMessages={loadingMessages}
        />
      </div>

      {/* ── Create Group Modal ── */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Create New Student Group</h3>
              <button onClick={() => setShowGroupModal(false)}>
                <X size={24} className="text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. B.Tech CSE 2025 Batch"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  placeholder="Purpose, schedule, rules..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium text-gray-700">Add students by:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="addMode" value="college"
                      checked={addMode === 'college'}
                      onChange={() => setAddMode('college')}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm">College (auto-add all)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="addMode" value="manual"
                      checked={addMode === 'manual'}
                      onChange={() => setAddMode('manual')}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm">Manual Selection</span>
                  </label>
                </div>
              </div>

              {/* College mode */}
              {addMode === 'college' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select College <span className="text-red-500">*</span>
                  </label>
                  {loadingColleges ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading colleges...
                    </div>
                  ) : colleges.length === 0 ? (
                    <p className="text-red-600">No colleges found in the system</p>
                  ) : (
                    <select
                      value={selectedCollege}
                      onChange={e => setSelectedCollege(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="">-- Choose a college --</option>
                      {colleges.map(c => (
                        <option key={c.college_id} value={c.college_id}>
                          {c.name} ({c.student_count || 0} students)
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    All students from the selected college will be automatically added.
                  </p>
                </div>
              ) : (
                /* Manual mode */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Students <span className="text-red-500">*</span>
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    {loadingStudents ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading students...
                      </div>
                    ) : students.length === 0 ? (
                      <p className="text-red-600">No active students found</p>
                    ) : (
                      students.map(student => (
                        <label key={student.user_id} className="flex items-center gap-3 p-3 hover:bg-white rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(student.user_id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedMembers(prev => [...prev, student.user_id]);
                              } else {
                                setSelectedMembers(prev => prev.filter(id => id !== student.user_id));
                              }
                            }}
                            className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                          />
                          <span className="text-gray-900 font-medium">
                            {student.full_name || student.name || student.email}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedMembers.length} student{selectedMembers.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-5 flex justify-end gap-4">
              <button
                onClick={() => setShowGroupModal(false)}
                disabled={creatingGroup}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={
                  creatingGroup ||
                  !groupName.trim() ||
                  (addMode === 'college' && (!selectedCollege || loadingColleges)) ||
                  (addMode === 'manual' && selectedMembers.length === 0)
                }
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingGroup && <Loader2 className="h-5 w-5 animate-spin" />}
                {creatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithStudents;