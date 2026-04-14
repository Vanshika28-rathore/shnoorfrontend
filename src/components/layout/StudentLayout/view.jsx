import React from "react";
import { Outlet } from "react-router-dom";
import "../../../styles/Dashboard.css";
import {
  List,
  Trophy,
  UserCircle,
  LogOut,
  Star,
  TrendingUp,
  ClipboardList,
  Code,
  Menu,
  Settings,
  MessageSquare,
  Award,
  Users,
  X,
} from "lucide-react";
import markLogo from "../../../assets/shnoor_logo.png";
import NotificationToast from "../../common/NotificationToast";
// import StudentBot from "../../../components/StudentBot/StudentBot";

const StudentLayoutView = ({
  studentName,
  xp,
  rank,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
  totalUnread,
  navigate,
  handleNavigate,
  location,
  photoURL,
  notifications,
  onDismiss,
  toasts,
  onDismissToast,
  notifPermission,
  onRequestPermission,
}) => {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifPanelRef = React.useRef(null);
  const notifButtonRef = React.useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // Kiosk Mode check: Only trigger full screen when actually inside an active exam session
  // e.g., `/student/mock-exam` or `/student/exam/1234`
  // But NOT `/student/exams` or `/student/mock-test`
  const isExamMode = /\/(mock-exam|exam\/[^/]+)\/?$/i.test(location.pathname);

  React.useEffect(() => {
    if (!notifOpen) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        notifPanelRef.current?.contains(target) ||
        notifButtonRef.current?.contains(target)
      ) {
        return;
      }
      setNotifOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notifOpen]);

  const NavItem = ({ path, icon: Icon, label, badgeCount }) => {
    const isActive =
      location.pathname.includes(path) &&
      (path !== "courses" || !location.pathname.includes("dashboard"));

    return (
      <li
        className={`relative mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${isActive
          ? "bg-white/10 text-white font-semibold"
          : "text-white/55 font-medium hover:bg-white/10 hover:text-white"
        }`}
        onClick={() => handleNavigate(path ? `/student/${path}` : "#")}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-indigo-400" />
        )}
        <Icon size={18} className={isActive ? "shrink-0 text-indigo-400" : "shrink-0 text-white/40"} />
        <span className="flex-1 tracking-tight">{label}</span>
        {badgeCount > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
            {badgeCount}
          </span>
        )}
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-200 font-sans">
      <NotificationToast notifications={toasts} onDismiss={onDismissToast} />
      
      {/* Hide Overlay in Exam Mode */}
      {!isExamMode && isSidebarOpen && (
        <div
          className="fixed inset-0 z-90 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Hide DARK SIDEBAR in Exam Mode */}
      {!isExamMode && (
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ width: "260px" }}
        >
          <div className="flex h-full shrink-0 flex-col border-r border-white/10 bg-linear-to-b from-slate-900 to-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
              <img
                src={markLogo}
                alt="SHNOOR"
                className="h-10 w-10 rounded-[10px] object-cover"
              />
              <div>
                <div className="text-base font-bold tracking-tight text-white">SHNOOR</div>
                <div className="text-[10px] font-semibold uppercase tracking-[2px] text-white/40">
                  International LLC
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="m-0 list-none p-0">
                <NavItem path="dashboard" icon={TrendingUp} label="Dashboard" />
                <NavItem path="courses" icon={List} label="My Courses" />
                <NavItem path="mock-test" icon={ClipboardList} label="Mock Test" />
                <NavItem path="practice" icon={Code} label="Practice Arena" />
                <NavItem path="exams" icon={ClipboardList} label="Exams" />
                <NavItem path="contests" icon={Trophy} label="Weekly Contests" />
                <NavItem path="certificates" icon={Trophy} label="Certificates" />
                <NavItem path="groups" icon={Users} label="My Groups" />
                <NavItem
                  path="chat"
                  icon={MessageSquare}
                  label="Messages"
                  badgeCount={totalUnread}
                />
                <NavItem path="settings" icon={Settings} label="Settings" />
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        className={`flex flex-1 min-w-0 flex-col overflow-hidden relative isolate transition-all duration-300 ${!isExamMode && isSidebarOpen ? "lg:ml-65" : "ml-0"}`}
      >
        {/* Hide Header in Exam Mode */}
        {!isExamMode && (
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 md:px-8">
            <div className="flex items-center gap-4">
              <button
                className="flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Toggle Menu"
              >
                <Menu size={20} />
              </button>
              <h2 className="hidden text-lg font-semibold text-slate-900 sm:block">Student Portal</h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  ref={notifButtonRef}
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex rounded-full border border-slate-200 bg-slate-50 p-2 transition-colors hover:bg-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {notifications.length > 0 && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full border border-white bg-red-500" />}
                </button>

                {notifOpen && (
                  <div
                    ref={notifPanelRef}
                    style={{
                      position: isMobile ? "fixed" : "absolute",
                      top: isMobile ? "76px" : "calc(100% + 8px)",
                      right: isMobile ? "12px" : 0,
                      left: isMobile ? "12px" : "auto",
                      width: isMobile ? "auto" : "min(360px, calc(100vw - 24px))",
                      maxHeight: isMobile
                        ? "min(70vh, calc(100vh - 96px))"
                        : "calc(100vh - 96px)",
                      background: "#fff",
                      borderRadius: "16px",
                      boxShadow: "0 12px 40px rgba(0,0,0,.12)",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      zIndex: 120,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #f1f5f9",
                        background: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "14px",
                            margin: 0,
                          }}
                        >
                          Notifications
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#eef2ff",
                              color: "#4f46e5",
                              padding: "2px 8px",
                              borderRadius: "10px",
                            }}
                          >
                            {notifications.length} New
                          </span>
                          {isMobile && (
                            <button
                              onClick={() => setNotifOpen(false)}
                              style={{
                                padding: "4px",
                                background: "transparent",
                                border: "none",
                                color: "#64748b",
                                display: "flex",
                                cursor: "pointer",
                              }}
                              aria-label="Close notifications"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      {notifPermission === "default" && (
                        <button
                          onClick={onRequestPermission}
                          style={{
                            fontSize: "12px",
                            width: "100%",
                            padding: "6px",
                            background: "#4f46e5",
                            color: "#fff",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          🔔 Enable Desktop Notifications
                        </button>
                      )}
                      {notifPermission === "denied" && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#ef4444",
                            background: "#fef2f2",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #fecaca",
                            textAlign: "center",
                          }}
                        >
                          ⚠️ System notifications blocked. Check browser settings.
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div
                          style={{
                            padding: "32px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: "14px",
                          }}
                        >
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              onDismiss(notif.id);
                              if (notif.link) navigate(notif.link);
                              setNotifOpen(false);
                            }}
                            style={{
                              padding: "16px",
                              borderBottom: "1px solid #f8fafc",
                              cursor: "pointer",
                              display: "flex",
                              gap: "12px",
                              alignItems: "flex-start",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                marginTop: "6px",
                                borderRadius: "50%",
                                background: "#4f46e5",
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <p
                                style={{
                                  fontSize: "13px",
                                  color: "#334155",
                                  lineHeight: 1.5,
                                  margin: 0,
                                }}
                              >
                                {notif.message}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "#94a3b8",
                                  marginTop: "4px",
                                }}
                              >
                                {new Date(notif.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Rank Badge */}
              <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase leading-none tracking-wider text-slate-400">Rank</span>
                  <span className="text-sm font-bold text-slate-900">{rank}</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                  <Trophy size={14} className="text-indigo-600" />
                </div>
              </div>

              {/* XP Badge */}
              <div className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[13px] font-bold text-amber-800 md:flex">
                <Star size={14} className="text-amber-500" fill="#f59e0b" />
                {xp} XP
              </div>

              {/* Profile */}
              <div className="flex min-w-0 items-center gap-3 border-l border-slate-200 pl-4">
                <div className="hidden text-right md:block">
                  <div className="text-sm font-semibold text-slate-900">{studentName}</div>
                  <div className="text-[11px] font-medium text-slate-500">Student</div>
                </div>
                <div
                  onClick={() => navigate("settings")}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100"
                >
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-full w-full p-1 text-slate-400" />
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Main Padding for Kiosk Mode */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: "#D8E2EB",
            padding: isExamMode ? 0 : "clamp(16px, 3vw, 32px)",
            width: isExamMode ? "100%" : "auto",
            height: isExamMode ? "100vh" : "auto",
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <Outlet context={{ studentName, xp }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayoutView;