import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import api from "../../../api/axios";

const formatDateIST = (value) => {
  if (!value) return "-";
  // If no timezone info, treat as UTC (how DB stores it)
  let normalizedValue = value;
  if (typeof value === "string" && !value.includes("Z") && !value.includes("+")) {
    normalizedValue = value + "Z";
  }
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })} IST`;
};

const getStudentRankLabel = (xp) => {
  const value = Number(xp || 0);
  if (value >= 500) return "Expert";
  if (value >= 200) return "Intermediate";
  return "Novice";
};

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/api/manager/students");
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch manager students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const exportRows = useMemo(() => {
    const sortedStudents = [...students].sort((a, b) => {
      const xpDiff = Number(b.xp || 0) - Number(a.xp || 0);
      if (xpDiff !== 0) return xpDiff;

      const streakDiff = Number(b.streak || 0) - Number(a.streak || 0);
      if (streakDiff !== 0) return streakDiff;

      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    });

    return sortedStudents.map((student, index) => ({
      srNo: index + 1,
      rank: getStudentRankLabel(student.xp),
      name: student.full_name || "-",
      email: student.email || "-",
      xp: Number(student.xp || 0),
      streak: Number(student.streak || 0),
      accountCreated: formatDateIST(student.created_at),
      lastLogin: formatDateIST(student.last_login),
    }));
  }, [students]);

  const exportToExcel = () => {
    const headers = [
      "Sr No",
      "Name",
      "Email",
      "Rank",
      "XP",
      "Streak",
      "Account Created",
      "Last Login",
    ];

    const lines = [
      headers.join("\t"),
      ...exportRows.map((row) =>
        [
          row.srNo,
          row.name,
          row.email,
          row.rank,
          row.xp,
          row.streak,
          row.accountCreated,
          row.lastLogin,
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
    link.download = "manager_students.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    doc.setFontSize(14);
    doc.text("Manager Students Report", 40, 32);
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDateIST(new Date())}`, 40, 48);

    const rowHeight = 20;
    const top = 70;
    let y = top;

    const columns = [
      { key: "srNo", label: "#", width: 35 },
      { key: "name", label: "Name", width: 140 },
      { key: "email", label: "Email", width: 170 },
      { key: "rank", label: "Rank", width: 60 },
      { key: "xp", label: "XP", width: 60 },
      { key: "streak", label: "Streak", width: 60 },
      { key: "accountCreated", label: "Account Created", width: 140 },
      { key: "lastLogin", label: "Last Login", width: 140 },
    ];

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
        name: "Name",
        email: "Email",
        rank: "Rank",
        xp: "XP",
        streak: "Streak",
        accountCreated: "Account Created",
        lastLogin: "Last Login",
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
            name: "Name",
            email: "Email",
            rank: "Rank",
            xp: "XP",
            streak: "Streak",
            accountCreated: "Account Created",
            lastLogin: "Last Login",
          },
          true,
        );
      }
      drawRow(row, false);
    });

    doc.save("manager_students.pdf");
  };

  return (
    <div className="space-y-6 font-sans max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}>
        <div className="relative z-10 flex flex-wrap gap-3 justify-between items-start">
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">Manager</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">View Students</h1>
            <p className="text-slate-400 mt-1 text-sm">Students from your college with activity details.</p>
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
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-900">Student List</h2>

        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500 text-sm">Loading students...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">XP</th>
                  <th className="px-4 py-3 font-semibold">Streak</th>
                  <th className="px-4 py-3 font-semibold">Account Created</th>
                  <th className="px-4 py-3 font-semibold">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {exportRows.length > 0 ? (
                  exportRows.map((row) => (
                    <tr key={`${row.email}-${row.srNo}`} className="border-t border-slate-100 text-slate-700">
                      <td className="px-4 py-3">{row.srNo}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-3">{row.email}</td>
                      <td className="px-4 py-3">{row.rank}</td>
                      <td className="px-4 py-3">{row.xp}</td>
                      <td className="px-4 py-3">{row.streak}</td>
                      <td className="px-4 py-3">{row.accountCreated}</td>
                      <td className="px-4 py-3">{row.lastLogin}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No students found for your college.
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

export default ViewStudents;