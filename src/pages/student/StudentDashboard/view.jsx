import React from "react";
import {
  BookOpen,
  Flame,
  Trophy,
  Play,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";

const StudentDashboardView = ({
  studentName,
  enrolledCount,
  lastCourse,
  gamification,
  recentActivity = [],
  deadlines = [],
  navigate,
}) => {
  return (
    <div className="space-y-8 font-sans text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-primary-900">
              {studentName}
            </span>
            . Track your progress and deadlines.
          </p>
        </div>
        <button
          onClick={() => navigate("/student/courses")}
          className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-900 transition-colors"
        >
          Browse Catalog <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Current Rank"
          value={gamification?.rank || "-"}
          icon={<Trophy size={20} />}
          subtext="Top 15% of students"
          colorClass="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Daily Streak"
          value={`${gamification?.streak || 0} Days`}
          icon={<Flame size={20} />}
          subtext="Keep it up!"
          colorClass="text-rose-600 bg-rose-50"
        />
        <StatCard
          label="XP Earned"
          value={gamification?.xp || 0}
          icon={<Zap size={20} />}
          subtext={`${(gamification?.nextLevelXP || 100) - (gamification?.xp || 0)} XP to next level`}
          colorClass="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Enrolled Courses"
          value={enrolledCount}
          icon={<BookOpen size={20} />}
          subtext="Active learning paths"
          colorClass="text-emerald-600 bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Play className="text-indigo-600" size={16} fill="currentColor" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                Resume Learning
              </h3>
            </div>

            {lastCourse ? (
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="h-24 w-24 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <BookOpen size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary-900 mb-2">
                    {lastCourse.title || "Untitled Course"}
                  </h2>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>65% Complete</span>
                    <span>Module 4: Advanced Concepts</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student/courses/${lastCourse.course_id}`)}
                  className="px-6 py-2.5 bg-primary-900 hover:bg-black text-white font-bold rounded-md text-sm transition-colors shrink-0"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm mb-4">
                  You haven't started any courses yet.
                </p>
                <button
                  onClick={() => navigate("/student/courses")}
                  className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-md text-sm hover:bg-indigo-100"
                >
                  Explore Courses
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center rounded-t-lg">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Recent Activity
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded text-xs font-bold">
                        {activity.type === "quiz" ? "QUIZ" : "MOD"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary-900">
                          {activity.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          Score: {activity.score}%
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-rose-500" size={16} />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                Upcoming Deadlines
              </h3>
            </div>
            <div className="space-y-4">
              {deadlines.length > 0 ? (
                deadlines.map((d) => (
                  <DeadlineItem
                    key={d.id}
                    title={d.title}
                    course={d.course}
                    due={new Date(d.dueDate).toLocaleDateString()}
                    type={d.isUrgent ? "urgent" : "normal"}
                  />
                ))
              ) : (
                <div className="text-center text-slate-400 text-sm py-4">
                  No upcoming deadlines
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary-900 rounded-lg p-6 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Practice Arena</h3>
              <p className="text-indigo-200 text-sm mb-4">
                Sharpen your coding skills with daily challenges.
              </p>
              <button
                onClick={() => navigate("/student/practice")}
                className="w-full py-2 bg-white text-primary-900 font-bold rounded text-sm hover:bg-slate-50 transition-colors"
              >
                Start Challenge
              </button>
            </div>
            <Clock
              className="absolute right-[-20px] bottom-[-20px] text-white/5"
              size={120}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, subtext, colorClass }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          {label}
        </h4>
        <div className="text-2xl font-bold text-primary-900">{value}</div>
      </div>
      <div className={`p-2 rounded-md ${colorClass}`}>{icon}</div>
    </div>
    <div className="text-xs font-medium text-slate-400 border-t border-slate-100 pt-3 mt-auto">
      {subtext}
    </div>
  </div>
);

const DeadlineItem = ({ title, course, due, type }) => (
  <div className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer">
    <div
      className={`mt-1 w-2 h-2 rounded-full ${type === "urgent" ? "bg-rose-500" : "bg-indigo-600"}`}
    ></div>
    <div>
      <div className="text-sm font-bold text-primary-900">{title}</div>
      <div className="text-xs text-slate-500 mb-1">{course}</div>
      <div
        className={`text-xs font-bold ${type === "urgent" ? "text-rose-600" : "text-slate-400"}`}
      >
        Due: {due}
      </div>
    </div>
  </div>
);

export default StudentDashboardView;
