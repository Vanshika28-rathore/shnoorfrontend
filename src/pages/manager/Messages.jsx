import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../auth/useAuth';
import ChatWindow from '../../components/chat/ChatWindow';
import { Search, X, Loader2 } from 'lucide-react';
import '../../styles/Chat.css';

const ManagerMessages = () => {
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

  // Fetch manager contacts (admins only)
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

        // Fetch all available admins
        const adminsRes = await api.get('/api/users');
        const allAdmins = (adminsRes.data || []).filter(a => a.user_id !== dbUser?.id && a.role !== 'manager');

        // Merge: existing chats + admins without chat yet
        const merged = [...existing];
        allAdmins.forEach(admin => {
          if (!existing.some(c => c.recipientId === admin.user_id)) {
            merged.push({
              id: `new_${admin.user_id}`,
              recipientName: admin.full_name,
              recipientId: admin.user_id,
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
      setSearchResults((res.data || []).filter(a => a.user_id !== dbUser?.id && a.role !== 'manager'));
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
    <div className="chat-container" style={{ display: 'flex', height: '100%', gap: '16px' }}>
      {/* Chat list sidebar */}
      <div style={{
        width: '320px',
        background: '#fff',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Search box */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} />
            <input
              type="text"
              placeholder="Search student or instructor..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search results or chat list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingChats ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#94a3b8'
            }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : showSearchResults && searchQuery ? (
            // Show search results
            <div>
              {loadingSearch ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', display: 'inline' }} />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(admin => (
                  <div
                    key={admin.user_id}
                    onClick={() => {
                      handleSelectChat({
                        id: `new_${admin.user_id}`,
                        recipientName: admin.full_name,
                        recipientId: admin.user_id,
                        lastMessage: 'Start a conversation',
                        unread: 0,
                        exists: false
                      });
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: activeChat?.recipientId === admin.user_id ? '#f1f5f9' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeChat?.recipientId === admin.user_id ? '#f1f5f9' : 'transparent'}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                      {admin.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {admin.email}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No students or instructors found
                </div>
              )}
            </div>
          ) : (
            // Show chat list
            <div>
              {chats.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No messages yet
                </div>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: activeChat?.id === chat.id ? '#f1f5f9' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = activeChat?.id === chat.id ? '#f1f5f9' : 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                        {chat.recipientName}
                      </div>
                      {chat.unread > 0 && (
                        <span style={{
                          background: '#818cf8',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {chat.lastMessage}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat window */}
      {activeChat ? (
        <div style={{ flex: 1 }}>
          <ChatWindow
            chat={activeChat}
            messages={messages}
            loading={loadingMessages}
            onSend={handleSendMessage}
            dbUser={dbUser}
          />
        </div>
      ) : (
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          Select a student or instructor to start messaging
        </div>
      )}
    </div>
  );
};

export default ManagerMessages;
