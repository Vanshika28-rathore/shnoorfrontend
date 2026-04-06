import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';
import { useSocket } from '@context/useSocket';
import ChatWindow from '../../components/chat/ChatWindow';
import '../../styles/Chat.css';

const GroupChat = () => {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket, dbUser, handleSetActiveChat } = useSocket();
  const source = searchParams.get('source') || 'admin-chat';
  const isStudentSourceGroup = source === 'student-chat';
  const isAdminSectionGroup = source === 'admin-section';

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch group + messages
  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      if (!groupId || !dbUser?.id) return;

      try {
        setLoading(true);
        setError(null);

        let groupEndpoint, messageEndpoint;

        if (isStudentSourceGroup) {
          groupEndpoint = `/api/chats/groups/${groupId}`;
          messageEndpoint = `/api/chats/groups/${groupId}/messages`;
        } else if (isAdminSectionGroup) {
          groupEndpoint = `/api/admin/groups/my-groups/${groupId}`;
          messageEndpoint = `/api/chats/groups/${groupId}/messages`;
        } else {
          // admin-chat (default)
          groupEndpoint = `/api/admingroups/${groupId}`;
          messageEndpoint = `/api/admingroups/${groupId}/messages`;
        }

        const groupRes = await api.get(groupEndpoint);
        setGroup(groupRes.data);

        const msgRes = await api.get(messageEndpoint);
        setMessages(
          msgRes.data.map(msg => ({
            ...msg,
            isMyMessage: msg.sender_id === dbUser.id,
            senderName: msg.sender_name || 'Unknown',
            senderRole: msg.sender_role || 'user',
          }))
        );
      } catch (err) {
        console.error(err);
        setError('Failed to load group chat');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndMessages();
  }, [groupId, dbUser?.id, isStudentSourceGroup, isAdminSectionGroup]);

  // Socket join + listen
  useEffect(() => {
    if (!socket || !groupId) return;

    socket.emit('join_group', groupId);
    handleSetActiveChat(groupId);

    const handleNewMessage = (msg) => {
      setMessages(prev => [
        ...prev,
        {
          ...msg,
          isMyMessage: msg.sender_id === dbUser?.id,
          senderName: msg.sender_name || 'Unknown',
          senderRole: msg.sender_role || 'user',
        },
      ]);
    };

    socket.on('group_message', handleNewMessage);

    return () => {
      socket.emit('leave_group', groupId);
      handleSetActiveChat(null);
      socket.off('group_message', handleNewMessage);
    };
  }, [socket, groupId, dbUser?.id, handleSetActiveChat]);

  // Send message
  const handleSendMessage = async (text, file = null) => {
    if (!text.trim() && !file) return;

    let attachmentFileId = null;
    let attachmentName = null;
    let attachmentType = null;
    let attachmentUrl = null;

    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/api/chats/upload', formData);
        attachmentFileId = res.data.file_id;
        attachmentName = file.name;
        attachmentType = file.type;
        attachmentUrl = URL.createObjectURL(file);
      } catch {
        alert('File upload failed');
        return;
      }
    }

    const payload = {
      groupId,
      text: text.trim(),
      senderId: dbUser.id,
      senderUid: dbUser.firebase_uid,
      senderName: dbUser.full_name || 'You',
      attachment_file_id: attachmentFileId,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
    };

    const tempId = `temp-${Date.now()}`;

    // Optimistic UI
    setMessages(prev => [
      ...prev,
      {
        ...payload,
        message_id: tempId,
        created_at: new Date().toISOString(),
        sender_id: dbUser.id,
        sender_name: payload.senderName,
        sender_role: dbUser.role || 'user',
        isMyMessage: true,
        attachment_url: attachmentUrl,
      },
    ]);

    socket?.emit('send_message', payload, (serverMsg) => {
      if (!serverMsg) return;
      setMessages((prev) =>
        prev.map((m) => (m.message_id === tempId ? { ...serverMsg, isMyMessage: true } : m))
      );
    });
  };

  // ── STATES ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="chat-container no-chat-selected">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="chat-container no-chat-selected">
        <AlertCircle size={40} />
        <p>{error || 'Group not found'}</p>
        <Link to="/student/groups">Back to groups</Link>
      </div>
    );
  }

  // ── MAIN UI ─────────────────────────────────────────────

  return (
    <div className="student-chat-page p-4 bg-slate-50/20 min-h-screen">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          to="/student/groups"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm border border-gray-200"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Groups</span>
        </Link>
      </div>

      {/* Chat Container - matches StudentChat.jsx structure */}
      <div className="chat-container">
        <ChatWindow
          activeChat={{
            id: groupId,
            type: 'group',
            name: group.name,
            recipientName: group.name,
            member_count: group.member_count || 0,
          }}
          messages={messages}
          onSendMessage={handleSendMessage}
          loadingMessages={false}
          onClose={() => navigate('/student/groups')}
        />
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default GroupChat;
