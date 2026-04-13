import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import ChatWindow from '../../components/chat/ChatWindow';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManagerMessages = () => {
  const { socket, dbUser, markChatRead, handleSetActiveChat } = useSocket();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch existing DM chats + available contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingChats(true);
        setError(null);

        // Existing DM chats
        const chatsRes = await api.get('/api/chats');
        const existing = (chatsRes.data || []).map(c => ({
          id: c.chat_id,
          type: 'dm',
          name: c.recipient_name,
          recipientName: c.recipient_name,
          recipientId: c.recipient_id,
          lastMessage: c.last_message || 'No messages yet',
          unread: c.unread_count,
          exists: true
        }));

        // Potential contacts for manager DMs
        const usersRes = await api.get('/api/users/by-role');
        const allContacts = (usersRes.data || []).filter(
          (u) => u.user_id !== dbUser?.id && ['student', 'instructor'].includes(u.role)
        );

        // Merge existing chats + contacts without chat yet
        const merged = [...existing];
        allContacts.forEach(contact => {
          if (!existing.some(c => c.recipientId === contact.user_id)) {
            merged.push({
              id: `new_${contact.user_id}`,
              type: 'dm',
              name: contact.full_name,
              recipientName: contact.full_name,
              recipientId: contact.user_id,
              lastMessage: 'Start a conversation',
              unread: 0,
              exists: false
            });
          }
        });

        setChats(merged);
        setLoadingChats(false);
      } catch (err) {
        console.error('Failed to fetch students/instructors:', err);
        if (err?.response?.status === 403) {
          toast.error('Access denied: you do not have permission to view contacts.');
        }
        setError('Failed to load students/instructors');
        setLoadingChats(false);
      }
    };

    if (dbUser?.id) {
      fetchContacts();
    }
  }, [dbUser?.id]);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await api.get(`/api/users/by-role?search=${query}`);
      setSearchResults((res.data || []).filter(u => u.user_id !== dbUser?.id && ['student', 'instructor'].includes(u.role)));
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search failed:', err);
      if (err?.response?.status === 403) {
        toast.error('Access denied: you cannot search contacts.');
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // Select chat
  const handleSelectChat = async (chat) => {
    if (!chat) return;

    let nextChat = { ...chat, type: 'dm', name: chat.name || chat.recipientName };
    let chatId = nextChat.id;

    if (!nextChat.exists) {
      try {
        const res = await api.post('/api/chats', { recipientId: nextChat.recipientId });
        chatId = res.data.chat_id;
        nextChat = { ...nextChat, id: chatId, exists: true };
        setChats((prev) => prev.map((c) =>
          c.recipientId === nextChat.recipientId
            ? { ...c, id: chatId, exists: true, type: 'dm', name: c.name || c.recipientName }
            : c
        ));
      } catch (err) {
        console.error('Failed to create chat:', err);
        return;
      }
    }

    setActiveChat(nextChat);
    handleSetActiveChat(chatId);
    markChatRead(chatId);
    setShowSearchResults(false);

    if (socket) {
      socket.emit('join_chat', chatId);
    }

    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/chats/messages/${chatId}`);
      setMessages((res.data || []).map(m => ({
        ...m,
        isMyMessage: m.sender_id === dbUser?.id
      })));
      await api.put('/api/chats/read', { chatId });
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Receive new messages
  useEffect(() => {
    if (!socket) return;
    const onReceive = (msg) => {
      if (activeChat?.id && activeChat.id === msg.chat_id) {
        setMessages(prev => [...prev, {
          ...msg,
          isMyMessage: msg.sender_id === dbUser?.id
        }]);
        api.put('/api/chats/read', { chatId: msg.chat_id });
      }
    };

    socket.on('receive_message', onReceive);
    socket.on('new_message', onReceive);
    return () => {
      socket.off('receive_message', onReceive);
      socket.off('new_message', onReceive);
    };
  }, [socket, activeChat, dbUser]);

  // Send message
  const handleSendMessage = async (text, file) => {
    if (!socket || !activeChat || (!text?.trim() && !file)) return;

    let attachmentFileId = null;
    let attachmentName = null;
    let attachmentType = null;
    let attachmentUrl = null;

    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/api/chats/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachmentFileId = res.data.file_id;
        attachmentName = file.name;
        attachmentType = file.type;
        attachmentUrl = URL.createObjectURL(file);
      } catch (err) {
        console.error('Failed to upload attachment:', err);
        return;
      }
    }

    const tempId = `temp-${Date.now()}`;
    const outgoingText = text?.trim() || '';

    setMessages(prev => [...prev, {
      message_id: tempId,
      text: outgoingText,
      created_at: new Date().toISOString(),
      sender_id: dbUser?.id,
      sender_name: dbUser?.full_name || dbUser?.name || 'You',
      isMyMessage: true,
      attachment_file_id: attachmentFileId,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
      attachment_url: attachmentUrl
    }]);

    try {
      socket.emit('send_message', {
        chatId: activeChat.id,
        text: outgoingText,
        senderId: dbUser?.id,
        senderUid: dbUser?.firebase_uid,
        senderName: dbUser?.full_name || dbUser?.fullName || dbUser?.name,
        recipientId: activeChat.recipientId,
        attachment_file_id: attachmentFileId,
        attachment_name: attachmentName,
        attachment_type: attachmentType
      }, (serverMsg) => {
        if (!serverMsg) return;
        setMessages(prev => prev.map((m) =>
          m.message_id === tempId ? { ...serverMsg, isMyMessage: true } : m
        ));
      });

      setChats(prev => prev.map(c =>
        c.id === activeChat.id
          ? { ...c, lastMessage: outgoingText || 'Attachment', exists: true }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-360 mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <MessageSquare size={24} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Messages</h1>
            <p className="text-slate-400 text-sm mt-0.5">Chat with students and instructors.</p>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row h-full min-h-125">
          <div className={`w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search student or instructor..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={24} className="text-indigo-500 animate-spin mb-3" />
                  <p className="text-slate-400 text-sm">Loading conversations...</p>
                </div>
              ) : showSearchResults && searchQuery ? (
                <div>
                  {loadingSearch ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={18} className="text-indigo-500 animate-spin" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user.user_id}
                        onClick={() => {
                          const existingChat = chats.find((c) => c.recipientId === user.user_id && c.exists);
                          if (existingChat) {
                            handleSelectChat(existingChat);
                            return;
                          }
                          handleSelectChat({
                            id: `new_${user.user_id}`,
                            type: 'dm',
                            name: user.full_name,
                            recipientName: user.full_name,
                            recipientId: user.user_id,
                            lastMessage: 'Start a conversation',
                            unread: 0,
                            exists: false
                          });
                        }}
                        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${activeChat?.recipientId === user.user_id ? 'bg-indigo-50/50' : ''}`}
                      >
                        <div className="font-semibold text-sm text-slate-700">{user.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No students or instructors found
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {error && (
                    <div className="px-4 py-3 text-xs text-red-600 bg-red-50 border-b border-red-100">
                      {error}
                    </div>
                  )}

                  {chats.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No messages yet
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${activeChat?.id === chat.id ? 'bg-indigo-50/50 border-l-2 border-l-indigo-500' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-sm text-slate-700 truncate">{chat.recipientName}</div>
                          {chat.unread > 0 && (
                            <span className="bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 truncate">{chat.lastMessage}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col min-w-0 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
              <ChatWindow
                socket={socket}
                activeChat={activeChat}
                messages={messages}
                loadingMessages={loadingMessages}
                onSendMessage={handleSendMessage}
                currentUser={dbUser}
                onClose={() => setActiveChat(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerMessages;
