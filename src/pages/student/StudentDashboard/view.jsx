/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
    BookOpen, Flame, Trophy, Play, Clock, ArrowRight, Zap, Search, X,
    Target, Award
} from 'lucide-react';

const StudentDashboardView = ({
    studentName,
    enrolledCount,
    lastCourse,
    gamification,
    recentActivity = [],
    deadlines = [],
    navigate,
    activeView = 'overview',
    onViewChange,
    onSearch,
    searchResults = [],
    searchLoading = false,
    freeCourses = [],
    paidCourses = [],
    recommendedCourses = []
}) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim()) {
            onSearch(value);
        } else {
            onSearch('');
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearchExpanded(false);
        onSearch('');
    };

    const handleCourseClick = (courseId) => {
        if (!courseId) return;
        navigate(`/student/course/${courseId}`);
        handleClearSearch();
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'Beginner': 'bg-green-100 text-green-700',
            'Intermediate': 'bg-yellow-100 text-yellow-700',
            'Advanced': 'bg-red-100 text-red-700'
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-700';
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const sparkData = [[2, 3, 5, 4, 6, 7, 8], [1, 3, 2, 5, 4, 6, 7], [4, 5, 6, 5, 7, 8, 9], [2, 4, 3, 5, 7, 6, 8]];

    const Sparkline = ({ data, color }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const w = 80, h = 28;
        const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
        return (
            <svg width={w} height={h} style={{ overflow: 'visible' }}>
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
        );
    };

    const statCards = [
        { label: 'Current Rank', value: gamification?.rank || '-', icon: Trophy, color: '#6366f1', spark: sparkData[0], sub: 'Top 15%' },
        { label: 'Daily Streak', value: `${gamification?.streak || 0}d`, icon: Flame, color: '#ef4444', spark: sparkData[1], sub: 'Keep it up!' },
        { label: 'XP Earned', value: gamification?.xp || 0, icon: Zap, color: '#f59e0b', spark: sparkData[2], sub: `${(gamification?.nextLevelXP || 100) - (gamification?.xp || 0)} to next` },
        { label: 'Enrolled', value: enrolledCount, icon: BookOpen, color: '#10b981', spark: sparkData[3], sub: 'Active courses' },
    ];

    const lastCourseProgress = Math.max(
        0,
        Math.min(100, Number(lastCourse?.progress || 0))
    );
    const lastModuleTitle = lastCourse?.last_module_title || 'Latest module';

    const CourseMiniList = ({ title, courses, tone = "indigo", emptyText }) => {
        const toneMap = {
            indigo: "bg-indigo-50 text-indigo-600",
            amber: "bg-amber-50 text-amber-600",
            emerald: "bg-emerald-50 text-emerald-600"
        };

        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">{title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${toneMap[tone] || toneMap.indigo}`}>
                        {courses.length}
                    </span>
                </div>
                {courses.length > 0 ? (
                    <div className="space-y-2">
                        {courses.slice(0, 4).map((course) => (
                            <button
                                key={course.courses_id || course.id}
                                onClick={() => navigate(`/student/course/${course.courses_id || course.id}`)}
                                className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                <p className="text-sm font-semibold text-primary-900 truncate">{course.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{course.category || "General"}</p>
                                {course.instructor_name && (
                                    <p className="text-xs text-indigo-600 mt-1 font-medium">Instructor: {course.instructor_name}</p>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-slate-400 py-4">{emptyText}</div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 font-sans max-w-[1440px] mx-auto relative z-0">

            {/* WELCOME BANNER */}
            <div className="relative rounded-2xl p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-indigo-300 text-sm font-medium mb-1">👋 {greeting}, {studentName}</p>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Student Dashboard</h1>
                        <p className="text-slate-400 mt-1 text-sm">Track your progress, deadlines, and achievements.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative z-20 w-full sm:w-auto">
                            <div className={`relative transition-all duration-300 ${isSearchExpanded ? 'w-full sm:w-80 md:w-96' : 'w-full sm:w-64'}`}>
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    className="pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm w-full text-white focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 focus:bg-white/15 transition-all placeholder:text-slate-400"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => setIsSearchExpanded(true)}
                                />
                                {searchQuery && (
                                    <button onClick={handleClearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {isSearchExpanded && searchQuery && (
                                <div
                                    className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto overscroll-contain z-30"
                                    onWheel={(e) => e.stopPropagation()}
                                    onTouchMove={(e) => e.stopPropagation()}
                                    style={{ touchAction: 'pan-y' }}
                                >
                                    {searchLoading ? (
                                        <div className="p-6 text-center text-slate-500 text-sm">Searching...</div>
                                    ) : searchResults && searchResults.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {searchResults.map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    onClick={() => handleCourseClick(course.course_id || course.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {course.thumbnail_url ? (
                                                            <img
                                                                src={course.thumbnail_url}
                                                                alt={course.title}
                                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                                <BookOpen className="text-indigo-600" size={24} />
                                                            </div>
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold text-sm text-slate-900 truncate">{course.title}</h4>
                                                                {course.type && (
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${course.type === 'module' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                        {course.type === 'module' ? 'Module' : 'Course'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {course.instructor_name && (
                                                                <p className="text-xs text-indigo-600 font-medium mb-1">👤 {course.instructor_name}</p>
                                                            )}

                                                            {course.type === 'module' && course.course_title && (
                                                                <p className="text-xs text-slate-500 font-medium mb-1">📚 In Course: {course.course_title}</p>
                                                            )}

                                                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                                                {course.description || 'No description available'}
                                                            </p>

                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {course.category && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                                        {course.category}
                                                                    </span>
                                                                )}
                                                                {course.difficulty && (
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                                                                        {course.difficulty}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {course.validity_value && course.validity_unit && (
                                                                <p className="text-xs text-slate-500 mt-2">
                                                                    Valid for: {course.validity_value} {course.validity_unit}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-slate-500 text-sm">No courses found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/student/courses')}
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-all"
                        >
                            Browse <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Click outside overlay */}
                {isSearchExpanded && (
                    <div className="fixed inset-0 z-10" onClick={() => setIsSearchExpanded(false)} />
                )}

                {/* Decorative glows */}
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
                <div className="absolute -left-8 -bottom-20 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }}></div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-[#181F4D] rounded-2xl p-5 border border-white/10 shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/10">
                                <card.icon size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.sub}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <h3 className="text-2xl font-black text-white tracking-tight tabular-nums">{card.value}</h3>
                            </div>
                            <div className="opacity-80">
                                <Sparkline data={card.spark} color={card.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Resume + Activity */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Resume Learning */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Play className="text-indigo-600" size={16} fill="currentColor" />
                            </div>
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Resume Learning</h3>
                        </div>

                        {lastCourse ? (
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="h-24 w-24 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 shrink-0 border border-slate-100">
                                    <BookOpen size={32} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-primary-900 mb-2">{lastCourse.title || "Untitled Course"}</h2>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                                        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${lastCourseProgress}%` }}></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <span>{lastCourseProgress}% Complete</span>
                                        <span>{lastModuleTitle}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/course/${lastCourse.id}`)}
                                    className="px-6 py-2.5 bg-primary-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg shrink-0 active:scale-[0.98]"
                                >
                                    Continue
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <BookOpen className="text-slate-300" size={24} />
                                </div>
                                <p className="text-sm font-semibold text-slate-400 mb-3">No courses started yet</p>
                                <button
                                    onClick={() => navigate('/student/courses')}
                                    className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors"
                                >
                                    Explore Courses
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Recent Activity</h3>
                            <button
                                onClick={() => onViewChange && onViewChange('activity')}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                View All
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold
                                                ${activity.type === 'quiz' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {activity.type === 'quiz' ? 'Q' : 'M'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-primary-900">{activity.title}</div>
                                                <div className="text-xs text-slate-400">
                                                    {activity.type === 'quiz'
                                                        ? `Score: ${activity.score ?? '-'}%`
                                                        : activity.type === 'module'
                                                            ? 'Status: Completed'
                                                            : 'Status: Enrolled'}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-300">{new Date(activity.date).toLocaleDateString()}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-10 text-center text-slate-400 text-sm">No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Deadlines + Practice + Achievements */}
                <div className="space-y-5">
                    {/* Deadlines */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                <Clock className="text-rose-500" size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Upcoming Deadlines</h3>
                        </div>
                        <div className="space-y-3">
                            {deadlines.length > 0 ? (
                                deadlines.map(d => (
                                    <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${d.isUrgent ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                                        <div>
                                            <div className="text-sm font-semibold text-primary-900">{d.title}</div>
                                            <div className="text-xs text-slate-400">{d.course}</div>
                                            <div className={`text-xs font-bold mt-0.5 ${d.isUrgent ? 'text-rose-600' : 'text-slate-400'}`}>
                                                Due: {new Date(d.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 text-sm py-6">No upcoming deadlines</div>
                            )}
                        </div>
                    </div>

                    {/* Practice Arena CTA */}
                    <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Target className="text-indigo-400" size={16} />
                                </div>
                                <h3 className="font-bold text-white text-sm uppercase tracking-wide">Practice Arena</h3>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">Sharpen your coding skills with daily challenges and climb the leaderboard.</p>
                            <button
                                onClick={() => navigate('/student/practice')}
                                className="w-full py-2.5 bg-white text-primary-900 font-bold rounded-xl text-sm hover:bg-slate-100 transition-all active:scale-[0.98]"
                            >
                                Start Challenge
                            </button>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}></div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Award className="text-amber-600" size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wide">Achievements</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Total XP', value: gamification?.xp || 0, color: '#f59e0b' },
                                { label: 'Next Level', value: `${(gamification?.nextLevelXP || 100) - (gamification?.xp || 0)} XP`, color: '#6366f1' },
                                { label: 'Courses Done', value: enrolledCount, color: '#10b981' },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                                    <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* COURSE BUCKETS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <CourseMiniList
                    title="Free Courses"
                    courses={freeCourses}
                    tone="emerald"
                    emptyText="No free courses available right now."
                />
                <CourseMiniList
                    title="Paid Courses"
                    courses={paidCourses}
                    tone="amber"
                    emptyText="No paid courses available right now."
                />
                <CourseMiniList
                    title="For You"
                    courses={recommendedCourses}
                    tone="indigo"
                    emptyText="No recommendations yet. Start learning to get personalized picks."
                />
            </div>
        </div>
    );
};

export default StudentDashboardView;
