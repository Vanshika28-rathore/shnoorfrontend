import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "../../../api/axios";

const formatDateTime = (value) => {
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

const ManagerList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/api/admin/managers");
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch managers list:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  return (
    <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)" }}
      >
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Users size={24} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Manager List</h1>
            <p className="text-slate-400 text-sm mt-0.5">All manager accounts and profile details.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium text-sm">Loading managers...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">College</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account Created</th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.length > 0 ? (
                  rows.map((manager, index) => (
                    <tr key={manager.user_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-slate-500">{index + 1}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-primary-900">{manager.full_name || "-"}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{manager.email || "-"}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{manager.college || "-"}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 tabular-nums">{formatDateTime(manager.created_at)}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 tabular-nums">{formatDateTime(manager.last_login)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <p className="text-sm text-slate-400 font-medium">No managers found.</p>
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

export default ManagerList;
