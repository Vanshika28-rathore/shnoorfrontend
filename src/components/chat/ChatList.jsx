/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';

const ChatList = ({ chats, activeChat, onSelectChat, unreadCounts, currentUserId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null); // null = not searching
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const debounceRef = useRef(null);

    // Debounced search against backend
    const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
        setSearchResults(null);
        setIsSearching(false);
        return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
        console.log("🔍 Fetching search-contacts with query:", query);

        // ✅ Use api axios instance — same as StudentChat uses
        // This automatically uses the correct baseURL + auth token
        const res = await api.get('/api/chats/search-contacts', {
            params: { query }
        });

        console.log("🔍 Search results:", res.data);
        setSearchResults(res.data); // { users: [...], groups: [...] }

    } catch (err) {
        console.error('❌ Contact search error:', err.response?.data || err.message);
        setSearchError('Search failed. Try again.');
    } finally {
        setIsSearching(false);
    }
}, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!searchQuery.trim()) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }
        debounceRef.current = setTimeout(() => performSearch(searchQuery), 350);
        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, performSearch]);

    // ── Render helpers ────────────────────────────────────────────────────

    const renderAvatar = (name, photoUrl) => (
        <div className="contact-avatar">
            {photoUrl
                ? <img src={photoUrl} alt={name} className="w-full h-full object-cover rounded-full" />
                : (name?.charAt(0).toUpperCase() || 'U')
            }
        </div>
    );

    const renderSearchResults = () => {
        const { users = [], groups = [] } = searchResults || {};
        const hasResults = users.length > 0 || groups.length > 0;

        if (!hasResults) {
            return (
                <div className="no-chats">
                    <p>No contacts or groups found</p>
                </div>
            );
        }

        return (
            <>
                {users.length > 0 && (
                    <>
                        <div className="search-section-label">People</div>
                        {users.map(user => (
                            <div
                                key={user.user_id}
                                className="chat-contact-item"
                                onClick={() => {
                                    // If there's an existing chat, navigate to it
                                    // Otherwise caller handles creating a new chat
                                    onSelectChat({
                                        id: user.existing_chat_id || null,
                                        name: user.name,
                                        type: 'dm',
                                        recipientId: user.user_id,
                                        photo_url: user.photo_url,
                                        firebase_uid: user.firebase_uid,
                                        isNew: !user.existing_chat_id,
                                    });
                                    setSearchQuery('');
                                    setSearchResults(null);
                                }}
                            >
                                {renderAvatar(user.name, user.photo_url)}
                                <div className="contact-info">
                                    <div className="contact-header">
                                        <span className="contact-name">{user.name}</span>
                                        <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
                                    </div>
                                    <p className="last-message">{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {groups.length > 0 && (
                    <>
                        <div className="search-section-label">Groups</div>
                        {groups.map(group => (
                            <div
                                key={group.id}
                                className="chat-contact-item"
                                onClick={() => {
                                    onSelectChat({
                                        id: group.id,
                                        name: group.name,
                                        type: 'group',
                                        isMember: group.is_member,
                                    });
                                    setSearchQuery('');
                                    setSearchResults(null);
                                }}
                            >
                                <div className="contact-avatar">
                                    {group.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-header">
                                        <span className="contact-name">{group.name}</span>
                                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded uppercase font-bold">
                                            {group.is_member ? 'Joined' : 'Join'}
                                        </span>
                                    </div>
                                    <p className="last-message">{group.college}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </>
        );
    };

    const renderChatList = () => {
        if (chats.length === 0) {
            return (
                <div className="no-chats">
                    <p>No conversations yet</p>
                </div>
            );
        }

        return chats.map(chat => {
            const unreadCount = unreadCounts?.[chat.id] || 0;
            const isActive = activeChat?.id === chat.id;

            return (
                <div
                    key={chat.id}
                    data-type={chat.type}
                    className={`chat-contact-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectChat(chat)}
                >
                    <div className="contact-avatar">
                        {chat.photo_url
                            ? <img src={chat.photo_url} alt={chat.name} className="w-full h-full object-cover rounded-full" />
                            : (chat.name?.charAt(0).toUpperCase() || 'U')
                        }
                        {unreadCount > 0 && !isActive && (
                            <div className="unread-indicator"></div>
                        )}
                    </div>
                    <div className="contact-info">
                        <div className="contact-header">
                            <span className="contact-name">{chat.name}</span>
                            {unreadCount > 0 && !isActive && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </div>
                        {chat.type === 'group' && (
                            <span className="text-[10px] bg-cyan-100 text-cyan-600 px-1.5 rounded uppercase font-bold w-fit mb-1">
                                Group
                            </span>
                        )}
                        <p className="last-message">
                            {chat.lastMessage || 'No messages yet'}
                        </p>
                    </div>
                </div>
            );
        });
    };

    // ── Main render ───────────────────────────────────────────────────────

    const isInSearchMode = searchQuery.trim().length > 0;

    return (
        <div className="chat-list-panel min-h-0 flex flex-col">
            <div className="chat-search">
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
            type="text"
            placeholder="Search contacts & groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            style={{ paddingRight: isInSearchMode ? '32px' : undefined }}
        />
        {isInSearchMode && (
            <button
                style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '14px',
                    lineHeight: 1,
                    padding: '2px',
                }}
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                aria-label="Clear search"
            >
                ✕
            </button>
        )}
    </div>
</div>
            <div className="chat-contacts-list">
                {isInSearchMode ? (
                    isSearching ? (
                        <div className="no-chats"><p>Searching...</p></div>
                    ) : searchError ? (
                        <div className="no-chats"><p>{searchError}</p></div>
                    ) : searchResults ? (
                        renderSearchResults()
                    ) : null
                ) : (
                    renderChatList()
                )}
            </div>
        </div>
    );
};

export default ChatList;
