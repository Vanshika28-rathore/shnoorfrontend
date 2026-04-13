import { Fragment, useEffect, useMemo, useState } from "react";
import { Download, Eye, EyeOff } from "lucide-react";
import api from "../../../api/axios";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatViolationDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const ExamProgress = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowKey, setExpandedRowKey] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/manager/exam-progress");
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch manager exam progress:", error);
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
        rowKey: `${row.student_id || "-"}-${row.exam_id || "no-exam"}-${index}`,
        studentName: row.student_name || "-",
        studentEmail: row.student_email || "-",
        examName: row.exam_name || "-",
        score: row.score === null || row.score === undefined ? null : Number(row.score),
        status: row.status || "-",
        violations: Number(row.violations || 0),
        violationDetails: Array.isArray(row.violation_details) ? row.violation_details : [],
        violationLogText: Array.isArray(row.violation_details) && row.violation_details.length > 0
          ? row.violation_details
              .map(
                (item) =>
                  `${item?.violation_type || "Unknown"} (${formatViolationDateTime(item?.created_at)})`,
              )
              .join(" | ")
          : "No violations",
        updatedAt: formatDate(row.updated_at),
      })),
    [rows],
  );

  const exportToExcel = () => {
    const headers = [
      "Sr No",
      "Student Name",
      "Student Email",
      "Exam",
      "Score",
      "Status",
      "Violations",
      "Violation Log",
      "Updated At",
    ];

    const lines = [
      headers.join("\t"),
      ...exportRows.map((row) =>
        [
          row.srNo,
          row.studentName,
          row.studentEmail,
          row.examName,
          row.score === null ? "-" : row.score,
          row.status,
          row.violations,
          row.violationLogText,
          row.updatedAt,
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
    link.download = "manager_exam_progress.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    doc.setFontSize(14);
    doc.text("Manager Exam Progress Report", 40, 32);

    const columns = [
      { key: "srNo", label: "#", width: 35 },
      { key: "studentName", label: "Student Name", width: 130 },
      { key: "studentEmail", label: "Student Email", width: 160 },
      { key: "examName", label: "Exam", width: 150 },
      { key: "score", label: "Score", width: 65 },
      { key: "status", label: "Status", width: 85 },
      { key: "violations", label: "Violations", width: 70 },
      { key: "updatedAt", label: "Updated At", width: 130 },
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
        examName: "Exam",
        score: "Score",
        status: "Status",
        violations: "Violations",
        updatedAt: "Updated At",
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
            examName: "Exam",
            score: "Score",
            status: "Status",
            violations: "Violations",
            updatedAt: "Updated At",
          },
          true,
        );
      }
      drawRow(row);
    });

    const rowsWithViolationLogs = exportRows.filter((row) => row.violationDetails.length > 0);

    if (rowsWithViolationLogs.length > 0) {
      if (y + 36 > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = 30;
      } else {
        y += 16;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Violation Logs", 40, y);
      y += 16;

      rowsWithViolationLogs.forEach((row) => {
        if (y + 40 > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          y = 30;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const groupTitle = `${row.studentName} | ${row.examName}`;
        doc.text(doc.splitTextToSize(groupTitle, 760), 40, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        row.violationDetails.forEach((item) => {
          const line = `• ${item?.violation_type || "Unknown"} - ${formatViolationDateTime(item?.created_at)}`;
          const wrapped = doc.splitTextToSize(line, 760);

          if (y + wrapped.length * 12 > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            y = 30;
          }

          doc.text(wrapped, 52, y);
          y += wrapped.length * 12 + 2;
        });

        y += 6;
      });
    }

    doc.save("manager_exam_progress.pdf");
  };

  return (
    <div className="space-y-6 font-sans max-w-360 mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}>
        <div className="relative z-10 flex flex-wrap gap-3 justify-between items-start">
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">Manager</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Exam Progress</h1>
            <p className="text-slate-400 mt-1 text-sm">Scores, status, and violations for student exams.</p>
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
          <div className="py-10 text-center text-slate-500 text-sm">Loading exam progress...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Violations</th>
                  <th className="px-4 py-3 font-semibold">Updated At</th>
                  <th className="px-4 py-3 font-semibold text-center">View</th>
                </tr>
              </thead>
              <tbody>
                {exportRows.length > 0 ? (
                  exportRows.map((row) => {
                    const isExpanded = expandedRowKey === row.rowKey;

                    return (
                      <Fragment key={row.rowKey}>
                        <tr className="border-t border-slate-100 text-slate-700">
                          <td className="px-4 py-3">{row.srNo}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{row.studentName}</td>
                          <td className="px-4 py-3">{row.studentEmail}</td>
                          <td className="px-4 py-3">{row.examName}</td>
                          <td className="px-4 py-3">{row.score === null ? "-" : `${row.score.toFixed(1)}%`}</td>
                          <td className="px-4 py-3">{row.status}</td>
                          <td className="px-4 py-3">{row.violations}</td>
                          <td className="px-4 py-3">{row.updatedAt}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedRowKey(isExpanded ? null : row.rowKey)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
                              title={isExpanded ? "Hide violations" : "View violations"}
                            >
                              {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-t border-slate-100 bg-slate-50/60">
                            <td colSpan={9} className="px-4 py-4">
                              <div className="rounded-lg border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                  Violation Log
                                </p>

                                {row.violationDetails.length > 0 ? (
                                  <div className="space-y-2">
                                    {row.violationDetails.map((item, itemIndex) => (
                                      <div
                                        key={`${row.rowKey}-violation-${itemIndex}`}
                                        className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700"
                                      >
                                        <span className="font-medium text-slate-900 min-w-[180px]">
                                          {item?.violation_type || "Unknown"}
                                        </span>
                                        <span className="text-slate-500">
                                          {formatViolationDateTime(item?.created_at)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">No violations found for this record.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No exam progress data found.
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

export default ExamProgress;
