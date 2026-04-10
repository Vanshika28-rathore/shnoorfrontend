import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import api from "../../../api/axios";
import { useSocket } from "../../../context/SocketContext";
import {
  initializeSocket,
  onNotification,
  disconnectSocket,
} from "../../../services/socket";
import StudentLayoutView from "./view";
import StudentBot from "../../StudentBot/StudentBot";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const isExamPage = location.pathname.includes("/student/exam/");
  const [studentName, setStudentName] = useState("");
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState("Novice");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Chat Unread Count
  const { unreadCounts } = useSocket();
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const [notifications, setNotifications] = useState([]);
  const [notifPermission, setNotifPermission] = useState(
    "Notification" in window ? Notification.permission : "default",
  );

  useEffect(() => {
    const handleResize = () => {
      // Keep current desktop state, same pattern as admin layout.
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) return undefined;

    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Push Subscription Logic
  const subscribeUserToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker Registered");

      // Helper to convert VAPID key
      const urlBase64ToUint8Array = (base64String) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const publicVapidKey =
        "BKwO75HycvnqB51-Jx6aCKHQ4yYIhnniMRAt83Ytgtrxvr7tjKF5sWW9i-79W31bEv9uY2MHX4PdL_NM6d8zm1E"; // TODO: Enviroment variable ideally, but hardcoding for speed/demo as per user context
      const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log("Push Subscription Object:", subscription);

      // Send to backend
      await api.post("/api/notifications/subscribe", { subscription });
      console.log("Attributes sent to server.");
    } catch (err) {
      console.error("Failed to subscribe to push:", err);
    }
  };

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === "granted") {
        new Notification("✅ Notifications Enabled", {
          body: "You will now receive global updates!",
          icon: "/shnoor_logo.png",
        });

        subscribeUserToPush();
      }
    } catch (error) {
      console.error("Permission request failed", error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/me");
        setStudentName(res.data.displayName || "Student");
        
        // Fetch XP and Rank from dashboard API for consistency
        try {
          const dashRes = await api.get("/api/student/dashboard");
          setXp(dashRes.data.xp || 0);
          const xpValue = dashRes.data.xp || 0;
          setRank(
            xpValue >= 500
              ? "Expert"
              : xpValue >= 200
                ? "Intermediate"
                : "Novice",
          );
        } catch (_) {
          // Fallback: use /users/me if dashboard endpoint fails
          setXp(res.data.xp || 0);
          const xpValue = res.data.xp || 0;
          setRank(
            xpValue >= 500
              ? "Expert"
              : xpValue >= 200
                ? "Intermediate"
                : "Novice",
          );
        }
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    if (currentUser) {
      fetchProfile();
      // Auto-subscribe if already granted (ensures SW is registered)
      if (Notification.permission === "granted") {
        subscribeUserToPush();
      }

      const socket = initializeSocket(currentUser.uid);

      onNotification((notification) => {
        console.log("🔔 Live notification received:", notification);
        console.log("Current Permission State:", Notification.permission);

        // Add to state immediately
        setNotifications((prev) => {
          // Avoid duplicates
          if (prev.find((n) => n.id === notification.id)) {
            return prev;
          }
          return [notification, ...prev];
        });

        // Add to Toasts (Transient)
        setToasts((prev) => [...prev, notification]);

        // Show OS notification
        if (Notification.permission === "granted") {
          console.log(
            "Attempting to create OS notification...",
            "Page Visibility:",
            document.visibilityState,
          );

          // Some browsers block notifications if the tab is focused.
          // We will try to send it anyway as per user request.
          try {
            // Create notification
            const title =
              notification.type === "STREAK_EXPIRED"
                ? "⚠️ Streak Expired"
                : "🎓 New Notification";
            const icon = "/shnoor_logo.png";

            // Use ServiceWorker registration if available (more reliable)
            if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                  body: notification.message,
                  icon: icon,
                  tag: notification.id, // Prevent duplicates
                });
              });
            } else {
              // Fallback to standard API
              const osNotif = new Notification(title, {
                body: notification.message,
                icon: icon,
              });
              osNotif.onclick = () => {
                window.focus();
                navigate(notification.link || "/student/dashboard");
              };
            }
          } catch (e) {
            console.error("OS Notification failed:", e);
          }
        } else {
          console.warn(
            "OS Notification skipped. Permission:",
            Notification.permission,
          );
        }
      });

      return () => disconnectSocket();
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/notifications");
        const unread = res.data.filter((n) => !n.is_read);

        setNotifications((prev) => {
          const prevIds = new Set(prev.map((n) => n.id));
          const newItems = unread.filter((n) => !prevIds.has(n.id));

          // Only update if there are actual changes
          if (newItems.length > 0 || unread.length < prev.length) {
            return unread;
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (currentUser) {
      fetchNotifications();
      // Poll every 10 seconds as fallback
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleDismissNotification = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Dismiss notification error:", err);
    }
  };

  const [toasts, setToasts] = useState([]);
  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
    <StudentLayoutView
      studentName={studentName}
      xp={xp}
      setXp={setXp}
      rank={rank}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      handleLogout={handleLogout}
      navigate={navigate}
      handleNavigate={handleNavigate}
      location={location}
      totalUnread={totalUnread}
      notifications={notifications}
      onDismiss={handleDismissNotification}
      notifPermission={notifPermission}
      onRequestPermission={requestNotifPermission}
      toasts={toasts}
      onDismissToast={handleDismissToast}
    />
          {!isExamPage && <StudentBot />}
</>
  );
};

export default StudentLayout;
