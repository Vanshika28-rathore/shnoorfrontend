import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  RefreshCcw,
  Phone,
  AlertTriangle,
  Eye,
  List,
  Mail,
  Download,
  ChevronRight,
  ChevronDown,
  Clock,
  ExternalLink,
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";

const AdminViolations = () => {
  const [summary, setSummary] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, detailedRes] = await Promise.all([
        api.get("/api/admin/violations/summary"),
        api.get("/api/admin/violations")
      ]);
      console.log("📊 [ADMIN] Summary:", summaryRes.data?.length, "records");
      console.log("📝 [ADMIN] Detailed Violations:", detailedRes.data?.length, "records");
      if (detailedRes.data?.length > 0) {
        console.log("🔍 [ADMIN] Sample Exam Title:", detailedRes.data[0].exam_title);
      }
      setSummary(summaryRes.data || []);
      setAllViolations(detailedRes.data || []);
    } catch (err) {
      console.error("❌ [ADMIN] Fetch error:", err);
      toast.error("Failed to load violations data");
    } finally {
      setLoading(false);
    }
  };

  // Group violations by Exam for the dropdown (Safely handle null/undefined)
  const examList = Array.from(
    new Set(allViolations.map(v => {
      let name = v.exam_title || v.exam_id;
      if (!name) return "Unknown Exam";
      const sName = String(name);
      if (sName.toLowerCase().includes("practice") || sName.toLowerCase().includes("quiz")) return "PRACTICE QUIZ";
      return sName;
    }))
  ).sort();

  // Filter and Group Data for the selected exam
  const getDisplayData = () => {
    let filtered = allViolations;
    if (selectedExam !== "all") {
      filtered = allViolations.filter(v => {
        let name = v.exam_title || v.exam_id;
        if (!name) name = "Unknown Exam";
        else if (String(name).toLowerCase().includes("practice") || String(name).toLowerCase().includes("quiz")) name = "PRACTICE QUIZ";
        return String(name) === selectedExam;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group by Student + Exam Attempt
    const attemptGroups = filtered.reduce((acc, v) => {
      const key = `${v.student_id}_${v.exam_id}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          student_id: v.student_id,
          name: v.student_name || "Unknown",
          email: v.student_email || "No Email",
          exam_id: v.exam_id,
          exam_title: v.exam_title || v.exam_id,
          violations: [],
          created_at: v.created_at,
          examScore: v.exam_score,
          examStatus: v.exam_status,
          marks: {
            obtained: v.obtained_marks,
            total: v.total_marks
          },
          counts: {
            no_face: 0,
            multiple_faces: 0,
            phone_detected: 0,
            loud_noise: 0,
            voice_detected: 0,
            others: 0
          }
        };
      }
      acc[key].violations.push(v);

      const type = v.violation_type?.toUpperCase() || "";
      if (type.includes("NO_FACE")) acc[key].counts.no_face++;
      else if (type.includes("MULTIPLE")) acc[key].counts.multiple_faces++;
      else if (type.includes("PHONE") || type.includes("OBJECT")) acc[key].counts.phone_detected++;
      else if (type.includes("LOUD_NOISE")) acc[key].counts.loud_noise++;
      else if (type.includes("VOICE")) acc[key].counts.voice_detected++;
      else acc[key].counts.others++;

      return acc;
    }, {});

    return Object.values(attemptGroups).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const displayData = getDisplayData();
  const seriousAttempts = displayData.filter(a => a.counts.phone_detected > 0 || a.violations.length > 15);
  const slightAttempts = displayData.filter(a => !(a.counts.phone_detected > 0 || a.violations.length > 15));

  // Calculate Analytics Stats
  const getStats = () => {
    if (!allViolations || allViolations.length === 0) return null;

    const totalIncidents = allViolations.length;

    // Categorize students by severity of their worst attempt
    const studentSeverity = {};
    displayData.forEach(attempt => {
      const sid = attempt.student_id;
      const isSerious = attempt.counts.phone_detected > 0 || attempt.violations.length > 15;

      if (!studentSeverity[sid]) {
        studentSeverity[sid] = isSerious ? 'serious' : 'slight';
      } else if (isSerious) {
        studentSeverity[sid] = 'serious';
      }
    });

    const seriousCount = Object.values(studentSeverity).filter(s => s === 'serious').length;
    const slightCount = Object.values(studentSeverity).filter(s => s === 'slight').length;

    // Violation Type distribution
    const typeCounts = allViolations.reduce((acc, v) => {
      acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
      return acc;
    }, {});

    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalIncidents,
      seriousCount,
      slightCount,
      topType: topType ? { name: topType[0], count: topType[1], percent: Math.round((topType[1] / totalIncidents) * 100) } : null,
    };
  };

  const stats = getStats();

  const exportToCSV = () => {
    try {
      if (!displayData || displayData.length === 0) {
        toast.error("No violation data shown to export");
        return;
      }

      const headers = [
        "Student Name", "Email",
        "Exam Name", "Date Attempted",
        "Marks Obtained", "Total Marks", "Percentage", "Status",
        "No Face", "Multiple Faces", "Phone/Object Detected", "Loud Noise", "Voice Detected",
        "Total Violations", "Risk Level"
      ];

      const rows = displayData.map(r => {
        const isSerious = r.counts.phone_detected > 0 || r.violations.length > 15;
        return [
          r.name, r.email,
          r.exam_title,
          r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '---',
          r.marks.obtained ?? '---',
          r.marks.total ?? '---',
          r.examScore !== null && r.examScore !== undefined ? parseFloat(r.examScore).toFixed(1) + '%' : '---',
          r.examStatus === true ? 'Pass' : r.examStatus === false ? 'Fail' : '---',
          r.counts.no_face, r.counts.multiple_faces, r.counts.phone_detected, r.counts.loud_noise, r.counts.voice_detected,
          r.violations.length,
          isSerious ? 'SERIOUS' : 'SLIGHT'
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + headers.join(",") + "\n"
        + rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Proctoring_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`✅ Report exported! ${rows.length} records`);
    } catch (err) {
      console.error("❌ Export error:", err);
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="p-6 bg-[#F3F4F6] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <ShieldAlert className="text-rose-600 w-8 h-8" />
                </div>
                Violations
              </h1>
              <p className="text-slate-500 mt-1 font-bold text-sm">Monitor detected suspicious activities during exams</p>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest shadow-lg"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Test to View Violations</label>
              <div className="relative">
                <List className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedExam}
                  onChange={(e) => {
                    setSelectedExam(e.target.value);
                    setExpandedStudentId(null);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-bold text-slate-700"
                >
                  <option value="all">All Assessments & Practice Tests</option>
                  {examList.map(exam => (
                    <option key={exam} value={exam}>
                      {exam && exam.toLowerCase().includes('practice') ? 'PRACTICE QUIZ' :
                        exam && exam.toLowerCase().includes('quiz') ? exam.toUpperCase() :
                          `ASSESSMENT - ${exam}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Seach by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Analytics Bar */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group overflow-hidden relative">
              <div className="absolute -right-2 -top-2 opacity-5 group-hover:rotate-12 transition-transform">
                <Activity size={80} className="text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Incidents</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900 leading-none">{stats.totalIncidents}</span>
                <span className="text-xs font-bold text-indigo-600 mb-1">Alerts Detected</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-rose-300 transition-all group overflow-hidden relative">
              <div className="absolute -right-2 -top-2 opacity-5 group-hover:rotate-12 transition-transform">
                <AlertTriangle size={80} className="text-rose-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Serious Cheaters</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900 leading-none">{stats.seriousCount}</span>
                <span className="text-xs font-bold text-rose-600 mb-1">Flagged Cases</span>
              </div>
              <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-wide">High severity or many alerts</p>
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.round((stats.seriousCount / (stats.seriousCount + stats.slightCount || 1)) * 100)}%` }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group overflow-hidden relative">
              <div className="absolute -right-2 -top-2 opacity-5 group-hover:rotate-12 transition-transform">
                <User size={80} className="text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Slight Violations</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900 leading-none">{stats.slightCount}</span>
                <span className="text-xs font-bold text-emerald-600 mb-1">Minor Alerts</span>
              </div>
              <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total students with minor issues</p>
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all group overflow-hidden relative">
              <div className="absolute -right-2 -top-2 opacity-5 group-hover:rotate-12 transition-transform">
                <BarChart3 size={80} className="text-amber-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Top Violation</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-xl font-black text-slate-900 leading-tight uppercase truncate max-w-[150px]">
                  {stats.topType?.name.replace('_', ' ') || 'NONE'}
                </span>
              </div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                {stats.topType?.percent}% of total cases
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-1 transition-colors"
                >
                  Reset Dashboard <RefreshCcw size={10} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-12 pb-20">
          {/* Serious Cheaters Section */}
          <div>
            <div className="flex items-center justify-between mb-6 ml-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-7 bg-rose-600 rounded-full" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Flagged Students <span className="text-rose-600 ml-2">({seriousAttempts.length} Serious Cases)</span>
                </h2>
              </div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">High Risk Priority</p>
            </div>

            {loading ? (
              <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center">
                <RefreshCcw className="animate-spin text-indigo-600 w-10 h-10 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Scanning database for violations...</p>
              </div>
            ) : seriousAttempts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-400 font-bold">No high-severity violations found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-rose-50 text-rose-900">
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100">Student</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100">Date Attempted</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100">Score</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Status</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">No Face</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Multi Faces</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Phone</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Noise</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Voice</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Total</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-rose-100 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriousAttempts.map((attempt) => {
                      const isExpanded = expandedStudentId === attempt.id;
                      const totalViolations = attempt.violations.length;
                      return (
                        <React.Fragment key={attempt.id}>
                          <tr className={`border-b border-slate-100 hover:bg-rose-50/50 transition-colors ${isExpanded ? 'bg-rose-50/30' : ''}`}>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900">{attempt.name}</span>
                                <span className="text-[10px] font-medium text-slate-400">{attempt.email}</span>
                              </div>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-600">
                              {new Date(attempt.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-black text-rose-600">
                                {attempt.marks.obtained !== undefined ? `${attempt.marks.obtained} / ${attempt.marks.total}` : '---'}
                                {attempt.examScore !== undefined && ` (${attempt.examScore}%)`}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${attempt.examStatus === true ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                attempt.examStatus === false ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                  'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                {attempt.examStatus === true ? 'Pass' : attempt.examStatus === false ? 'Fail' : '---'}
                              </span>
                            </td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.no_face}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.multiple_faces}</td>
                            <td className="p-4 text-center text-xs font-black text-rose-600">{attempt.counts.phone_detected}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.loud_noise}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.voice_detected}</td>
                            <td className="p-4 text-center text-xs font-black text-slate-900">{totalViolations}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setExpandedStudentId(isExpanded ? null : attempt.id)}
                                className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600'}`}
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <Eye size={16} />}
                              </button>
                            </td>
                          </tr>

                          {/* Expansion Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="11" className="p-0">
                                <div className="bg-slate-50 border-b border-rose-100 p-6 space-y-4 shadow-inner">
                                  <div className="flex items-center gap-3 mb-2 ml-2">
                                    <div className="w-1.5 h-4 bg-rose-600 rounded-full" />
                                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Serious Incident Drill-down for {attempt.exam_title}</h4>
                                  </div>
                                  <div className="space-y-3">
                                    {attempt.violations.map((log) => {
                                      const isLogExpanded = expandedLogId === log.violation_id;
                                      return (
                                        <div key={log.violation_id} className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-rose-200">
                                          <div className="grid grid-cols-4 p-4 items-center">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-2 h-2 rounded-full ${log.violation_type.includes('PHONE') ? 'bg-rose-500' :
                                                log.violation_type.includes('FACE') ? 'bg-orange-500' : 'bg-indigo-500'
                                                }`} />
                                              <span className="text-xs font-black text-slate-700">{log.violation_type}</span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 tabular-nums">
                                              <Clock size={12} /> {new Date(log.created_at).toLocaleString()}
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-mono truncate max-w-[300px]">
                                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                              </span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedLogId(isLogExpanded ? null : log.violation_id);
                                                }}
                                                className="text-[10px] font-black text-rose-600 hover:text-rose-700 transition-colors uppercase tracking-widest flex items-center gap-1"
                                              >
                                                {isLogExpanded ? 'Collapse' : 'Expand'}
                                                {isLogExpanded ? <ChevronDown size={10} /> : <ExternalLink size={10} />}
                                              </button>
                                            </div>
                                          </div>
                                          {isLogExpanded && (
                                            <div className="px-4 pb-4 pt-1 border-t border-slate-50 bg-slate-50/30">
                                              <div className="p-4 bg-slate-900 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                                                <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                                  {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Slight Violations Section (Total Students) */}
          <div>
            <div className="flex items-center justify-between mb-6 ml-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-7 bg-indigo-600 rounded-full" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Total Students <span className="text-indigo-600 ml-2">({slightAttempts.length} Minor Cases)</span>
                </h2>
              </div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">Standard Monitoring</p>
            </div>

            {loading ? (
              <div className="text-center p-20">
                <RefreshCcw className="animate-spin text-indigo-600 w-8 h-8 mx-auto" />
              </div>
            ) : slightAttempts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-400 font-bold">No minor violations found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e40af] text-white">
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800">Student</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800">Date Attempted</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800">Score</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">Status</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">No Face</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">Multi Faces</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center text-slate-300">Phone</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">Noise</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">Voice</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">Total</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-indigo-800 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slightAttempts.map((attempt) => {
                      const isExpanded = expandedStudentId === attempt.id;
                      const totalViolations = attempt.violations.length;
                      return (
                        <React.Fragment key={attempt.id}>
                          <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900">{attempt.name}</span>
                                <span className="text-[10px] font-medium text-slate-400">{attempt.email}</span>
                              </div>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-600">
                              {new Date(attempt.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-black text-indigo-600">
                                {attempt.marks.obtained !== undefined ? `${attempt.marks.obtained} / ${attempt.marks.total}` : '---'}
                                {attempt.examScore !== undefined && ` (${attempt.examScore}%)`}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${attempt.examStatus === true ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                attempt.examStatus === false ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                  'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                {attempt.examStatus === true ? 'Pass' : attempt.examStatus === false ? 'Fail' : '---'}
                              </span>
                            </td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.no_face}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.multiple_faces}</td>
                            <td className="p-4 text-center text-[10px] font-bold text-slate-300">{attempt.counts.phone_detected}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.loud_noise}</td>
                            <td className="p-4 text-center text-xs font-bold text-slate-600">{attempt.counts.voice_detected}</td>
                            <td className="p-4 text-center text-xs font-black text-slate-900">{totalViolations}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setExpandedStudentId(isExpanded ? null : attempt.id)}
                                className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'}`}
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <Eye size={16} />}
                              </button>
                            </td>
                          </tr>

                          {/* Expansion Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="11" className="p-0">
                                <div className="bg-slate-50 border-b border-indigo-100 p-6 space-y-4 shadow-inner">
                                  <div className="flex items-center gap-3 mb-2 ml-2">
                                    <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Minor Incident Drill-down for {attempt.exam_title}</h4>
                                  </div>
                                  <div className="space-y-3">
                                    {attempt.violations.map((log) => {
                                      const isLogExpanded = expandedLogId === log.violation_id;
                                      return (
                                        <div key={log.violation_id} className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-rose-200">
                                          <div className="grid grid-cols-4 p-4 items-center">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-2 h-2 rounded-full ${log.violation_type.includes('PHONE') ? 'bg-rose-500' :
                                                log.violation_type.includes('FACE') ? 'bg-orange-500' : 'bg-indigo-500'
                                                }`} />
                                              <span className="text-xs font-black text-slate-700">{log.violation_type}</span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 tabular-nums">
                                              <Clock size={12} /> {new Date(log.created_at).toLocaleString()}
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-mono truncate max-w-[300px]">
                                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                              </span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedLogId(isLogExpanded ? null : log.violation_id);
                                                }}
                                                className="text-[10px] font-black text-indigo-600 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                                              >
                                                {isLogExpanded ? 'Collapse' : 'Expand'}
                                                {isLogExpanded ? <ChevronDown size={10} /> : <ExternalLink size={10} />}
                                              </button>
                                            </div>
                                          </div>
                                          {isLogExpanded && (
                                            <div className="px-4 pb-4 pt-1 border-t border-slate-50 bg-slate-50/30">
                                              <div className="p-4 bg-slate-900 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                                                <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                                  {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 flex items-center justify-center gap-6 opacity-40">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Advanced Proctoring System 4.0</label>
      </div>
    </div>
  );
};
export default AdminViolations;
