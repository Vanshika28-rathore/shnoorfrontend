import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import { Search, X, MessageSquare } from 'lucide-react';
import { formatChatTime } from '../../utils/chatDateTime';
import '../../styles/Chat.css';

const InstructorChat = () => {
  const { socket, dbUser, unreadCounts, handleSetActiveChat, markChatRead } = useSocket();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatsRes = await api.get('/api/chats');
        const existingChats = (chatsRes.data || []).map((c) => ({
          id: c.chat_id,
          name: c.recipient_name,
          recipientId: c.recipient_id,
          lastMessage: c.last_message || 'No messages yet',
          unread: c.unread_count,
          exists: true,
          type: 'dm',
        }));

        const studentsRes = await api.get('/api/chats/available-students');
        const allStudents = studentsRes.data || [];

        const mergedChats = [...existingChats];
        allStudents.forEach((student) => {
          const alreadyExists = existingChats.some((c) => c.recipientId === student.user_id);
          if (!alreadyExists) {
            mergedChats.push({
              id: `new_${student.user_id}`,
              name: student.full_name,
              recipientId: student.user_id,
              lastMessage: 'Start a conversation',
              unread: 0,
              exists: false,
              type: 'dm',
            });
          }
        });

        setChats(mergedChats);
      } catch (err) {
        console.error('Init Instructor Chat Error:', err);
      }
    };

    fetchData();
  }, [unreadCounts]);

  useEffect(() => {
    if (!socket) return;

    const refreshChats = async () => {
      try {
        const chatsRes = await api.get('/api/chats');
        const existingChats = (chatsRes.data || []).map((c) => ({
          id: c.chat_id,
          name: c.recipient_name,
          recipientId: c.recipient_id,
          lastMessage: c.last_message || 'No messages yet',
          unread: c.unread_count,
          exists: true,
          type: 'dm',
        }));

        const studentsRes = await api.get('/api/chats/available-students');
        const allStudents = studentsRes.data || [];

        const mergedChats = [...existingChats];
        allStudents.forEach((student) => {
          const alreadyExists = existingChats.some((c) => c.recipientId === student.user_id);
          if (!alreadyExists) {
            mergedChats.push({
              id: `new_${student.user_id}`,
              name: student.full_name,
              recipientId: student.user_id,
              lastMessage: 'Start a conversation',
              unread: 0,
              exists: false,
              type: 'dm',
            });
          }
        });

        setChats(mergedChats);
      } catch (err) {
        console.error(err);
      }
    };

    socket.on('new_notification', refreshChats);
    return () => socket.off('new_notification', refreshChats);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      const isMyMessage = msg.sender_id === dbUser?.id;

      if (activeChat && msg.chat_id === activeChat.id) {
        setMessages((prev) => [...prev, { ...msg, isMyMessage }]);
        api.put('/api/chats/read', { chatId: msg.chat_id });
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('new_message', handleReceive);
    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('new_message', handleReceive);
    };
  }, [socket, activeChat, dbUser]);

  const handleSelectChat = async (chat) => {
    let nextChat = { ...chat };
    let chatId = nextChat.id;

    if (!nextChat.exists) {
      try {
        const res = await api.post('/api/chats', { recipientId: nextChat.recipientId });
        chatId = res.data.chat_id;
        nextChat = { ...nextChat, id: chatId, exists: true };

        setChats((prev) =>
          prev.map((c) =>
            c.recipientId === nextChat.recipientId
              ? { ...c, id: chatId, exists: true }
              : c,
          ),
        );
      } catch (err) {
        console.error('Create chat error:', err);
        return;
      }
    }

    setActiveChat(nextChat);
    handleSetActiveChat(chatId);
    markChatRead(chatId);
    socket?.emit('join_chat', chatId);

    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/chats/messages/${chatId}`);
      setMessages(
        (res.data || []).map((m) => ({
          ...m,
          isMyMessage: m.sender_id === dbUser?.id,
        })),
      );
      await api.put('/api/chats/read', { chatId });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (text, file) => {
    if (!socket || !activeChat) return;

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
        return;
      }
    }

    const tempId = `temp-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        message_id: tempId,
        text,
        isMyMessage: true,
        created_at: new Date().toISOString(),
        attachment_file_id: attachmentFileId,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_url: attachmentUrl,
      },
    ]);

    socket.emit(
      'send_message',
      {
        chatId: activeChat.id,
        text,
        senderId: dbUser.id,
        senderUid: dbUser.firebase_uid,
        senderName: dbUser.full_name,
        recipientId: activeChat.recipientId,
        attachment_file_id: attachmentFileId,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
      },
      (serverMsg) => {
        if (!serverMsg) return;
        setMessages((prev) =>
          prev.map((m) => (m.message_id === tempId ? { ...serverMsg, isMyMessage: true } : m)),
        );
      },
    );
  };

  const handleSearchMessages = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);
    try {
      const res = await api.get('/api/chats/search', { params: { query } });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    try {
      let chat;
      if (result.type === 'dm') {
        let existingChat = chats.find((c) => c.id === result.chat_id);
        if (!existingChat) {
          existingChat = {
            id: result.chat_id,
            name: result.other_user_name,
            recipientId: result.sender_id === dbUser?.id ? result.receiver_id : result.sender_id,
            exists: true,
            type: 'dm',
          };
        }
        chat = existingChat;
      } else {
        return;
      }

      setShowSearchResults(false);
      setSearchQuery('');
      setSearchResults([]);

      await handleSelectChat(chat);
    } catch (err) {
      console.error('Error selecting search result:', err);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-360 mx-auto space-y-6 p-4 md:p-0">
      <div
        className="relative overflow-hidden rounded-2xl p-5 md:p-6 lg:p-8 shrink-0"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <MessageSquare size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Messages</h1>
              <p className="text-slate-400 text-sm mt-0.5">Connect with your students.</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearchMessages(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 focus:bg-white/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        ></div>
      </div>

      {showSearchResults && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          {searchLoading ? (
            <div className="p-4 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No messages found</div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <button
                  key={result.message_id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-4 py-3 hover:bg-slate-50 border border-slate-100 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-sm truncate">{result.other_user_name}</span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {result.created_at ? formatChatTime(result.created_at) : result.display_time || '-'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{result.message_text}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <div className={`chat-sidebar ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="chat-contacts-list">
              <ChatList chats={chats} activeChat={activeChat} onSelectChat={handleSelectChat} unreadCounts={unreadCounts} />
            </div>
          </div>
          <div className={`flex-1 min-w-0 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
            <ChatWindow
              socket={socket}
              activeChat={activeChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              loadingMessages={loadingMessages}
              currentUser={dbUser}
              onClose={() => setActiveChat(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorChat;
