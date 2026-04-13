/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import "../../../styles/Dashboard.css";
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
        className={`relative mb-0.5 flex cursor-pointer items-center gap-3 rounded-[10px] px-4 py-2.5 text-sm transition-all ${isActive
          ? "bg-white/10 text-white font-semibold"
          : "text-white/65 font-medium hover:bg-white/10 hover:text-white"
          }`}
        onClick={() => handleNavigate(path ? `/instructor/${path}` : "#")}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-indigo-400" />
        )}
        <Icon size={18} className={isActive ? "shrink-0 text-indigo-400" : "shrink-0 text-white/45"} />
        <span className="flex-1 tracking-tight">{label}</span>
        {badgeCount > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
            {badgeCount}
          </span>
        )}
      </li>
    );
  };

  const SectionHeader = ({ title }) => (
    <li className="mb-2.5 mt-6 list-none px-2">
      <h3 className="m-0 text-[10px] font-bold uppercase tracking-[2px] text-white/30">{title}</h3>
    </li>
  );

  return (
    <div className="flex min-h-screen bg-slate-200 font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="m-0 list-none p-0">
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
            <NavItem
              path="chat"
              icon={MessageSquare}
              label="Messages"
              badgeCount={totalUnread}
            />

            <SectionHeader title="Settings" />
            <NavItem path="settings" icon={Settings} label="Settings" />
          </ul>
        </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "lg:ml-65" : "ml-0"}`}
        style={{ background: "#D8E2EB" }}
      >
        {/* Header */}
        <header className="sticky top-0 z-100 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <Menu size={22} />
            </button>
            <h2 className="hidden text-lg font-semibold text-slate-900 sm:block">Instructor Portal</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="hidden text-right md:block">
                <div className="text-sm font-semibold text-slate-900">{InstructorName}</div>
                <div className="text-[11px] font-medium text-slate-500">Instructor</div>
              </div>

              <div className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
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

        <main className="flex-1 overflow-auto bg-slate-200 p-4 md:p-8">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorLayoutView;
