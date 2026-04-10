import React from "react";
import { Outlet } from "react-router-dom";
import {
  UserCircle,
  LayoutGrid,
  LogOut,
  Settings,
  GraduationCap,
  CheckCircle,
  UserPlus,
  Users,
  Menu,
  Award,
  ShieldAlert,
  MessageSquare,
  Timer,
  Video,
  List,
} from "lucide-react";
import markLogo from "../../../assets/shnoor_logo.png";
import { useNavigate } from "react-router-dom";

const AdminLayoutView = ({
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
  adminName,
  handleNavigate,
  location,
  photoURL,
}) => {
  const navigate = useNavigate();

  const NavItem = ({ path, icon: Icon, label }) => {
    const isActive = location.pathname.includes(path);
    return (
      <li
        onClick={() => {
          handleNavigate(`/admin/${path}`);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '4px',
          background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
          fontWeight: isActive ? 600 : 500,
          fontSize: '14px',
          position: 'relative',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = '#fff';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
          }
        }}
      >
        {/* Active indicator bar — flush to left edge of li */}
        {isActive && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '20px',
            borderRadius: '0 4px 4px 0',
            background: '#818cf8',
          }} />
        )}
        <Icon
          size={18}
          style={{
            color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)',
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
        />
        <span className="tracking-tight">{label}</span>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ background: '#D8E2EB' }}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
          className="lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ═══ DARK SIDEBAR ═══ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <img
            src={markLogo}
            alt="SHNOOR"
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
              SHNOOR
            </div>
            <div style={{
              fontSize: '10px', fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '2px',
            }}>
              International LLC
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          {/* Main Menu */}
          <div style={{
            fontSize: '10px', fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '2px',
            padding: '0 8px', marginBottom: '12px',
          }}>
            Main Menu
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: '32px' }}>
            <NavItem path="dashboard" icon={LayoutGrid} label="Dashboard" />
            <NavItem path="add-manager" icon={Users} label="Add Manager" />
            <NavItem path="add-instructor" icon={GraduationCap} label="Add Instructor" />
            <NavItem path="add-student" icon={UserPlus} label="Add Student" />
          </ul>

          {/* Management */}
          <div style={{
            fontSize: '10px', fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '2px',
            padding: '0 8px', marginBottom: '12px',
          }}>
            Management
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <NavItem path="approve-users" icon={UserCircle} label="Approve Users" />
            <NavItem path="manage-users" icon={Users} label="Manage Users" />
            <NavItem path="manager-list" icon={List} label="Manager List" />
            <NavItem path="groups" icon={Users} label="Groups" />
            <NavItem path="approve-courses" icon={CheckCircle} label="Approve Courses" />
            <NavItem path="assign-course" icon={UserPlus} label="Assign Courses" />
            <NavItem path="exam-timers" icon={Timer} label="Grace Timers" />
            <NavItem path="group-messages" icon={MessageSquare} label="Group messages" />
            <NavItem path="messages" icon={MessageSquare} label="Messages" />
            <NavItem path="certificates" icon={Award} label="Certificates" />
            <NavItem path="settings" icon={Settings} label="Settings" />
          </ul>

          {/* Security */}
          <div style={{
            fontSize: '10px', fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '2px',
            padding: '0 8px', marginBottom: '12px', marginTop: '32px',
          }}>
            Security
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <NavItem path="proctoring" icon={Video} label="Live Proctoring" />
            <NavItem path="violations" icon={ShieldAlert} label="Violation Log" />
          </ul>
        </div>
      </div>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[260px]' : 'ml-0'}`}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}
      >
        {/* Top Header Bar */}
        <header className="px-3 sm:px-5 md:px-8" style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '8px', background: 'none', border: 'none',
                cursor: 'pointer', color: '#64748b',
                borderRadius: '8px', display: 'flex',
              }}
            >
              <Menu size={20} />
            </button>
            <h2 className="hidden sm:block" style={{
              fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0,
            }}>
              Admin Console
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              paddingLeft: '16px', borderLeft: '1px solid #e2e8f0',
            }}>
              <div className="hidden md:block" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{adminName}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Super Admin</div>
              </div>

              <div
                onClick={() => navigate("settings")}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #e2e8f0', overflow: 'hidden',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
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
                style={{
                  padding: '8px', background: 'none', border: 'none',
                  cursor: 'pointer', color: '#94a3b8',
                  borderRadius: '8px', display: 'flex', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8" style={{ flex: 1, overflow: 'auto', background: '#D8E2EB', minWidth: 0 }}>
          <div style={{ width: '100%', minWidth: 0 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayoutView;