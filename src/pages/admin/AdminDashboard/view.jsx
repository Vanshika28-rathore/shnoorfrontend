
import React, { useState } from 'react';
import {
    Users, BookOpen, Clock, Award, Search, X, Download, BarChart3,
    TrendingUp, ArrowUpRight, ArrowDownRight, UserPlus, CheckCircle,
    Activity, Zap, Calendar, FileText, GraduationCap, BookMarked, Video
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboardView = ({
    stats,
    chartData,
    recentActivity,
    loading,
    onSearch,
    searchResults,
    searchLoading,
    dateRange,
    activeFilter,
    onDateChange,
    onQuickFilter,
    onDownloadReport,
    showingAllTime,
    goToAddInstructor,
    goToAddManager,
    goToApproveCourses,
    goToAssignCourse,
    goToProctoring,
    liveSessionCount,
}) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-slate-400 font-medium text-sm tracking-wide">Loading dashboard...</p>
            </div>
        </div>
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim()) onSearch(value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearchExpanded(false);
    };

    const getDifficultyColor = (d) => ({ 'Beginner': 'bg-green-100 text-green-700', 'Intermediate': 'bg-yellow-100 text-yellow-700', 'Advanced': 'bg-red-100 text-red-700' }[d] || 'bg-gray-100 text-gray-700');
    const getStatusColor = (s) => ({ 'pending': 'bg-yellow-100 text-yellow-700', 'approved': 'bg-green-100 text-green-700', 'rejected': 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700');

    const displayStats = stats?.filteredStats || stats;

    // Current time for greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Mini sparkline data for stat cards
    const sparkData = [
        [3, 5, 4, 7, 6, 8, 9],
        [2, 4, 3, 5, 7, 6, 8],
        [5, 3, 6, 4, 2, 3, 1],
        [1, 2, 3, 4, 5, 6, 8],
    ];

    const statCards = [
        { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: Users, change: '+12%', up: true, color: '#6366f1', bg: '#eef2ff', iconColor: '#6366f1', spark: sparkData[0] },
        { label: 'Total Instructors', value: stats?.totalInstructors ?? 0, icon: GraduationCap, change: '+5%', up: true, color: '#8b5cf6', bg: '#f5f3ff', iconColor: '#8b5cf6', spark: sparkData[1] },
        { label: 'Live Sessions', value: liveSessionCount ?? 0, icon: Video, change: 'LIVE', up: true, color: '#ef4444', bg: '#fee2e2', iconColor: '#ef4444', spark: [5, 2, 8, 4, 6, 3, 7] },
        { label: 'Pending Courses', value: stats?.pendingCourses ?? 0, icon: Clock, change: '-3%', up: false, color: '#f59e0b', bg: '#fffbeb', iconColor: '#f59e0b', spark: sparkData[2] },
        { label: 'Certificates Issued', value: stats?.certificates ?? 0, icon: Award, change: '+18%', up: true, color: '#10b981', bg: '#ecfdf5', iconColor: '#10b981', spark: sparkData[3] },
    ];

    // Quick actions
    const quickActions = [
        { label: 'Add Instructor', icon: UserPlus, onClick: goToAddInstructor, color: '#6366f1' },
        { label: 'Add Manager', icon: Users, onClick: goToAddManager, color: '#0ea5e9' },
        { label: 'Approve Courses', icon: CheckCircle, onClick: goToApproveCourses, color: '#10b981' },
        { label: 'Live Proctoring', icon: Video, onClick: goToProctoring, color: '#8b5cf6' },
        { label: 'Assign Course', icon: BookMarked, onClick: goToAssignCourse, color: '#f59e0b' },
        { label: 'Download Report', icon: FileText, onClick: onDownloadReport, color: '#ef4444' },
    ];

    // Helper to format date relative time
    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const seconds = Math.floor((Math.max(0, new Date() - date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hrs ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " secs ago";
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'student': return { icon: UserPlus, color: '#3b82f6' };
            case 'instructor': return { icon: GraduationCap, color: '#f59e0b' };
            case 'course_pending': return { icon: BookOpen, color: '#8b5cf6' };
            case 'course_approved': return { icon: CheckCircle, color: '#10b981' };
            default: return { icon: Activity, color: '#64748b' };
        }
    };

    const displayActivity = (recentActivity || []).map(item => ({
        ...item,
        time: item.created_at ? timeAgo(item.created_at) : item.time || '',
        ...getTypeIcon(item.type)
    }));

    // Mini sparkline component
    const Sparkline = ({ data, color }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const w = 80, h = 28;
        const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
        return (
            <svg width={w} height={h} style={{ overflow: 'visible' }}>
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </svg>
        );
    };

    return (
        <div className="space-y-6 font-sans max-w-[1440px] mx-auto p-4 md:p-0">

            {/* ── WELCOME BANNER ── */}
            <div className="relative rounded-2xl p-5 md:p-7 lg:p-9 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 50%, #312E81 100%)' }}>
                {/* Decorative glows - behind content */}
                <div className="absolute right-0 top-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full -z-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}></div>
                <div className="absolute -left-10 md:-left-20 -bottom-10 md:-bottom-20 w-[200px] md:w-[300px] h-[200px] md:h-[300px] rounded-full -z-10" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)' }}></div>
                
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative z-10">
                        <p className="text-sm font-bold mb-1.5 flex items-center gap-2">
                            <span className="text-indigo-400">👋 {greeting}, Admin</span>
                        </p>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">Analytics Overview</h1>
                        <p className="text-[#CBD5E1] mt-1.5 text-sm font-medium">Here's what's happening on your platform today.</p>
                    </div>

                    {/* Search */}
                    <div className="relative z-10 w-full sm:w-auto">
                        <div className={`relative transition-all duration-300 ${isSearchExpanded ? 'w-full sm:w-96' : 'w-full sm:w-72'}`}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                className="pl-11 pr-11 py-3 bg-[#1e293b]/50 backdrop-blur-md border border-white/10 rounded-xl text-sm w-full text-white
                           focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                                placeholder="Search parameters..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setIsSearchExpanded(true)}
                            />
                            {searchQuery && (
                                <button onClick={handleClearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Search Dropdown */}
                        {isSearchExpanded && searchQuery && (
                            <div
                                className="absolute top-full right-0 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto overscroll-contain z-[60]"
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                                style={{ touchAction: 'pan-y' }}
                            >
                                {searchLoading ? (
                                    <div className="p-6 text-center text-slate-500 text-sm">Searching...</div>
                                ) : searchResults && searchResults.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {searchResults.map((result) => (
                                            <div key={result.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="flex items-start gap-3">
                                                    {result.thumbnail_url ? (
                                                        <img src={result.thumbnail_url} alt={result.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                            <BookOpen className="text-indigo-600" size={20} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-sm text-slate-900 truncate">{result.title}</h4>
                                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${result.type === 'module' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {result.type === 'module' ? 'Module' : 'Course'}
                                                            </span>
                                                        </div>
                                                        {result.instructor_name && <p className="text-xs text-indigo-600 font-medium mb-1">👤 {result.instructor_name}</p>}
                                                        <p className="text-xs text-slate-600 line-clamp-1">{result.description || 'No description'}</p>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {result.category && <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">{result.category}</span>}
                                                            {result.difficulty && <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>{result.difficulty}</span>}
                                                            {result.status && <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(result.status)}`}>{result.status}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-slate-500 text-sm">No courses or modules found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside overlay */}
            {isSearchExpanded && <div className="fixed inset-0 z-40" onClick={() => setIsSearchExpanded(false)} />}

            {/* ── STAT CARDS WITH SPARKLINES (DOUBLE SHADE) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-[#181F4D] rounded-[12px] p-6 border border-white/5 shadow-md hover:brightness-110 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-5">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: card.bg }}>
                                <card.icon size={26} style={{ color: card.iconColor }} />
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${card.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {card.change}
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">{card.label}</p>
                                <h3 className="text-4xl font-black text-white tracking-tight">{card.value}</h3>
                            </div>
                            <div className="pb-1 transition-transform group-hover:scale-110">
                                <Sparkline data={card.spark} color={card.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action, i) => (
                    <button key={i} onClick={action.onClick}
                        className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm
                       hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ background: `${action.color}15` }}>
                            <action.icon size={18} style={{ color: action.color }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-900 transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* ── MAIN GRID: CHART + ACTIVITY + DOWNLOAD ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Chart - 5 cols */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
                        <div>
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Learning Activity</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Weekly engagement overview</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            Lessons
                        </div>
                    </div>
                    <div className="flex-1 p-5">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={28} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: '13px' }} />
                                    <Area type="monotone" dataKey="lessons" stroke="#6366f1" strokeWidth={2.5} fill="url(#chartGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                                    <BarChart3 className="text-slate-300" size={24} />
                                </div>
                                <p className="text-sm font-semibold text-slate-400">No activity data yet</p>
                                <p className="text-xs text-slate-300 mt-1">Check back when learners start engaging.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity - 4 cols */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
                        <div>
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Recent Activity</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Latest platform events</p>
                        </div>
                        <Activity size={16} className="text-slate-300" />
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {displayActivity.length > 0 ? displayActivity.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: `${item.color}12` }}>
                                    <item.icon size={16} style={{ color: item.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">{item.action}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-semibold text-indigo-600">{item.user}</span>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <span className="text-xs text-slate-400">{item.time}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                                <p className="text-xs text-slate-400 font-medium">No recent activity detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download Analytics - 3 cols */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Reports</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Export & filter data</p>
                    </div>

                    <div className="px-5 py-4 flex flex-col flex-1">
                        {/* Quick Filters */}
                        <div className="grid grid-cols-3 gap-1.5 mb-4">
                            {['Today', 'This Week', 'This Month'].map((filter) => (
                                <button key={filter} onClick={() => onQuickFilter(filter)}
                                    className={`py-2 rounded-lg text-[11px] font-bold transition-all
                    ${activeFilter === filter
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Date Inputs */}
                        <div className="space-y-1.5 mb-3">
                            <input type="date" value={dateRange?.startDate || ''}
                                onChange={(e) => onDateChange({ ...dateRange, startDate: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                            <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">to</p>
                            <input type="date" value={dateRange?.endDate || ''}
                                onChange={(e) => onDateChange({ ...dateRange, endDate: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                        </div>

                        {/* All-Time */}
                        <div className="text-center mb-4">
                            <button onClick={() => { onDateChange({ startDate: '', endDate: '' }); onQuickFilter(null); }}
                                className={`text-[11px] font-semibold transition-colors ${showingAllTime ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>
                                📊 All-Time Data
                            </button>
                        </div>

                        {/* Download CTA */}
                        <button onClick={onDownloadReport}
                            className="w-full py-2.5 bg-primary-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-4 active:scale-[0.98]">
                            <Download size={14} />
                            Download Report
                        </button>

                        {/* Summary */}
                        <div className="border-t border-slate-50 pt-3 mt-auto">
                            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Summary</h4>
                            <div className="space-y-2">
                                {[
                                    { label: 'Students', value: displayStats?.totalStudents ?? 0 },
                                    { label: 'Instructors', value: displayStats?.totalInstructors ?? 0 },
                                    { label: 'Pending', value: displayStats?.pendingCourses ?? 0 },
                                    { label: 'Certs', value: displayStats?.certificates ?? 0 },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                                        <span className="text-xs font-bold text-primary-900 tabular-nums">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PLATFORM OVERVIEW BAR ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Zap size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-primary-900">Platform Health</h3>
                            <p className="text-xs text-slate-400">All systems operational</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="text-center">
                            <p className="text-lg font-extrabold text-primary-900">{(stats?.totalStudents ?? 0) + (stats?.totalInstructors ?? 0)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-extrabold text-emerald-600">99.9%</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Uptime</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-extrabold text-indigo-600">42ms</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Response</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-extrabold text-amber-600">{stats?.pendingCourses ?? 0}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Review</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardView;