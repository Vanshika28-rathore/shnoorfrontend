/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import {
    LayoutGrid,
    Upload,
    List,
    Users,
    Trophy,
    Code,
    Map,
    BookOpen,
    MessageSquare,
    Settings,
    Menu,
    LogOut,
    UserCircle,
} from "lucide-react";
import markLogo from "../../../assets/shnoor_logo.png";

const InstructorLayoutView = ({
    location,
    isSidebarOpen,
    setIsSidebarOpen,
    InstructorName,
    handleLogout,
    handleNavigate,
    totalUnread,
    photoURL,
}) => {
    const NavItem = ({ path, icon: Icon, label, badgeCount }) => {
        const isActive = location.pathname.includes(path);
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
                onClick={() => handleNavigate(path ? `/instructor/${path}` : "#")}
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

    const SectionHeader = ({ title }) => (
        <li style={{ listStyle: 'none', padding: '0 8px', marginTop: '24px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                {title}
            </h3>
        </li>
    );

    return (
        <div className="flex min-h-screen font-sans" style={{ background: '#D8E2EB' }}>
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsSidebarOpen(false)} />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{
                    width: '260px',
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                }}
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
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        <SectionHeader title="Academic Ops" />
                        <NavItem path="dashboard" icon={LayoutGrid} label="Dashboard" />
                        <NavItem path="add-course" icon={Upload} label="Add Course" />

                        <SectionHeader title="Management" />
                        <NavItem path="courses" icon={List} label="My Courses" />
                        <NavItem path="learning-paths" icon={Map} label="Learning Paths" />
                        <NavItem path="practice" icon={Code} label="Practice Arena" />
                        <NavItem path="contests" icon={Trophy} label="Manage Contests" />
                        <NavItem path="exams" icon={BookOpen} label="Exams" />
                        <NavItem path="groups" icon={Users} label="My Groups" />
                        <NavItem path="chat" icon={MessageSquare} label="Messages" badgeCount={totalUnread} />

                        <SectionHeader title="Settings" />
                        <NavItem path="settings" icon={Settings} label="Settings" />
                    </ul>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[260px]' : 'ml-0'}`} style={{ background: '#D8E2EB' }}>
                {/* Header */}
                <header className="px-3 sm:px-5 md:px-8" style={{
                    background: '#fff', borderBottom: '1px solid #e2e8f0', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '8px', display: 'flex' }}
                            className="hover:bg-slate-100 transition-colors"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="hidden sm:block" style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                            Instructor Portal
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid #e2e8f0' }}>
                            <div className="hidden md:block" style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{InstructorName}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Instructor</div>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer' }}>
                                {photoURL ? (
                                    <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <UserCircle style={{ width: '100%', height: '100%', padding: '4px', color: '#94a3b8' }} />
                                )}
                            </div>
                            <button onClick={handleLogout} title="Logout"
                                style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: '8px', display: 'flex', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f1f5f9'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8" style={{ flex: 1, overflow: 'auto', background: '#D8E2EB' }}>
                    <div style={{ width: '100%', minWidth: 0 }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstructorLayoutView;