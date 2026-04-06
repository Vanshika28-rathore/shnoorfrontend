import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import api from "../../../api/axios";

const CourseProgress = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/manager/course-progress");
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch manager course progress:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportRows = useMemo(
    () =>
      rows.map((row, index) => ({
        srNo: index + 1,
        studentName: row.student_name || "-",
        studentEmail: row.student_email || "-",
        courseName: row.course_name || "-",
        totalModules: Number(row.total_modules || 0),
        completedModules: Number(row.completed_modules || 0),
        progress: Number(row.progress_percent || 0),
      })),
    [rows],
  );

  const exportToExcel = () => {
    const headers = [
      "Sr No",
      "Student Name",
      "Student Email",
      "Course",
      "Total Modules",
      "Completed Modules",
      "Progress %",
    ];

    const lines = [
      headers.join("\t"),
      ...exportRows.map((row) =>
        [
          row.srNo,
          row.studentName,
          row.studentEmail,
          row.courseName,
          row.totalModules,
          row.completedModules,
          row.progress,
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join("\t"),
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "manager_course_progress.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    doc.setFontSize(14);
    doc.text("Manager Course Progress Report", 40, 32);

    const columns = [
      { key: "srNo", label: "#", width: 35 },
      { key: "studentName", label: "Student Name", width: 140 },
      { key: "studentEmail", label: "Student Email", width: 170 },
      { key: "courseName", label: "Course", width: 170 },
      { key: "totalModules", label: "Total Modules", width: 95 },
      { key: "completedModules", label: "Completed", width: 85 },
      { key: "progress", label: "Progress %", width: 80 },
    ];

    const rowHeight = 20;
    let y = 60;

    const drawRow = (row, header = false) => {
      let x = 40;
      doc.setFont("helvetica", header ? "bold" : "normal");
      columns.forEach((col) => {
        const text = String(row[col.key] ?? "-");
        const clipped = doc.splitTextToSize(text, col.width - 6)[0] || "-";
        doc.text(clipped, x + 3, y + 13);
        doc.rect(x, y, col.width, rowHeight);
        x += col.width;
      });
      y += rowHeight;
    };

    drawRow(
      {
        srNo: "#",
        studentName: "Student Name",
        studentEmail: "Student Email",
        courseName: "Course",
        totalModules: "Total",
        completedModules: "Completed",
        progress: "Progress %",
      },
      true,
    );

    exportRows.forEach((row) => {
      if (y + rowHeight > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = 30;
        drawRow(
          {
            srNo: "#",
            studentName: "Student Name",
            studentEmail: "Student Email",
            courseName: "Course",
            totalModules: "Total",
            completedModules: "Completed",
            progress: "Progress %",
          },
          true,
        );
      }
      drawRow(row);
    });

    doc.save("manager_course_progress.pdf");
  };

  return (
    <div className="space-y-6 font-sans max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}>
        <div className="relative z-10 flex flex-wrap gap-3 justify-between items-start">
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">Manager</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Course Progress</h1>
            <p className="text-slate-400 mt-1 text-sm">Progress for each student and assigned course.</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={exportRows.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-300/40 text-indigo-100 bg-indigo-400/10 hover:bg-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Download size={16} />
              Export to Excel
            </button>
            <button
              type="button"
              onClick={exportToPdf}
              disabled={exportRows.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Download size={16} />
              Export to PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        {loading ? (
          <div className="py-10 text-center text-slate-500 text-sm">Loading course progress...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Total Modules</th>
                  <th className="px-4 py-3 font-semibold">Completed</th>
                  <th className="px-4 py-3 font-semibold">Progress %</th>
                </tr>
              </thead>
              <tbody>
                {exportRows.length > 0 ? (
                  exportRows.map((row) => (
                    <tr key={`${row.studentEmail}-${row.courseName}-${row.srNo}`} className="border-t border-slate-100 text-slate-700">
                      <td className="px-4 py-3">{row.srNo}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{row.studentName}</td>
                      <td className="px-4 py-3">{row.studentEmail}</td>
                      <td className="px-4 py-3">{row.courseName}</td>
                      <td className="px-4 py-3">{row.totalModules}</td>
                      <td className="px-4 py-3">{row.completedModules}</td>
                      <td className="px-4 py-3">{row.progress.toFixed(1)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No course progress data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;
