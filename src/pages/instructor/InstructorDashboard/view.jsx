import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Star,
  Plus,
  Folder,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Mail
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const InstructorDashboardView = ({ loading, userName, stats, navigate }) => {
  const performanceData = [];
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-4 font-sans text-primary-900">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Instructor Portal
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {userName}. Overview of your course performance.
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard
            title="My Courses"
            value={stats.myCourses}
            trend="Active"
            isPositive
            icon={<BookOpen size={20} />}
          />
          <KpiCard
            title="Total Students"
            value={stats.totalStudents}
            trend="12% vs last month"
            isPositive
            icon={<Users size={20} />}
          />
          <KpiCard
            title="Average Rating"
            value={stats.avgRating}
            trend="4.8 Target"
            isPositive={stats.avgRating >= 4}
            icon={<Star size={20} />}
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ENGAGEMENT TRENDS */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6 h-[380px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base">Engagement Trends</h3>
              <span className="text-xs text-indigo-600">Student Activity</span>
            </div>

            <div className="flex-1 border border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-sm">
              No engagement data available
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 h-[380px]">
            <h3 className="font-semibold text-base mb-6">Quick Actions</h3>

            <div className="space-y-4">
              <ActionButton
                icon={<Plus size={18} />}
                title="Create New Course"
                description="Start building content"
                onClick={() => navigate('/instructor/add-course')}
                color="indigo"
              />
              <ActionButton
                icon={<Folder size={18} />}
                title="Manage Courses"
                description="View and edit library"
                onClick={() => navigate('/instructor/courses')}
                color="amber"
              />
              <ActionButton
                icon={<MessageSquare size={18} />}
                title="Message Students"
                description="Broadcast announcements"
                onClick={() => navigate('/instructor/chat')}
                color="emerald"
              />
            </div>
          </div>
        </div>

        {/* STUDENT PERFORMANCE MATRIX */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="font-semibold text-base">Student Performance Matrix</h3>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter students..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b">
                <tr>
                  {['Student Name', 'Course', 'Progress', 'Avg. Score', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400">
                    No student data available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboardView;

/* ---------- SUB COMPONENTS ---------- */

const KpiCard = ({ title, value, trend, isPositive, icon }) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 h-[140px] flex flex-col justify-between">
    <div className="flex justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
        <h3 className="text-3xl font-semibold mt-1">{value}</h3>
      </div>
      <div className="text-slate-400">{icon}</div>
    </div>
    <div className="flex items-center gap-1.5 text-sm mt-3">
      {isPositive ? (
        <ArrowUpRight size={16} className="text-emerald-600" />
      ) : (
        <ArrowDownRight size={16} className="text-rose-600" />
      )}
      <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
        {trend}
      </span>
    </div>
  </div>
);

const ActionButton = ({ icon, title, description, onClick, color }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-sm transition"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="text-left">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </button>
  );
};
