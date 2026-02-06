import React from "react";
import { Outlet } from "react-router-dom";
import {
  List,
  Trophy,
  UserCircle,
  LogOut,
  TrendingUp,
  ClipboardList,
  Code,
  Menu,
  Settings,
  MessageSquare,
} from "lucide-react";
import markLogo from "../../../assets/just_logo.jpeg";

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
}) => {

  const NavItem = ({ path, icon: Icon, label, badgeCount = 0 }) => {
    const isActive = location.pathname.includes(`/student/${path}`);

    return (
      <li
        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 mt-1
          ${
            isActive
              ? "bg-primary-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        onClick={() => {
          navigate(`/student/${path}`);
          setIsSidebarOpen(false);
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <Icon className={isActive ? "text-white" : "text-slate-500"} />
          <span className="font-medium flex-1">{label}</span>

          {badgeCount > 0 && (
            <span className="bg-primary-900 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {badgeCount}
            </span>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        shadow-xl lg:shadow-none transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-100">
            <img
              src={markLogo}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="text-lg font-bold text-primary-900">
                SHNOOR
              </span>
              <p className="text-xs text-slate-500">International</p>
            </div>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <ul>
              <NavItem path="dashboard" icon={TrendingUp} label="Dashboard" />
              <NavItem path="courses" icon={List} label="My Courses" />
              <NavItem path="exams" icon={ClipboardList} label="Exams" />
              <NavItem path="certificates" icon={Trophy} label="Certificates" />
              <NavItem path="practice" icon={Code} label="Practice Arena" />
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

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/*  HEADER  */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 lg:px-8 
        flex items-center justify-between shadow-sm sticky top-0 z-30">

          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu />
            </button>

            <h2 className="text-xl font-semibold text-primary-900 hidden sm:block">
              Student Dashboard
            </h2>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">

              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-primary-900">
                  {studentName}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Student · {xp} XP
                </div>
              </div>

              <div
                onClick={() => navigate("/student/settings")}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center 
                justify-center text-slate-400 border border-slate-200 
                overflow-hidden cursor-pointer"
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-full h-full p-1" />
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-600 
                hover:bg-slate-100 rounded-lg transition"
                title="Logout"
              >
                <LogOut />
              </button>

            </div>
          </div>
        </header>

        {/* Pages */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8">
          <Outlet context={{ studentName, xp }} />
        </main>

      </div>
    </div>
  );
};

export default StudentLayoutView;
