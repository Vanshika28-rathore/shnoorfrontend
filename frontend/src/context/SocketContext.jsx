{/*import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [dbUser, setDbUser] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('default');

    const { currentUser } = useAuth();
    const activeChatRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const newSocket = io(API_URL, {
            withCredentials: true
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Request Browser Notification Permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Notification permission:', permission);
                setNotificationPermission(permission);
            });
        } else if ('Notification' in window) {
            console.log('🔔 Current notification permission:', Notification.permission);
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Fetch DB User ID & Join Room
    useEffect(() => {
        if (!socket || !currentUser) return;

        const initUser = async () => {
            try {
                const res = await api.get('/api/users/me');
                setDbUser(res.data);
                console.log('✅ DB User loaded:', res.data.id);

                // Join User Room
                socket.emit('join_user', res.data.id);

                // Initial fetch of unread counts
                const chatsRes = await api.get('/api/chats');
                const counts = {};
                chatsRes.data.forEach(chat => {
                    if (chat.unread_count > 0) {
                        counts[chat.chat_id] = chat.unread_count;
                    }
                });
                setUnreadCounts(counts);
                console.log('📊 Initial unread counts loaded');

            } catch (error) {
                console.error("❌ Failed to init chat user:", error);
            }
        };

        initUser();
    }, [socket, currentUser]); // Removed dbUser from here to prevent loops

    // Separate effect for Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notifData) => {
            console.log('🔔 Notification received:', notifData.text);
            const { chat_id, group_id, sender_name, text, sender_id } = notifData;
            const targetId = chat_id || group_id;

            // Don't notify if this is the active chat
            if (activeChatRef.current === targetId) {
                console.log('⏭️ Skipping notification - chat is active');
                return;
            }

            // Don't notify if we are the sender (sender_id is in notifData)
            // Note: we can access dbUser via state here, but we shouldn't trigger 
            // the effect based on it if we can avoid it. 
            // If sender_id matches the logged in user, skip.

            console.log('✅ Processing notification for:', targetId);

            // Play Sound
            try {
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.play().catch(() => { });
            } catch (e) { }

            // Browser Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    const n = new Notification(`${sender_name}${group_id ? ' (Group)' : ''}`, {
                        body: text || 'New message',
                        icon: '/logo.png',
                        tag: targetId,
                    });
                    n.onclick = () => { window.focus(); n.close(); };
                    setTimeout(() => n.close(), 5000);
                } catch (e) {
                    console.error("🔔 Notification error:", e);
                }
            }

            // Update Unread Count
            setUnreadCounts(prev => ({
                ...prev,
                [targetId]: (prev[targetId] || 0) + 1
            }));
        };

        socket.on('new_notification', handleNotification);
        console.log('👂 Listening for new_notification events');

        return () => {
            socket.off('new_notification', handleNotification);
        };

    }, [socket]); // Only depend on socket instance

    const handleSetActiveChat = (chatId) => {
        console.log('📌 Active chat set to:', chatId);
        activeChatRef.current = chatId;
    };

    const markChatRead = (chatId) => {
        console.log('✓ Marking chat as read:', chatId);
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[chatId];
            return newCounts;
        });
    };

    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    const value = {
        socket,
        dbUser,
        unreadCounts,
        totalUnread,
        setUnreadCounts,
        markChatRead,
        handleSetActiveChat
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
*/}

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();

  const [socket, setSocket] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  
   
    const dbUserRef = useRef(null);
    const socketRef = useRef(null);

  const activeChatRef = useRef(null);
  const socketInitialized = useRef(false);
  const reconnectAttempts = useRef(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /* -------------------- Notification Permission -------------------- */
  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setNotificationPermission);
    } else {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  /* -------------------- Socket Initialization -------------------- */
  useEffect(() => {
    if (authLoading || !currentUser || socketInitialized.current) return;

    socketInitialized.current = true;
    let newSocket;

    const connectSocket = async () => {
      try {
        const token = await currentUser.getIdToken();

        newSocket = io(API_URL, {
          auth: { token },
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        newSocket.on('connect', () => {
          console.log('[Socket] Connected:', newSocket.id);
          setSocketStatus('connected');
          reconnectAttempts.current = 0;
        });

        newSocket.on('connect_error', (err) => {
          console.error('[Socket] Connection error:', err.message);
          setSocketStatus('error');
          reconnectAttempts.current++;
        });

        newSocket.on('disconnect', (reason) => {
          console.warn('[Socket] Disconnected:', reason);
          setSocketStatus('disconnected');
        });

        setSocket(newSocket);
      } catch (err) {
        console.error('[SocketProvider] Auth failed:', err);
        setSocketStatus('auth-failed');
      }
    };

    connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
      socketInitialized.current = false;
    };
  }, [currentUser, authLoading, API_URL]);

  /* -------------------- Load DB User & Unread Counts -------------------- */
  useEffect(() => {
    if (!socket || !currentUser || socketStatus !== 'connected') return;

    const initUser = async () => {
      try {
        const res = await api.get('/api/users/me');
        setDbUser(res.data);

        socket.emit('join_user', res.data.id);

        const chatsRes = await api.get('/api/chats');
        const counts = {};
        chatsRes.data.forEach((c) => {
          if (c.unread_count > 0) {
            counts[c.chat_id] = c.unread_count;
          }
        });

        setUnreadCounts(counts);
        console.log('[Socket] Unread counts loaded');
      } catch (err) {
        console.error('[Socket] Failed to init user:', err);
      }
    };

    initUser();
  }, [socket, currentUser, socketStatus]);

  /* -------------------- Notification Listener -------------------- */
  useEffect(() => {
    if (!socket || !dbUser) return;

    const handleNotification = (data) => {
      const { chat_id, group_id, sender_id, sender_name, text } = data;
      const targetId = chat_id || group_id;

      // Skip active chat
      if (activeChatRef.current === targetId) return;

      // Skip self messages
      if (sender_id === dbUser.id) return;

      // Play sound
      try {
        new Audio(
          'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
        ).play();
      } catch {}

      // Browser notification
      if (notificationPermission === 'granted') {
        try {
          const n = new Notification(sender_name, {
            body: text || 'New message',
            icon: '/logo.png',
            tag: targetId,
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
          setTimeout(() => n.close(), 5000);
        } catch {}
      }

      // Update unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [targetId]: (prev[targetId] || 0) + 1,
      }));
    };

    socket.on('new_notification', handleNotification);
    return () => socket.off('new_notification', handleNotification);
  }, [socket, dbUser, notificationPermission]);

  /* -------------------- Helpers -------------------- */
  const handleSetActiveChat = useCallback((chatId) => {
    activeChatRef.current = chatId;
  }, []);

  const markChatRead = useCallback((chatId) => {
    setUnreadCounts((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
  }, []);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  /* -------------------- Context Value -------------------- */
  const value = useMemo(
    () => ({
      socket,
      dbUser,
      unreadCounts,
      totalUnread,
      setUnreadCounts,
      markChatRead,
      handleSetActiveChat,
      socketStatus,
    }),
    [socket, dbUser, unreadCounts, socketStatus]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
