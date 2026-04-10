import { useState, useEffect } from "react";
import { auth } from "../../../auth/firebase";
import api from "../../../api/axios";
import {
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const LearningPaths = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create new path form
  const [newPathName, setNewPathName] = useState("");
  const [newPathDesc, setNewPathDesc] = useState("");
  const [creatingPath, setCreatingPath] = useState(false);
  const [error, setError] = useState(null);

  // Add course to path form
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(1);
  const [addingCourse, setAddingCourse] = useState(false);

  // Expanded path cards
  const [expandedPaths, setExpandedPaths] = useState({});

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  // Fetch instructor's paths and courses
  const fetchData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [pathsRes, coursesRes] = await Promise.all([
        api.get("/api/learning-paths/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/courses/instructor", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setLearningPaths(pathsRes.data || []);
      setAllCourses(coursesRes.data || []);

      // Fetch courses for each path
      const pathsWithCourses = await Promise.all(
        (pathsRes.data || []).map(async (lp) => {
          const coursesInPath = await api.get(
            `/api/learning-paths/${lp.id}/courses`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          return { ...lp, courses: coursesInPath.data || [] };
        }),
      );
      setLearningPaths(pathsWithCourses);
    } catch (err) {
      console.error("Failed to fetch learning paths:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create a new learning path
  const handleCreatePath = async () => {
    if (!newPathName.trim()) return;
    setCreatingPath(true);
    setError(null);
    try {
      const token = await getToken();
      await api.post(
        "/api/learning-paths",
        { name: newPathName.trim(), description: newPathDesc.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewPathName("");
      setNewPathDesc("");
      await fetchData();
    } catch (err) {
      console.error("Create path error:", err);
      const message =
        err?.response?.data?.message || "Failed to create learning path";
      if (err?.response?.status === 409) {
        setError("already the name exists create another");
      } else {
        setError(message);
      }
    } finally {
      setCreatingPath(false);
    }
  };

  // Add a course to a path
  const handleAddCourse = async (pathId) => {
    if (!selectedCourseId) return;
    setAddingCourse(true);
    try {
      const token = await getToken();
      await api.post(
        "/api/learning-paths/add-course",
        {
          learningPathId: pathId,
          courseId: selectedCourseId,
          orderIndex: Number(selectedOrder) || 1,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedCourseId("");
      setSelectedOrder(1);
      await fetchData();
    } catch (err) {
      console.error("Add course error:", err);
      alert("Failed to add course to learning path");
    } finally {
      setAddingCourse(false);
    }
  };

  // Remove a course from a path
  const handleRemoveCourse = async (pathId, courseId) => {
    if (!window.confirm("Remove this course from the learning path?")) return;
    try {
      const token = await getToken();
      await api.delete(`/api/learning-paths/${pathId}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.error("Remove course error:", err);
      alert("Failed to remove course");
    }
  };

  const toggleExpanded = (pathId) => {
    setExpandedPaths((prev) => ({ ...prev, [pathId]: !prev[pathId] }));
  };

  // Get courses not already in a specific path
  const getAvailableCourses = (pathId) => {
    const path = learningPaths.find((lp) => lp.id === pathId);
    const assignedIds = (path?.courses || []).map((c) => c.courses_id);
    return allCourses.filter((c) => !assignedIds.includes(c.courses_id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">
            Loading learning paths...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6 p-4 md:p-0">
      {/* GRADIENT HEADER */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 md:p-6 lg:p-8 shrink-0"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <BookOpen size={24} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Learning Paths
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Create learning paths and assign courses in order.
              </p>
            </div>
          </div>
        </div>
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        ></div>
      </div>

      {/* Create New Path */}
      <div className="bg-white px-4 md:px-6 py-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Plus size={16} className="text-indigo-500" />
          Create New Learning Path
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Learning path name (e.g. AI & Machine Learning)"
            value={newPathName}
            onChange={(e) => {
              setNewPathName(e.target.value);
              setError(null);
            }}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium"
          />
          <input
            placeholder="Description (optional)"
            value={newPathDesc}
            onChange={(e) => setNewPathDesc(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium"
          />
          <button
            onClick={handleCreatePath}
            disabled={!newPathName.trim() || creatingPath}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={14} />
            {creatingPath ? "Creating..." : "Create"}
          </button>
        </div>
        {error && (
          <div className="mt-3 text-red-600 font-semibold p-3 bg-red-50 rounded-xl text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Learning Paths List */}
      {learningPaths.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300 border border-indigo-100">
            <BookOpen size={32} />
          </div>
          <h3 className="text-base font-bold text-primary-900 mb-1">
            No learning paths yet
          </h3>
          <p className="text-sm text-slate-500">
            Create your first learning path above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {learningPaths.map((lp) => {
            const isExpanded = expandedPaths[lp.id] !== false; // default expanded
            const availableCourses = getAvailableCourses(lp.id);

            return (
              <div
                key={lp.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Path Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpanded(lp.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🛤️</span>
                    <div>
                      <h3 className="text-base font-bold text-primary-900">
                        {lp.name}
                      </h3>
                      {lp.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lp.description}
                        </p>
                      )}
                    </div>
                    <span className="ml-3 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {(lp.courses || []).length} course
                      {(lp.courses || []).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {/* Course List */}
                    <div className="px-6 py-4">
                      {(lp.courses || []).length === 0 ? (
                        <p className="text-sm text-slate-400 italic py-4 text-center">
                          No courses added yet. Use the dropdown below to add
                          courses.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(lp.courses || []).map((course) => (
                            <div
                              key={course.courses_id}
                              className="flex items-center gap-4 bg-slate-50 rounded-lg border border-slate-100 px-4 py-3 group hover:border-indigo-200 transition-colors"
                            >
                              {/* Order badge */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                {course.order_index}
                              </div>

                              <GripVertical
                                size={16}
                                className="text-slate-300 flex-shrink-0"
                              />

                              {/* Course info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-primary-900 truncate">
                                  {course.title}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>{course.category}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{course.difficulty}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>
                                    {course.price_type === "paid"
                                      ? `₹${course.price_amount}`
                                      : "Free"}
                                  </span>
                                </div>
                              </div>

                              {/* Remove button */}
                              <button
                                onClick={() =>
                                  handleRemoveCourse(lp.id, course.courses_id)
                                }
                                className="flex-shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from path"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Course Section */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                        Add Existing Course
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={
                            selectedPathId === lp.id ? selectedCourseId : ""
                          }
                          onChange={(e) => {
                            setSelectedPathId(lp.id);
                            setSelectedCourseId(e.target.value);
                          }}
                          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm cursor-pointer"
                        >
                          <option value="">— Select a course —</option>
                          {availableCourses.map((c) => (
                            <option key={c.courses_id} value={c.courses_id}>
                              {c.title} ({c.category || "No category"})
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
                            Order:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={selectedPathId === lp.id ? selectedOrder : 1}
                            onChange={(e) => {
                              setSelectedPathId(lp.id);
                              setSelectedOrder(e.target.value);
                            }}
                            className="w-20 px-3 py-2.5 bg-white border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm"
                          />
                        </div>

                        <button
                          onClick={() => handleAddCourse(lp.id)}
                          disabled={
                            !selectedCourseId ||
                            selectedPathId !== lp.id ||
                            addingCourse
                          }
                          className="px-5 py-2.5 bg-primary-900 hover:bg-slate-800 text-white font-bold text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                          <Plus size={14} />
                          {addingCourse ? "Adding..." : "Add Course"}
                        </button>
                      </div>

                      {availableCourses.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2">
                          All your courses are already in this learning path.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
