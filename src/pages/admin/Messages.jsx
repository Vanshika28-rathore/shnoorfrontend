import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../auth/useAuth';
import ChatWindow from '../../components/chat/ChatWindow';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';

const AdminMessages = () => {
  const { socket, dbUser, unreadCounts, markChatRead, handleSetActiveChat } = useSocket();
  const { userRole } = useAuth();

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

  // Fetch manager contacts
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoadingChats(true);

        // Fetch existing chats with managers
        const chatsRes = await api.get('/api/chats');
        const existing = (chatsRes.data || []).map(c => ({
          id: c.chat_id,
          recipientName: c.recipient_name,
          recipientId: c.recipient_id,
          lastMessage: c.last_message || 'No messages yet',
          unread: c.unread_count,
          exists: true
        }));

        // Fetch all available managers
        const managersRes = await api.get('/api/users');
        const allManagers = (managersRes.data || []).filter(m => m.user_id !== dbUser?.id && m.role !== 'manager');

        // Merge: existing chats + managers without chat yet
        const merged = [...existing];
        allManagers.forEach(manager => {
          if (!existing.some(c => c.recipientId === manager.user_id)) {
            merged.push({
              id: `new_${manager.user_id}`,
              recipientName: manager.full_name,
              recipientId: manager.user_id,
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
        setError('Failed to load students/instructors');
        setLoadingChats(false);
      }
    };

    if (dbUser?.id) {
      fetchManagers();
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
      const res = await api.get(`/api/users?search=${query}`);
      setSearchResults((res.data || []).filter(m => m.user_id !== dbUser?.id && m.role !== 'manager'));
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Select chat
  const handleSelectChat = async (chat) => {
    setActiveChat(chat);
    handleSetActiveChat(chat.id);
    markChatRead(chat.id);
    setShowSearchResults(false);

    if (chat.exists) {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/api/chats/${chat.id}/messages`);
        setMessages(res.data.map(m => ({
          ...m,
          isMyMessage: m.sender_id === dbUser?.id
        })));
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    } else {
      setMessages([]);
    }
  };

  // Receive new messages
  useEffect(() => {
    if (!socket) return;
    const onReceive = (msg) => {
      if (activeChat?.id === msg.chat_id) {
        setMessages(prev => [...prev, {
          ...msg,
          isMyMessage: msg.sender_id === dbUser?.id
        }]);
        api.put('/api/chats/read', { chatId: msg.chat_id });
      }
    };

    socket.on('receive_message', onReceive);
    return () => socket.off('receive_message', onReceive);
  }, [socket, activeChat, dbUser]);

  // Send message
  const handleSendMessage = async (text) => {
    if (!activeChat || !text.trim()) return;

    try {
      const res = await api.post('/api/chats/send', {
        recipientId: activeChat.recipientId,
        message: text
      });

      const newMsg = {
        ...res.data,
        isMyMessage: true
      };

      setMessages(prev => [...prev, newMsg]);

      // Update chat list
      setChats(prev => prev.map(c =>
        c.id === activeChat.id
          ? { ...c, lastMessage: text, exists: true }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      {/* GRADIENT HEADER */}
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

      {/* CHAT CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Chat list sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
            {/* Search box */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search student or instructor..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
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

            {/* Search results or chat list */}
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={24} className="text-indigo-500 animate-spin mb-3" />
                  <p className="text-slate-400 text-sm">Loading conversations...</p>
                </div>
              ) : showSearchResults && searchQuery ? (
                // Show search results
                <div>
                  {loadingSearch ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={18} className="text-indigo-500 animate-spin" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(manager => (
                      <div
                        key={manager.user_id}
                        onClick={() => {
                          handleSelectChat({
                            id: `new_${manager.user_id}`,
                            recipientName: manager.full_name,
                            recipientId: manager.user_id,
                            lastMessage: 'Start a conversation',
                            unread: 0,
                            exists: false
                          });
                        }}
                        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${activeChat?.recipientId === manager.user_id ? 'bg-indigo-50/50' : ''}`}
                      >
                        <div className="font-semibold text-sm text-slate-700">{manager.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">{manager.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No students or instructors found
                    </div>
                  )}
                </div>
              ) : (
                // Show chat list
                <div>
                  {chats.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No messages yet
                    </div>
                  ) : (
                    chats.map(chat => (
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

          {/* Chat window */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeChat ? (
              <ChatWindow
                chat={activeChat}
                messages={messages}
                loading={loadingMessages}
                onSend={handleSendMessage}
                dbUser={dbUser}
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

export default AdminMessages;