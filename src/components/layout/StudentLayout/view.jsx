import React from "react";
import { Outlet } from "react-router-dom";
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
} from "lucide-react";
import markLogo from "../../../assets/just_logo.jpeg";
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

  const NavItem = ({ path, icon: Icon, label, badgeCount }) => {
    const isActive =
      location.pathname.includes(path) &&
      (path !== "courses" || !location.pathname.includes("dashboard"));

    return (
      <li
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
          transition: 'all 0.2s ease', marginBottom: '2px',
          background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
          fontWeight: isActive ? 600 : 500, fontSize: '14px',
          position: 'relative',
        }}
        onClick={() => { navigate(`/student/${path}`); setIsSidebarOpen(false); }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
      >
        {isActive && (
          <div style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '24px', borderRadius: '0 4px 4px 0', background: '#818cf8' }} />
        )}
        <Icon size={18} style={{ color: isActive ? '#818cf8' : 'rgba(255,255,255,0.45)', transition: 'color 0.2s', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{label}</span>
        {badgeCount > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
            {badgeCount}
          </span>
        )}
      </li>
    );
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ background: '#D8E2EB' }}>
      <NotificationToast notifications={toasts} onDismiss={onDismissToast} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* DARK SIDEBAR */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: '260px', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={markLogo} alt="SHNOOR" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>SHNOOR</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }}>International LLC</div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <NavItem path="dashboard" icon={TrendingUp} label="Dashboard" />
            <NavItem path="courses" icon={List} label="My Courses" />
            <NavItem path="mock-test" icon={ClipboardList} label="Mock Test" />
            <NavItem path="practice" icon={Code} label="Practice Arena" />
            <NavItem path="exams" icon={ClipboardList} label="Exams" />
            <NavItem path="contests" icon={Trophy} label="Weekly Contests" />
            <NavItem path="certificates" icon={Trophy} label="Certificates" />
            <NavItem path="groups" icon={Users} label="My Groups" />
            <NavItem path="chat" icon={MessageSquare} label="Messages" badgeCount={totalUnread} />
            <NavItem path="settings" icon={Settings} label="Settings" />
          </ul>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0', height: '64px', padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '8px', display: 'flex' }}
            >
              <Menu size={20} />
            </button>
            <h2 className="hidden sm:block" style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Student Portal
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  padding: '8px', borderRadius: '50%', border: '1px solid #e2e8f0',
                  background: '#f8fafc', cursor: 'pointer', display: 'flex', position: 'relative',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 'min(360px, calc(100vw - 24px))', maxHeight: 'calc(100vh - 96px)',
                  background: '#fff', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,.12)',
                  border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 50,
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', margin: 0 }}>Notifications</h3>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '10px' }}>
                        {notifications.length} New
                      </span>
                    </div>
                    {notifPermission === "default" && (
                      <button
                        onClick={onRequestPermission}
                        style={{ fontSize: '12px', width: '100%', padding: '6px', background: '#4f46e5', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                      >
                        🔔 Enable Desktop Notifications
                      </button>
                    )}
                    {notifPermission === "denied" && (
                      <div style={{ fontSize: '11px', color: '#ef4444', background: '#fef2f2', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', textAlign: 'center' }}>
                        ⚠️ System notifications blocked. Check browser settings.
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => { onDismiss(notif.id); if (notif.link) navigate(notif.link); setNotifOpen(false); }}
                          style={{ padding: '16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: '8px', height: '8px', marginTop: '6px', borderRadius: '50%', background: '#4f46e5', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: 0 }}>{notif.message}</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1 }}>Rank</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{rank}</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={14} style={{ color: '#4f46e5' }} />
              </div>
            </div>

            {/* XP Badge */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#92400e', padding: '6px 12px', borderRadius: '20px', border: '1px solid #fde68a', fontWeight: 700, fontSize: '13px' }}>
              <Star size={14} style={{ color: '#f59e0b' }} fill="#f59e0b" /> {xp} XP
            </div>

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid #e2e8f0' }}>
              <div className="hidden md:block" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{studentName}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Student</div>
              </div>
              <div
                onClick={() => navigate("settings")}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {photoURL ? (
                  <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle style={{ width: '100%', height: '100%', padding: '4px', color: '#94a3b8' }} />
                )}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: '8px', display: 'flex', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', background: '#D8E2EB', padding: '32px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <Outlet context={{ studentName, xp }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayoutView;
