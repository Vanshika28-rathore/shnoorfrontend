import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPaperclip, FaTimes, FaFileAlt, FaImage, FaVideo, FaSmile, FaEllipsisV, FaEdit, FaTrash, FaCheck, FaReply, FaSmileBeam, FaArrowLeft } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import GroupInfoDrawer from './GroupInfoDrawer';
import { formatChatTime } from '../../utils/chatDateTime';

const ChatWindow = ({
    socket,
    activeChat,
    messages,
    onSendMessage,
    loadingMessages,
    onUpdateMeetingLink,
    isCreator,
    onEditMessage,
    onDeleteMessage,
    isAdmin,
    currentUser,
    onLeaveGroup,
    onDeleteGroup,
    onReact,
    onRemoveReaction,
    onClose
}) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [newMeetingLink, setNewMeetingLink] = useState("");
    const endRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, file]);

    useEffect(() => {
        if (!socket || !activeChat) return;

        const handleTyping = (data) => {
            if (data.roomId === activeChat.id) {
                setTypingUser(data.userName);
            }
        };
        const handleStopTyping = (data) => {
            if (data.roomId === activeChat.id) {
                setTypingUser(null);
            }
        };

        socket.on('user_typing', handleTyping);
        socket.on('user_stop_typing', handleStopTyping);

        return () => {
            socket.off('user_typing', handleTyping);
            socket.off('user_stop_typing', handleStopTyping);
        };
    }, [socket, activeChat]);

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (!socket || !activeChat) return;

        socket.emit("typing", {
            roomId: activeChat.id,
            userName: currentUser?.name || "Someone",
            isGroup: activeChat.type === 'group'
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", {
                roomId: activeChat.id,
                isGroup: activeChat.type === 'group'
            });
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && !file) return;

        onSendMessage(text, file, replyingTo?.message_id);

        setText("");
        setFile(null);
        setShowEmoji(false);
        setReplyingTo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleMeetingSubmit = (e) => {
        e.preventDefault();
        onUpdateMeetingLink(newMeetingLink);
        setShowMeetingModal(false);
    };

    const handleEndMeeting = () => {
        if (window.confirm("Are you sure you want to end the meeting for everyone?")) {
            onUpdateMeetingLink(null);
        }
    };

    const handleGenerateMeetLink = () => {
        const uuid = crypto.randomUUID().substring(0, 13);
        setNewMeetingLink(`https://meet.jit.si/shnoor-v2-${uuid}`);
    };

    if (!activeChat) {
        return (
            <div className="chat-main no-chat-selected flex flex-col items-center justify-center bg-slate-50/30">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <FaSmile size={40} className="text-slate-200" />
                </div>
                <h3 className="text-slate-400 font-bold text-lg">Select a conversation</h3>
                <p className="text-slate-300 text-sm">Pick a contact or group to start chatting</p>
            </div>
        );
    }

    return (
        <div className="chat-main">
            <div
                className="chat-header flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white cursor-pointer select-none"
                onDoubleClick={() => onClose && onClose()}
                title="Double-click to close chat"
            >
                <div
                    className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        activeChat.type === 'group' && setShowGroupInfo(true);
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        onClose && onClose();
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-primary-900">{activeChat.name}</h3>
                        {activeChat.type === 'group' && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-tight border border-indigo-100">
                                Student Group
                            </span>
                        )}
                    </div>
                    {activeChat.type === 'group' && (
                        <span className="text-xs text-slate-400 font-medium tracking-tight flex items-center">
                            College Space
                            {activeChat.member_count ? (
                                <>
                                    <span className="mx-1.5 opacity-50">·</span>
                                    {activeChat.member_count} members
                                </>
                            ) : null}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onClose && onClose()}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Back to conversations"
                    >
                        <span className="hidden sm:inline"><FaTimes size={20} /></span>
                        <span className="sm:hidden"><FaArrowLeft size={18} /></span>
                    </button>
                    {activeChat.type === 'group' && (
                        <>
                            {activeChat.meeting_link ? (
                                <div className="flex items-center gap-2 transition-all">
                                    <a
                                        href={activeChat.meeting_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                                        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                                        title="Join active video call"
                                    >
                                        <FaVideo /> Join Meeting
                                    </a>
                                    {isCreator && (
                                        <button
                                            onClick={handleEndMeeting}
                                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100"
                                            title="End Meeting for everyone"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                isCreator && (
                                    <button
                                        onClick={() => setShowMeetingModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                                        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                                        title="Start a new meeting session"
                                    >
                                        <FaVideo /> Start Meeting
                                    </button>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {showMeetingModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-extrabold text-slate-800">Group Meeting</h4>
                            <button onClick={() => setShowMeetingModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 font-medium mb-6">Create a live link for your college peers to join.</p>

                        <div className="flex flex-col gap-3 mb-6">
                            <a
                                href="https://meet.google.com/new"
                                target="_blank"
                                className="text-center py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all"
                            >
                                🔗 Open Google Meet (to get a real link)
                            </a>
                        </div>

                        <form onSubmit={handleMeetingSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Paste Link Below</label>
                                <input
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                                    value={newMeetingLink}
                                    onChange={e => setNewMeetingLink(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateMeetLink}
                                    className="w-full mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline text-right"
                                >
                                    + Generate Instant Link (One-Click)
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowMeetingModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" className="flex-2 py-4 bg-primary-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all">Enable Link</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="chat-messages" onClick={() => setShowEmoji(false)}>
                {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-spin opacity-20"></div>
                            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:200ms]"></span>
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:400ms]"></span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-400 font-semibold">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center">
                            <FaSmile size={32} className="text-slate-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-600 font-semibold text-lg">No messages yet</p>
                            <p className="text-slate-400 text-sm mt-1">Start a conversation by sending a message</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const uniqueId = msg.message_id || `temp-${idx}`;
                        return (
                            <MessageItem
                                key={uniqueId}
                                messageId={uniqueId}
                                msg={msg}
                                showName={activeChat.type !== 'dm'}
                                onEdit={onEditMessage}
                                onDelete={onDeleteMessage}
                                onReply={() => setReplyingTo(msg)}
                                onReact={onReact}
                                onRemoveReaction={onRemoveReaction}
                                isAdmin={isAdmin}
                                currentUser={currentUser}
                            />
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            {/* File Preview */}
            {file && (
                <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between border-t-2 border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <FaFileAlt className="text-indigo-600" size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-700 font-semibold truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setFile(null); fileInputRef.current.value = ""; }} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove file"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className="chat-input-area relative">
                {typingUser && (
                    <div className="absolute -top-10 left-6 pointer-events-none">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:200ms]"></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:400ms]"></span>
                            </div>
                            <span className="text-[11px] font-bold italic">
                                {typingUser} is typing...
                            </span>
                        </div>
                    </div>
                )}

                {replyingTo && (
                    <div className="mx-4 mb-2 p-3 bg-white border-l-4 border-indigo-500 rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-100/50 animate-in slide-in-from-bottom-2 duration-300 ring-1 ring-slate-100">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <FaReply size={10} />
                                </div>
                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                                    Replying to {replyingTo.sender_name}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 truncate pl-1 border-l border-slate-200">{replyingTo.text || (replyingTo.attachment_file_id ? 'Attachment' : 'Message')}</p>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                )}

                {showEmoji && (
                    <div className="absolute bottom-16 left-4 z-50">
                        <EmojiPicker onEmojiClick={(em) => setText(prev => prev + em.emoji)} width={300} height={400} />
                    </div>
                )}

                <form className="chat-input-form items-center gap-3" onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className="text-indigo-500 hover:text-indigo-600 text-xl hover:scale-110 transition-transform"
                        onClick={() => setShowEmoji(!showEmoji)}
                        title="Add emoji"
                    >
                        <FaSmile />
                    </button>

                    <button
                        type="button"
                        className="text-indigo-500 hover:text-indigo-600 text-lg hover:scale-110 transition-transform"
                        onClick={() => fileInputRef.current.click()}
                        title="Attach file"
                    >
                        <FaPaperclip />
                    </button>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={handleTextChange}
                        className="flex-1"
                    />
                    <button type="submit" className="send-btn" disabled={!text.trim() && !file} title="Send message">
                        <FaPaperPlane />
                    </button>
                </form>
            </div>

            <GroupInfoDrawer
                chat={activeChat}
                isOpen={showGroupInfo}
                onClose={() => setShowGroupInfo(false)}
                onLeaveSuccess={onLeaveGroup}
                onDeleteSuccess={onDeleteGroup}
            />
        </div>
    );
};

const MessageItem = ({ messageId, msg, showName, onEdit, onDelete, onReply, onReact, onRemoveReaction, isAdmin, currentUser }) => {
    const isMe = msg.isMyMessage;
    const isTemp = typeof messageId === 'string' && messageId.startsWith('temp-');
    const canEdit = isMe && !isTemp && typeof onEdit === 'function';
    const canDelete = (isMe || isAdmin) && !isTemp && typeof onDelete === 'function';
    const showActions = !isTemp;

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.text || "");
    const [showMenu, setShowMenu] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const menuRef = useRef(null);

    const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
                setShowReactionPicker(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSaveEdit = () => {
        if (editText.trim() !== msg.text) {
            onEdit(messageId, editText);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        onDelete(messageId);
        setShowMenu(false);
    };

    const renderAttachment = () => {
        if (!msg.attachment_url && !msg.attachment_file_id) return null;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const url = msg.attachment_url || `${API_URL}/api/chats/media/${msg.attachment_file_id}`;
        const type = msg.attachment_type || 'file';

        if (type.includes('image')) {
            return <img src={url} alt="attachment" className="max-w-full rounded-lg mb-2 cursor-pointer max-h-60 object-cover" onClick={() => window.open(url, '_blank')} />;
        }
        if (type.includes('video')) {
            return <video src={url} controls className="max-w-full rounded-lg mb-2 max-h-60" />;
        }
        return (
            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-gray-100/50 rounded-lg mb-2 text-indigo-600 font-medium text-xs border border-indigo-100">
                <FaFileAlt /> {msg.attachment_name || "Download File"}
            </a>
        );
    };

    const renderReactions = () => {
        if (!msg.reactions || msg.reactions.length === 0) return null;

        const grouped = msg.reactions.reduce((acc, curr) => {
            if (!curr) return acc;
            acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
            return acc;
        }, {});

        return (
            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(grouped).map(([emoji, count]) => {
                    const hasReacted = msg.reactions.some(r => r.user_id === currentUser?.id && r.emoji === emoji);
                    return (
                        <button
                            key={emoji}
                            onClick={() => hasReacted ? onRemoveReaction(messageId) : onReact(messageId, emoji)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${hasReacted
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm scale-110'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                        >
                            <span>{emoji}</span>
                            <span className="opacity-80">{count}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const scrollToMessage = (msgId) => {
        if (!msgId) return;
        const el = document.getElementById(`msg-${msgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-indigo-50/50', 'ring-2', 'ring-indigo-500/20', 'duration-500');
            setTimeout(() => {
                el.classList.remove('bg-indigo-50/50', 'ring-2', 'ring-indigo-500/20');
            }, 2000);
        } else {
            console.warn(`Message ${msgId} not found in DOM`);
        }
    };

    if (msg.is_deleted) {
        return (
            <div id={`msg-${messageId}`} className={`message ${isMe ? 'sent' : 'received'} flex flex-col opacity-60 mb-1`}>
                {showName && !isMe && (
                    <div className="flex items-center gap-2 ml-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">{msg.sender_name}</span>
                        {msg.sender_role && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${msg.sender_role === 'admin' ? 'bg-amber-100 text-amber-700' :
                                msg.sender_role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                {msg.sender_role}
                            </span>
                        )}
                    </div>
                )}
                <div className="message-bubble bg-slate-100 text-slate-400 italic border border-slate-200 py-2 px-4 rounded-2xl">
                    <p className="m-0 text-xs flex items-center gap-1"><FaTrash size={10} /> This message was deleted</p>
                </div>
            </div>
        );
    }

    return (
        <div id={`msg-${messageId}`} className={`message ${isMe ? 'sent' : 'received'} flex flex-col group relative mb-2 max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
            {showName && !isMe && (
                <div className="flex items-center gap-2 ml-3 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{msg.sender_name}</span>
                    {msg.sender_role && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${msg.sender_role === 'admin' ? 'bg-amber-100 text-amber-700' :
                            msg.sender_role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                            {msg.sender_role}
                        </span>
                    )}
                </div>
            )}

            <div className={`flex items-start gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`message-bubble relative shadow-sm ${isEditing ? 'w-full' : ''} ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                    {/* Reply Context */}
                    {msg.reply_to_message_id && (
                        <div
                            onClick={() => scrollToMessage(msg.reply_to_message_id)}
                            className={`mb-2 p-2 rounded-lg border-l-4 text-[11px] min-w-[120px] cursor-pointer hover:bg-black/5 transition-all group/reply ${isMe ? 'bg-white/10 border-white/30 text-white/90' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className="font-black uppercase tracking-widest text-[9px] opacity-80">{msg.parent_message_sender_name}</p>
                                <FaReply className="opacity-0 group-hover/reply:opacity-50 transition-opacity" size={8} />
                            </div>
                            <p className="line-clamp-2 italic">{msg.parent_message_text || "Attachment"}</p>
                        </div>
                    )}

                    {renderAttachment()}

                    {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <input
                                className="w-full p-2 text-sm bg-indigo-500 text-white placeholder-white/50 border-none rounded-md outline-none focus:ring-2 focus:ring-white/20"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-2 py-1 text-[10px] font-bold uppercase text-white/70 hover:text-white">Cancel</button>
                                <button onClick={handleSaveEdit} className="px-3 py-1 bg-white text-indigo-600 rounded text-[10px] font-bold uppercase shadow-sm">Save</button>
                            </div>
                        </div>
                    ) : (
                        msg.text && (
                            <div className="relative">
                                <p className="m-0 text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {msg.is_edited && <span className={`text-[8px] italic opacity-50 block mt-1 ${isMe ? 'text-right' : ''}`}>(edited)</span>}
                            </div>
                        )
                    )}

                    {/* Quick Reactions Display */}
                    {renderReactions()}
                </div>

                {/* Hover Actions Menu */}
                {!isEditing && (
                    <div className={`flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 ${isMe ? 'items-end' : 'items-start'}`} ref={menuRef}>
                        <div className="flex items-center gap-1 bg-white shadow-lg border border-slate-100 p-1.5 rounded-full ring-1 ring-slate-900/5">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowReactionPicker(!showReactionPicker); }}
                                className={`p-1.5 rounded-full transition-all ${showReactionPicker ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                title="React"
                            >
                                <FaSmileBeam size={14} />
                            </button>
                            <button
                                onClick={onReply}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                                title="Reply"
                            >
                                <FaReply size={14} />
                            </button>
                            {(canEdit || canDelete) && (
                                <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all">
                                    <FaEllipsisV size={14} />
                                </button>
                            )}
                        </div>

                        {showReactionPicker && (
                            <div className="absolute bottom-full mb-3 right-0 md:right-auto bg-white shadow-2xl border border-slate-100 rounded-[28px] p-2 flex flex-col gap-2 animate-in zoom-in-75 slide-in-from-bottom-2 duration-200 z-[100] min-w-[200px]">
                                <div className="flex items-center gap-1.5 px-1">
                                    {commonEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => { if (!isTemp) { onReact(messageId, emoji); setShowReactionPicker(false); } }}
                                            className={`w-10 h-10 flex items-center justify-center text-xl transition-all rounded-full ${isTemp ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-50 hover:scale-125'}`}
                                            disabled={isTemp}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                    <div className="w-px h-6 bg-slate-200 mx-1" />
                                    <button
                                        onClick={() => setShowMenu('full-emoji')}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-full"
                                        title="Show all emojis"
                                    >
                                        <span className="text-xl font-bold">+</span>
                                    </button>
                                </div>
                                {showMenu === 'full-emoji' && !isTemp && (
                                    <div className="mt-2 scale-90 origin-top shadow-xl rounded-2xl overflow-hidden border border-slate-100">
                                        <EmojiPicker
                                            onEmojiClick={(em) => {
                                                if (!isTemp) {
                                                    onReact(messageId, em.emoji);
                                                    setShowReactionPicker(false);
                                                    setShowMenu(false);
                                                }
                                            }}
                                            width={280}
                                            height={350}
                                            navConfig={{ position: 'bottom' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {showMenu && showMenu !== 'full-emoji' && (
                            <div className="absolute top-full mt-2 bg-white shadow-2xl border border-slate-100 rounded-2xl overflow-hidden min-w-[140px] z-50 ring-1 ring-slate-900/5">
                                {canEdit && (
                                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FaEdit size={12} /></div> Edit
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={handleDelete} className="w-full px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg"><FaTrash size={12} /></div> Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={`text-[9px] mt-1 font-bold text-slate-400 flex items-center gap-1.5 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {formatChatTime(msg.created_at ?? msg.timestamp)}
                {isMe && <FaCheck size={8} className="text-indigo-400 opacity-50" />}
            </div>
        </div>
    );
};

export default ChatWindow;
