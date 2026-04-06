import { io } from "socket.io-client";

let socket = null;

// Initialize socket connection
export const initializeSocket = (userId) => {
  if (socket?.connected) {
    console.log("🔌 Socket already connected");
    return socket;
  }

  const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    // Join user's private room
    socket.emit("join", userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("error", (error) => {
    console.error("⚠️ Socket error:", error);
  });

  socket.on("connect_error", (error) => {
    console.error("⚠️ Socket connection error:", error);
  });

  return socket;
};

// Get socket instance
export const getSocket = () => {
  return socket;
};

// Listen to notifications
export const onNotification = (callback) => {
  if (!socket) {
    console.warn("Socket not initialized");
    return;
  }

  socket.on("notification", (data) => {
    console.log("🔔 Notification received:", data);
    callback(data);
  });
};

// Cleanup
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
