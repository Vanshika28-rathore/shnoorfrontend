import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
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
    const dbUserRef = useRef(null);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL;
        console.log('Initializing socket connection to:', API_URL);
        const newSocket = io(API_URL, {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully! Socket ID:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            console.log('Closing socket connection');
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
                setNotificationPermission(permission);
            });
        } else if ('Notification' in window) {
            console.log('Current notification permission:', Notification.permission);
            setNotificationPermission(Notification.permission);
        }
    }, []);

    useEffect(() => {
        if (!socket || !currentUser) {

            return;
        }



        const initUser = async () => {
            try {
                const res = await api.get('/api/users/me');
                setDbUser(res.data);


                socket.emit('join_user', res.data.id);


                fetchUnreadCounts();

            } catch (error) {
                console.error("❌ Failed to init chat user:", error);
            }
        };

        const fetchUnreadCounts = async () => {
            try {
                const res = await api.get('/api/chats');
                const counts = {};
                res.data.forEach(chat => {
                    if (chat.unread_count > 0) {
                        counts[chat.chat_id] = chat.unread_count;
                    }
                });
                setUnreadCounts(counts);

            } catch (err) {
                console.error("Failed to fetch unread counts", err);
            }
        };

        initUser();

        const handleNotification = (notifData) => {

            const { chat_id, sender_name, text, sender_id } = notifData;



            if (activeChatRef.current === chat_id) {

                return;
            }

            if (sender_id === dbUserRef.current?.id) {

                return;
            }

            setUnreadCounts(prev => {
                const newCounts = {
                    ...prev,
                    [chat_id]: (prev[chat_id] || 0) + 1
                };

                return newCounts;
            });



            if (!document.hidden) {

                // Play sound for in-app notification too
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) {
                        const ctx = new AudioContext();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(880, ctx.currentTime);
                        gain.gain.setValueAtTime(0, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.5);
                    }
                } catch (e) {
                    console.error('Sound error:', e);
                }

                // Show Toast
                toast((t) => (
                    <div onClick={() => {
                        window.location.href = `/student/chat`; // Basic redirect, ideally use navigate
                        toast.dismiss(t.id);
                    }} className="cursor-pointer">
                        <div className="font-bold text-sm">{sender_name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{text}</div>
                    </div>
                ), {
                    icon: '💬',
                    duration: 4000,
                    position: 'top-right'
                });

                return;
            }


            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, ctx.currentTime);

                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start();
                    osc.stop(ctx.currentTime + 0.5);

                }
            } catch (e) {
                console.error('Sound error:', e);
            }

            const canShowNotification = 'Notification' in window && Notification.permission === 'granted';


            if (canShowNotification) {
                try {
                    const notification = new Notification(sender_name, {
                        body: text || 'New message',
                        icon: '/just_logo.svg',
                        tag: chat_id,
                        requireInteraction: false
                    });



                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };

                    setTimeout(() => notification.close(), 5000);
                } catch (e) {
                    console.error("Notification error:", e);
                }
            } else {
                console.log('Cannot show notification. Permission:', Notification.permission);
            }


        };

        socket.on('new_notification', handleNotification);
        console.log('Registered listener for new_notification events on socket:', socket.id);

        return () => {
            console.log('Cleaning up new_notification listener');
            socket.off('new_notification', handleNotification);
        };

    }, [socket, currentUser]);

    const handleSetActiveChat = (chatId) => {

        activeChatRef.current = chatId;
    };

    const markChatRead = (chatId) => {

        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[chatId];
            return newCounts;
        });
    };

    const value = {
        socket,
        dbUser,
        unreadCounts,
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