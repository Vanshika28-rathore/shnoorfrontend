import React from "react";
import {
  Play,
  CheckCircle,
  User,
  Clock,
  Calendar,
  Star,
  Globe,
  Award,
  Info,
  FileText,
  ArrowLeft,
  Check,
} from "lucide-react";
import CourseComments from "../../../components/CourseComments";

const CourseDetailView = ({
  course,
  loading,
  isEnrolled,
  handleEnroll,
  handleContinue,
  navigate,
}) => {
  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "0m 0s";
    const totalSecs = Math.floor(totalSeconds);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const totalCourseTime = course?.modules?.reduce(
    (acc, m) => acc + (parseInt(m.time_spent_seconds) || 0),
    0
  ) || 0;

  const getModuleTypeMeta = (type) => {
    if (type === "video") {
      return {
        label: "Video",
        className: "bg-indigo-100 text-indigo-700",
      };
    }
    if (
      type === "pdf" ||
      type === "text_stream" ||
      type === "html" ||
      type === "text" ||
      type === "notes"
    ) {
      return {
        label: "Notes",
        className: "bg-emerald-100 text-emerald-700",
      };
    }
    return {
      label: type || "Module",
      className: "bg-slate-100 text-slate-700",
    };
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">
            Loading course details...
          </p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
        <p>
          The course you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/student/courses")}
          className="mt-4 text-indigo-600 font-semibold hover:underline"
        >
          Back to Courses
        </button>
      </div>
    );

  return (
    <div className="animate-fade-in w-full pb-12">
      <button
        onClick={() => navigate("/student/courses")}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-primary-900 transition-colors font-medium px-4 py-2 hover:bg-slate-100 rounded-lg w-fit"
      >
        <ArrowLeft size={16} /> Back to Courses
      </button>

      { }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        { }
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide mb-4">
              {course.category || "General"}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              {course.description || "No description available."}
            </p>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2">
                <Globe className="text-slate-400" size={16} />{" "}
                {course.level || "All Levels"}
              </div>
              <div className="flex items-center gap-2">
                <Star
                  className="text-amber-400"
                  size={16}
                  fill="currentColor"
                />{" "}
                {course.rating || "4.5"}{" "}
                <span className="text-slate-400 font-normal">
                  (120 reviews)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-slate-400" size={16} /> updated
                {course.updatedAt
                  ? new Date(course.updatedAt).toLocaleDateString()
                  : "Recently"}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                  Created by
                </div>
                <div className="font-bold text-primary-900">
                  {course.instructor?.name || "Instructor"}
                </div>
              </div>
            </div>
          </div>
          {(course.prereq_description ||
            (course.prereq_video_urls && course.prereq_video_urls.length > 0) ||
            course.prereq_pdf_url) && (
              <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Info className="text-amber-600" size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-amber-900">
                    Pre-requirements
                  </h3>
                </div>

                {course.prereq_description && (
                  <p className=" mb-4 leading-relaxed">
                    {course.prereq_description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  {Array.isArray(course.prereq_video_urls) &&
                    course.prereq_video_urls.map((videoUrl, index) => (
                      <a
                        key={index}
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-amber-100 font-semibold rounded-lg transition-colors text-sm"
                      >
                        <Play size={14} />
                        Watch Video {index + 1}
                      </a>
                    ))}

                  {course.prereq_pdf_url && (
                    <a
                      href={course.prereq_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-amber-100 font-semibold rounded-lg transition-colors text-sm"
                    >
                      <FileText size={14} />
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            )}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-primary-900 mb-6">
              What you'll learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                `Master the core concepts of ${course.title}`,
                "Build real-world projects",
                "Understand industry best practices",
                "Become job-ready",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-slate-600"
                >
                  <Check
                    className="text-green-500 mt-1 flex-shrink-0"
                    size={16}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Progress Tracking */}
          {isEnrolled && course.modules && course.modules.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-2xl"></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-primary-900">
                    Your Learning Progress
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Track your time spent across the course modules</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Time Spent</div>
                  <div className="text-2xl font-extrabold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl inline-block shadow-sm">
                    {formatTime(totalCourseTime)}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-600">Module</th>
                      <th className="px-6 py-4 font-bold text-slate-600">Type</th>
                      <th className="px-6 py-4 font-bold text-slate-600 text-right">Time Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {course.modules.map((module, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${parseInt(module.time_spent_seconds) > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {parseInt(module.time_spent_seconds) > 0 ? <CheckCircle size={14} /> : <Clock size={14} />}
                            </div>
                            <span className="font-semibold text-slate-700 max-w-[200px] truncate" title={module.title}>
                              Lesson {idx + 1}: {module.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${getModuleTypeMeta(module.type).className}`}>
                            {getModuleTypeMeta(module.type).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-600">
                          {formatTime(module.time_spent_seconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Course Content */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-primary-900 mb-6">
              Syllabus Overview
            </h3>
            <div className="space-y-4">
              {course.modules?.map((module, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {module.type === "video" ? (
                        <Play size={10} fill="currentColor" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-primary-900">
                        {module.title}
                      </div>
                      <div className="text-xs text-slate-500 font-medium capitalize flex items-center gap-2 mt-0.5">
                        <span>{module.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  {isEnrolled && idx === 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                      Started
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-primary-900 mb-6">
              Instructor
            </h3>
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 flex-shrink-0">
                <User size={32} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary-900 mb-1">
                  {course.instructor?.name || "Instructor"}
                </h4>
                <p className="text-sm text-indigo-600 font-medium mb-4">
                  Senior Instructor
                </p>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {course.instructor?.bio || "Instructor Details Not Available"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <CourseComments courseId={course.courses_id || course.id} />
          </div>
        </div>

        {/* Right Column: Sticky Action Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-24">
            {/* Preview Area */}
            <div
              onClick={handleContinue}
              className="h-48 bg-primary-900 relative group cursor-pointer flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-indigo-600/20 group-hover:bg-indigo-600/30 transition-colors"></div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Play size={24} className="ml-1" fill="currentColor" />
              </div>
              <div className="absolute bottom-4 text-white text-sm font-semibold tracking-wide drop-shadow-md">
                Preview Course
              </div>
            </div>

            <div className="p-6">
              <div className="text-3xl font-bold text-primary-900 mb-6">
                Open Access
              </div>

              <button
                onClick={isEnrolled ? handleContinue : handleEnroll}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-lg mb-4 transition-all transform hover:-translate-y-0.5 shadow-lg bg-primary-900 hover:bg-slate-800 text-white shadow-primary-900/20"
              >
                {isEnrolled ? "Continue Learning" : "Enroll Now"}
              </button>

              <p className="text-center text-xs text-slate-500 font-medium mb-6">
                Lifetime Access
              </p>

              <div className="space-y-4">
                <div className="text-sm font-bold text-primary-900 mb-2">
                  This course includes:
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="text-slate-400" size={16} />{" "}
                  {course.modules?.length ? course.modules.length * 15 : 60}{" "}
                  mins on-demand video
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle className="text-slate-400" size={16} /> Access on
                  mobile and TV
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Award className="text-slate-400" size={16} /> Certificate of
                  completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailView;
