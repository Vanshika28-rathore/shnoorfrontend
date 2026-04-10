import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, X, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import ChatWindow from '../../components/chat/ChatWindow';
import api from '../../api/axios';
import { formatChatDateTime } from '../../utils/chatDateTime';
import '../../styles/Chat.css';

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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // ── Group modal ─────────────────────────────────────────────────────────────
  const [addMode, setAddMode] = useState('college'); // 'college' | 'manual'
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchExecuted = useRef(false);

  // ── Fetch groups ────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoadingChats(true);
      setError(null);

      // Fetch both admin chat groups and admin section groups with fallbacks
      const [adminGroupsRes, adminSectionGroupsRes] = await Promise.all([
        api.get('/api/admingroups').catch(err => {
          console.warn('Admin chat groups fetch failed:', err.response?.status);
          return { data: [] };
        }),
        api.get('/api/admin/groups').catch(err => {
          console.warn('Admin section groups fetch failed:', err.response?.status);
          return { data: [] };
        })
      ]);

      const adminGroups = (Array.isArray(adminGroupsRes.data) ? adminGroupsRes.data : []).map(g => ({
        id: g.group_id,
        type: 'group',
        name: g.name,
        recipientName: g.name,
        lastMessage: 'Group chat',
        unread: 0,
        memberCount: g.member_count || 0,
        groupType: 'admin-chat',
      }));

      const sectionGroups = (Array.isArray(adminSectionGroupsRes.data) ? adminSectionGroupsRes.data : []).map(g => ({
        id: g.group_id || g.id,
        type: 'group',
        name: g.group_name || g.name,
        recipientName: g.group_name || g.name,
        lastMessage: 'Group chat',
        unread: 0,
        memberCount: g.user_count || g.member_count || 0,
        groupType: 'admin-section',
      }));

      // Merge and deduplicate by group id
      const mergedMap = new Map();
      [...adminGroups, ...sectionGroups].forEach(g => {
        if (!mergedMap.has(g.id)) {
          mergedMap.set(g.id, g);
        }
      });

      const finalChats = Array.from(mergedMap.values());
      console.log('[ChatWithStudents] Fetched groups:', {
        adminChat: adminGroups.length,
        adminSection: sectionGroups.length,
        total: finalChats.length,
        groups: finalChats.map(g => ({ id: g.id, name: g.name, type: g.groupType }))
      });

      setChats(finalChats);
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
      const uniqueGroupIds = new Set();

      for (const chat of list) {
        try {
          // Determine correct endpoint based on group type
          let endpoint;
          if (chat.groupType === 'admin-section') {
            endpoint = `/api/chats/groups/${chat.id}/messages`;
          } else {
            endpoint = `/api/admingroups/${chat.id}/messages`;
          }

          const res = await api.get(endpoint);
          const messagesWithChat = (Array.isArray(res.data) ? res.data : []).map(m => ({
            ...m,
            chat_id: chat.id,
            chat_name: chat.name,
            groupType: chat.groupType,
          }));
          groupMessages.push(...messagesWithChat);
          uniqueGroupIds.add(chat.id);
        } catch (err) {
          console.error(`Failed to load messages for group ${chat.id}:`, err);
        }
      }

      // If we have fewer groups than expected, check if more groups exist
      if (list.length < 20) {
        try {
          const additionalAdminGroups = await api.get('/api/admingroups').catch(() => ({ data: [] }));
          const additionalSectionGroups = await api.get('/api/admin/groups').catch(() => ({ data: [] }));
          
          const allAdminGroups = Array.isArray(additionalAdminGroups.data) ? additionalAdminGroups.data : [];
          const allSectionGroups = Array.isArray(additionalSectionGroups.data) ? additionalSectionGroups.data : [];
          
          // Fetch messages from groups not yet in chats
          for (const g of allAdminGroups) {
            if (!uniqueGroupIds.has(g.group_id)) {
              try {
                const res = await api.get(`/api/admingroups/${g.group_id}/messages`);
                const messagesWithChat = (Array.isArray(res.data) ? res.data : []).map(m => ({
                  ...m,
                  chat_id: g.group_id,
                  chat_name: g.name,
                  groupType: 'admin-chat',
                }));
                groupMessages.push(...messagesWithChat);
              } catch (err) {
                console.error(`Failed to load messages for admin group ${g.group_id}:`, err);
              }
            }
          }

          for (const g of allSectionGroups) {
            if (!uniqueGroupIds.has(g.group_id || g.id)) {
              try {
                const res = await api.get(`/api/chats/groups/${g.group_id || g.id}/messages`);
                const messagesWithChat = (Array.isArray(res.data) ? res.data : []).map(m => ({
                  ...m,
                  chat_id: g.group_id || g.id,
                  chat_name: g.group_name || g.name,
                  groupType: 'admin-section',
                }));
                groupMessages.push(...messagesWithChat);
              } catch (err) {
                console.error(`Failed to load messages for section group ${g.group_id || g.id}:`, err);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch additional groups:', err);
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
      const isMyMessage = msg.sender_id === dbUser?.id;
      
      if (msg.chat_id === activeChat?.id) {
        // Message is for the active chat - add to messages and show subtle notification
        setMessages(prev => [...prev, { ...msg, isMyMessage }]);
      }
    };
    socket.on('new_message', onNewMessage);
    socket.on('receive_message', onNewMessage);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('receive_message', onNewMessage);
    };
  }, [socket, activeChat, dbUser, chats]);

  // ── Socket: group messages ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleGroupMessage = (msg) => {
      const isMyMessage = msg.sender_id === dbUser?.id;
      
      if (msg.group_id === activeChat?.id) {
        // Message is for the active group - add to messages and show subtle notification
        setMessages(prev => [...prev, {
          ...msg,
          isMyMessage,
          sender_name: msg.sender_name || 'Unknown',
        }]);
      }
    };
    socket.on('group_message', handleGroupMessage);
    return () => socket.off('group_message', handleGroupMessage);
  }, [socket, activeChat, dbUser, chats]);

  // ── Select chat ─────────────────────────────────────────────────────────────
  const handleSelectChat = async (chat) => {
    console.log('[ChatWithStudents] Selected chat:', { id: chat.id, name: chat.name, type: chat.type, groupType: chat.groupType });
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
        // Fetch from correct endpoint based on group type
        console.log('[ChatWithStudents] Fetching group messages - groupType:', chat.groupType);
        if (chat.groupType === 'admin-section') {
          console.log('[ChatWithStudents] Using /api/chats/groups endpoint');
          res = await api.get(`/api/chats/groups/${chat.id}/messages`);
        } else {
          console.log('[ChatWithStudents] Using /api/admingroups endpoint');
          res = await api.get(`/api/admingroups/${chat.id}/messages`);
        }
      } else {
        // FIX: was broken string concatenation — use proper template literal
        res = await api.get(`/api/chats/messages/${chat.id}`);
      }

      console.log('[ChatWithStudents] Messages loaded:', res.data.length);
      setMessages(
        res.data.map(m => ({
          ...m,
          isMyMessage: m.sender_id === dbUser?.id,
          sender_name: m.sender_name || 'Unknown',
        }))
      );
    } catch (err) {
      console.error('[Messages] Failed to load:', err.response?.status, err.response?.data || err.message);
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
      message_id: `temp-${Date.now()}`,
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
      socket.emit('send_message', payload, (serverMsg) => {
        if (!serverMsg) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === optimisticMessage.message_id ? { ...serverMsg, isMyMessage: true } : m
          )
        );
      });
    } catch (err) {
      console.error('Socket emit failed:', err);
      setMessages(prev => prev.filter(m => m.message_id !== optimisticMessage.message_id));
      alert('Failed to send message');
    }
  };

  // ── Create group ────────────────────────────────────────────────────────────
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert('Group name is required');
    // FIX: moved setCreatingGroup(true) before the early-return guards so it
    // isn't set when we return early (avoids stuck loading state)
    if (addMode === 'college' && !selectedCollege) return alert('Please select a college');
    if (addMode === 'manual' && (selectedMembers.length + selectedInstructors.length) === 0) {
      return alert('Select at least one student or instructor');
    }

    setCreatingGroup(true);

    try {
      let payload = {
        name: groupName.trim(),
        description: groupDescription.trim() || null,
      };
      let endpoint = '/api/admingroups';

      if (addMode === 'college') {
        payload.college_id = selectedCollege;
        payload.instructorIds = selectedInstructors;
        endpoint = '/api/admingroups/by-college';
      } else {
        payload.studentIds = selectedMembers;
        payload.instructorIds = selectedInstructors;
      }

      const res = await api.post(endpoint, payload);
      // FIX: was broken string concatenation — use proper template literal
      alert(`Group created successfully!\nAdded ${res.data.member_count || (selectedMembers.length + selectedInstructors.length) || '?'} members.`);

      setShowGroupModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedCollege('');
      setSelectedMembers([]);
      setSelectedInstructors([]);
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

  // Fetch users when modal opens
  useEffect(() => {
    if (showGroupModal) {
      setLoadingStudents(true);
      api.get('/api/admin/users')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : [];
          setStudents(list.filter(u => u.role === 'student' && u.status === 'active'));
          setInstructors(list.filter(u => u.role === 'instructor' && u.status === 'active'));
        })
        .catch(err => console.error('Failed to load users:', err))
        .finally(() => setLoadingStudents(false));
    }
  }, [showGroupModal]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchPanel = showSearch && hasSearchQuery;

  const renderChatItem = (chat) => {
    const unreadCount = unreadCounts?.[chat.id] || 0;
    const isActive = activeChat?.id === chat.id;

    return (
      <div
        key={chat.id}
        onClick={() => handleSelectChat(chat)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 border-b transition-colors ${isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
      >
        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-bold text-sm">
            {chat.name?.charAt(0).toUpperCase() || 'G'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-slate-700 text-sm truncate">{chat.name}</div>
            {unreadCount > 0 && !isActive && (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-bold w-fit mt-1">
            Group
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">{chat.lastMessage || 'No messages yet'}</div>
        </div>
      </div>
    );
  };

  const handleSearchResultClick = async (chatId) => {
    const chatToLoad = chats.find(c => c.id === chatId);
    if (chatToLoad) {
      setShowSearch(false);
      setSearchQuery('');
      await handleSelectChat(chatToLoad);
    } else {
      // Group not in chats list - try to fetch it from both endpoints
      try {
        let groupData = null;
        let groupType = null;

        // Try admin-chat endpoint first
        try {
          const res = await api.get(`/api/admingroups/${chatId}`);
          groupData = res.data;
          groupType = 'admin-chat';
        } catch (err) {
          // Try section groups endpoint
          const res = await api.get(`/api/chats/groups/${chatId}`);
          groupData = res.data;
          groupType = 'admin-section';
        }

        if (groupData) {
          const newChat = {
            id: chatId,
            type: 'group',
            name: groupData.name || groupData.group_name,
            recipientName: groupData.name || groupData.group_name,
            lastMessage: 'Group chat',
            unread: 0,
            memberCount: groupData.member_count || groupData.user_count || 0,
            groupType,
          };

          // Add to chats list
          setChats(prev => [...prev, newChat]);
          setShowSearch(false);
          setSearchQuery('');
          await handleSelectChat(newChat);
        }
      } catch (err) {
        console.error('Failed to find group:', chatId, err);
      }
    }
  };

  // ── Popup notifications for inactive chats/groups ─────────────────────────
  useEffect(() => {
    if (!socket || chats.length === 0) return;

    const showIncomingPopup = (msg = {}) => {
      const incomingSenderId = msg.sender_id ?? msg.senderId;
      if (incomingSenderId && incomingSenderId === dbUser?.id) return;

      const incomingChatId = msg.group_id ?? msg.groupId ?? msg.chat_id ?? msg.chatId;
      if (!incomingChatId) return;
      if (incomingChatId === activeChat?.id) return;

      const targetChat = chats.find((chat) => chat.id === incomingChatId);
      if (!targetChat) return;

      const popupId = `chat-popup-${
        msg.message_id || msg.id || `${incomingChatId}-${msg.created_at || msg.timestamp || Date.now()}`
      }`;

      toast.custom(
        (t) => (
          <div
            className="bg-white border-l-4 border-indigo-500 shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={async () => {
              toast.dismiss(t.id);
              await handleSelectChat(targetChat);
            }}
          >
            <p className="font-semibold text-gray-900">
              {msg.group_name || msg.groupName || msg.chat_name || targetChat.name || 'Group'}
            </p>
            <p className="text-gray-700 text-sm font-medium">
              {msg.sender_name || msg.senderName || 'User'}
            </p>
            <p className="text-gray-600 text-sm truncate">
              {msg.text || msg.message_text || '📎 Attachment'}
            </p>
          </div>
        ),
        {
          id: popupId,
          duration: 5000,
          position: 'top-right',
        }
      );
    };

    socket.on('group_message', showIncomingPopup);
    socket.on('receive_message', showIncomingPopup);
    socket.on('new_message', showIncomingPopup);

    return () => {
      socket.off('group_message', showIncomingPopup);
      socket.off('receive_message', showIncomingPopup);
      socket.off('new_message', showIncomingPopup);
    };
  }, [socket, chats, activeChat?.id, dbUser, handleSelectChat]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      {/* GRADIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <PlusCircle size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Group Messages</h1>
              <p className="text-slate-400 text-sm mt-0.5">Create and manage group conversations.</p>
            </div>
          </div>
          
          {/* Search and Create Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div ref={searchRef} className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 focus:bg-white/10 transition-all"
              />
              {hasSearchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowGroupModal(true)}
              disabled={loadingChats || creatingGroup}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98] whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
            >
              <PlusCircle size={16} />
              Create Group
            </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* MAIN CHAT LAYOUT */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
          {/* Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
            {showSearchPanel ? (
              <div className="flex-1 overflow-y-auto">
                {loadingSearch ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <>
                    {groupResults.length > 0 && (
                      <div>
                        <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b">
                          Groups
                        </div>
                        {groupResults.map(group => (
                          <div
                            key={group.id}
                            onClick={() => handleSearchResultClick(group.id)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 border-b transition-colors ${activeChat?.id === group.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                          >
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 font-bold text-sm">
                                {group.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-700 text-sm truncate">{group.name}</div>
                              <div className="text-xs text-slate-400">{group.memberCount} members</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div>
                        <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b">
                          Messages
                        </div>
                        {searchResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearchResultClick(result.chat_id)}
                            className="w-full p-4 border-b hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="font-semibold text-slate-700 text-sm mb-1">{result.chat_name}</div>
                            <div className="text-slate-500 text-sm line-clamp-2">{result.text || '(No text)'}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {formatChatDateTime(result.created_at)}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {groupResults.length === 0 && searchResults.length === 0 && !loadingSearch && (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No groups or messages found
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : loadingChats ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : error ? (
              <div className="flex-1 p-6 text-center text-red-600 text-sm">{error}</div>
            ) : chats.length === 0 ? (
              <div className="flex-1 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <PlusCircle size={24} className="text-slate-300" />
                </div>
                <div className="text-slate-400 font-medium text-sm">No groups yet.</div>
                <div className="text-xs text-slate-300 mt-1">Create one to get started!</div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {chats.map(renderChatItem)}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <ChatWindow
            socket={socket}
            activeChat={activeChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            loadingMessages={loadingMessages}
            onClose={() => setActiveChat(null)}
            isAdmin={true}
            currentUser={dbUser}
          />
        </div>
      </div>

    {/* ── Create Group Modal ── */}
    {showGroupModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-5 flex items-center justify-between z-10">
            <h3 className="text-xl font-bold text-gray-900">Create New Group</h3>
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
              <label className="text-sm font-medium text-gray-700">Group type:</label>
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Instructors (optional)
                  </label>
                  <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    {loadingStudents ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading instructors...
                      </div>
                    ) : instructors.length === 0 ? (
                      <p className="text-red-600">No active instructors found</p>
                    ) : (
                      instructors.map(instructor => (
                        <label key={instructor.user_id} className="flex items-center gap-3 p-3 hover:bg-white rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedInstructors.includes(instructor.user_id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedInstructors(prev => [...prev, instructor.user_id]);
                              } else {
                                setSelectedInstructors(prev => prev.filter(id => id !== instructor.user_id));
                              }
                            }}
                            className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                          />
                          <span className="text-gray-900 font-medium">
                            {instructor.full_name || instructor.name || instructor.email}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedInstructors.length} instructor{selectedInstructors.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Instructors
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    {loadingStudents ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading instructors...
                      </div>
                    ) : instructors.length === 0 ? (
                      <p className="text-red-600">No active instructors found</p>
                    ) : (
                      instructors.map(instructor => (
                        <label key={instructor.user_id} className="flex items-center gap-3 p-3 hover:bg-white rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedInstructors.includes(instructor.user_id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedInstructors(prev => [...prev, instructor.user_id]);
                              } else {
                                setSelectedInstructors(prev => prev.filter(id => id !== instructor.user_id));
                              }
                            }}
                            className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                          />
                          <span className="text-gray-900 font-medium">
                            {instructor.full_name || instructor.name || instructor.email}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedInstructors.length} instructor{selectedInstructors.length !== 1 ? 's' : ''} selected
                  </p>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Total selected: {selectedMembers.length + selectedInstructors.length} member{(selectedMembers.length + selectedInstructors.length) !== 1 ? 's' : ''}
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
                (addMode === 'manual' && (selectedMembers.length + selectedInstructors.length) === 0)
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