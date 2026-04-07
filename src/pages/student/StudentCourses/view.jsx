/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  Library,
  Star,
  Check,
} from "lucide-react";
import ReviewModal from "../../../components/student/ReviewModal";

const StudentCoursesView = ({
  loading,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  displayCourses,
  enrolledIds,
  categories,
  handleEnroll,
  navigate,
  isFreeOnly,
  setIsFreeOnly,
  searchLoading,
  learningPaths,
  allLearningPaths,
}) => {
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    courseId: null,
    courseTitle: "",
    instructorId: null,
    instructorName: "",
  });

  const openReviewModal = (e, course) => {
    e.stopPropagation();
    if (!course.instructor_id) {
      console.warn("No instructor_id found for course", course);
      return;
    }
    if (!course.courses_id && !course.id) {
      console.warn("No course_id found for course", course);
      return;
    }
    setReviewModal({
      isOpen: true,
      courseId: course.courses_id || course.id,
      courseTitle: course.title || "Course",
      instructorId: course.instructor_id,
      instructorName: course.instructor_name || "Instructor",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm animate-pulse">
            Loading catalog...
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 font-sans pb-12">
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        courseId={reviewModal.courseId}
        courseTitle={reviewModal.courseTitle}
        instructorId={reviewModal.instructorId}
        instructorName={reviewModal.instructorName}
      />

      {/* Header Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Course Library
            </h1>
            <p className="text-slate-400 text-sm max-w-md">
              Discover and manage your learning journey. Choose from a curated
              selection of expert-led courses.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full scrollbar-hide">
            {[
              { id: "my-learning", label: "My Learning", icon: Library },
              { id: "explore", label: "Explore", icon: BookOpen },
              { id: "free-courses", label: "Free", icon: Star },
              { id: "paid-courses", label: "Paid", icon: ArrowRight },
              { id: "recommended", label: "For You", icon: Filter },
              { id: "upcoming", label: "Upcoming", icon: BookOpen },
              { id: "learning-paths", label: "Learning Paths", icon: Library },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2 lg:col-span-2 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors"
            size={18}
          />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-medium"
            placeholder="Search by title, instructor or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex flex-1 items-center justify-center gap-2 cursor-pointer bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm hover:border-indigo-500 transition-all active:scale-[0.98] select-none">
            <input
              type="checkbox"
              checked={isFreeOnly}
              onChange={(e) => setIsFreeOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 w-4 h-4 border-slate-300"
            />
            <span className="text-sm font-bold text-slate-700">Free Only</span>
          </label>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Filter size={16} className="text-slate-400" />
          </div>
          <select
            className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none cursor-pointer appearance-none transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none cursor-pointer transition-all"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Active Search Context */}
      {activeTab === "search" && searchTerm && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <Search size={16} /> Search Results for "{searchTerm}"
            </h3>
            {displayCourses.length > 0 && (
              <span className="text-xs font-bold text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">
                {displayCourses.length} results found
              </span>
            )}
          </div>

          {searchLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCourses.map((result) => (
                <div
                  key={result.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
                  onClick={() => {
                    if (result.type === "module") {
                      navigate(`/student/course/${result.course_id}`);
                    } else {
                      navigate(`/student/course/${result.id}`);
                    }
                  }}
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                      <BookOpen
                        className="text-indigo-600 group-hover:text-white transition-colors"
                        size={24}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {result.title}
                        </h4>
                        <span
                          className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider ${result.type === "module"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {result.type === "module" ? "Module" : "Course"}
                        </span>
                      </div>
                      {result.instructor_name && (
                        <p className="text-[11px] text-indigo-600 font-bold mb-1">
                          👤 {result.instructor_name}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {result.description || "No description available"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">
              <p className="text-sm font-medium">
                No courses or modules found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Learning Paths Tab Content */}
      {activeTab === "learning-paths" && (
        <div className="space-y-6">
          {!allLearningPaths || allLearningPaths.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-20 text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Library size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                No learning paths available
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">
                Learning paths will appear here when instructors create them.
              </p>
            </div>
          ) : (
            allLearningPaths.map((lp) => (
              <div
                key={lp.id}
                className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">🛤️</span>
                  <h3 className="text-lg font-bold text-indigo-900">{lp.name}</h3>
                </div>
                {lp.description && (
                  <p className="text-sm text-slate-500 mb-4 ml-10">{lp.description}</p>
                )}
                <div className="text-xs text-indigo-600 font-semibold mb-4 ml-10">
                  {lp.courses.length} course{lp.courses.length !== 1 ? "s" : ""} in this path
                </div>
                <div className="space-y-3 ml-4">
                  {lp.courses.map((course) => {
                    const enrolled = course.is_enrolled;
                    return (
                      <div
                        key={course.courses_id}
                        className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all p-4 group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow">
                          {course.order_index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {course.title}
                            </h4>
                            <span className="flex-shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                              {course.difficulty || "General"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500">{course.category}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">By {course.instructor_name || "Instructor"}</span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${course.price_type === "paid"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                              }`}>
                              {course.price_type === "paid" ? `₹${course.price_amount}` : "FREE"}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {course.is_completed ? (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1.5">
                              <Check size={12} /> Completed
                            </span>
                          ) : enrolled ? (
                            <button
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                              onClick={() => navigate(`/student/course/${course.courses_id}`)}
                            >
                              Resume <ArrowRight size={12} />
                            </button>
                          ) : (
                            <button
                              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors"
                              onClick={() => handleEnroll(course.courses_id)}
                            >
                              Enroll
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Learning Path Search Results (for other tabs) */}
      {activeTab !== "learning-paths" && learningPaths && learningPaths.length > 0 && (
        <div className="space-y-6 mb-8">
          {learningPaths.map((lp) => (
            <div
              key={lp.id}
              className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🛤️</span>
                <h3 className="text-lg font-bold text-indigo-900">
                  Learning Path: {lp.name}
                </h3>
              </div>
              {lp.description && (
                <p className="text-sm text-slate-500 mb-4 ml-10">{lp.description}</p>
              )}
              <div className="text-xs text-indigo-600 font-semibold mb-4 ml-10">
                {lp.courses.length} course{lp.courses.length !== 1 ? "s" : ""} in this path
              </div>
              <div className="space-y-3 ml-4">
                {lp.courses.map((course, idx) => {
                  const enrolled = course.is_enrolled;
                  return (
                    <div
                      key={course.courses_id}
                      className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all p-4 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow">
                        {course.order_index}
                      </div>
                      {idx < lp.courses.length - 1 && (
                        <div className="absolute left-9 top-14 w-0.5 h-6 bg-indigo-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {course.title}
                          </h4>
                          <span className="flex-shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                            {course.difficulty || "General"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">{course.category}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">By {course.instructor_name || "Instructor"}</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${course.price_type === "paid"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                            }`}>
                            {course.price_type === "paid" ? `₹${course.price_amount}` : "FREE"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {course.is_completed ? (
                          <span className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1.5">
                            <Check size={12} /> Completed
                          </span>
                        ) : enrolled ? (
                          <button
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                            onClick={() => navigate(`/student/course/${course.courses_id}`)}
                          >
                            Resume <ArrowRight size={12} />
                          </button>
                        ) : (
                          <button
                            className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors"
                            onClick={() => handleEnroll(course.courses_id)}
                          >
                            Enroll
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Course Grid */}
      {activeTab !== "learning-paths" && (
        <>
          {displayCourses.length === 0 && (!learningPaths || learningPaths.length === 0) ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-20 text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Library size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                No courses match your library
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">
                Try adjusting your filters or search terms, or explore our full catalog.
              </p>
            </div>
          ) : displayCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayCourses.map((course) => {
                const isEnrolled = enrolledIds.includes(course.courses_id);
                return (
                  <div
                    key={course.courses_id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {/* Visual Header / Thumbnail */}
                    <div className="h-44 relative bg-slate-50 p-6 flex items-center justify-center overflow-hidden transition-colors group-hover:bg-indigo-50/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <BookOpen
                        className="text-slate-200 w-24 h-24 group-hover:text-indigo-100 transform group-hover:scale-110 transition-all duration-500"
                        strokeWidth={1}
                      />
                      <div className="absolute inset-x-4 top-4 flex justify-between items-start">
                        <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-800 shadow-sm">
                          {course.category || "General"}
                        </span>
                        <span className="bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                          {course.difficulty || "All Levels"}
                        </span>
                      </div>
                      <div
                        className={`absolute bottom-4 right-4 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase shadow-lg border-2 ${course.price_type === "paid"
                            ? "bg-amber-400 text-slate-900 border-amber-500"
                            : "bg-emerald-500 text-white border-emerald-600"
                          }`}
                      >
                        {course.price_type === "paid"
                          ? `₹${course.price_amount}`
                          : "FREE"}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-6 text-[11px] font-bold">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          👤
                        </div>
                        <span className="text-slate-500">Provided by</span>
                        <span className="text-indigo-600">
                          {course.instructor_name || "LMS Expert"}
                        </span>
                      </div>

                      <div className="mt-auto space-y-3">
                        {isEnrolled ? (
                          <>
                            <button
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                              onClick={() =>
                                navigate(`/student/course/${course.courses_id}`)
                              }
                            >
                              Resume Learning <ArrowRight size={16} />
                            </button>
                            <button
                              className={`w-full font-extrabold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border-2 ${course.has_reviewed
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 cursor-not-allowed"
                                  : "bg-white text-slate-700 border-slate-100 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
                                }`}
                              onClick={(e) =>
                                !course.has_reviewed && openReviewModal(e, course)
                              }
                              disabled={course.has_reviewed}
                            >
                              {course.has_reviewed ? (
                                <>
                                  <Check size={16} /> Rating Submitted
                                </>
                              ) : (
                                <>
                                  <Star size={16} className="text-amber-400" /> Rate Course
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            className="w-full bg-white border-2 border-slate-100 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 font-extrabold py-3 px-4 rounded-xl text-sm transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                            onClick={() => handleEnroll(course.courses_id)}
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default StudentCoursesView;