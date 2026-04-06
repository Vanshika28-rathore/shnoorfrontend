import React from "react";

export default function DateRangeFilter({ value, onChange, presets = true }) {
  // value: { startDate, endDate } or null
  // onChange: (newValue) => void
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Helper to get first/last day of week/month
  const getRange = (type) => {
    const now = new Date();
    if (type === "today") {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (type === "week") {
      const first = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      const last = new Date(now.setDate(first.getDate() + 6));
      return {
        startDate: first.toISOString().slice(0, 10),
        endDate: last.toISOString().slice(0, 10),
      };
    }
    if (type === "month") {
      const first = new Date(yyyy, today.getMonth(), 1);
      const last = new Date(yyyy, today.getMonth() + 1, 0);
      return {
        startDate: first.toISOString().slice(0, 10),
        endDate: last.toISOString().slice(0, 10),
      };
    }
    return value;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {presets && (
        <div className="flex flex-wrap gap-2">
          <button 
            type="button" 
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
            onClick={() => onChange(getRange("today"))}
          >
            Today
          </button>
          <button 
            type="button" 
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
            onClick={() => onChange(getRange("week"))}
          >
            This Week
          </button>
          <button 
            type="button" 
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
            onClick={() => onChange(getRange("month"))}
          >
            This Month
          </button>
          {value && (
            <button 
              type="button" 
              className="px-3 py-1.5 rounded-md border border-red-300 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
              onClick={() => onChange(null)}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value?.startDate || ""}
            onChange={e => onChange({ ...value, startDate: e.target.value })}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            placeholder="Start Date"
          />
        </div>
        <div className="flex items-center justify-center">
          <span className="text-xs text-slate-500 font-medium">to</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value?.endDate || ""}
            onChange={e => onChange({ ...value, endDate: e.target.value })}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            placeholder="End Date"
          />
        </div>
      </div>
      {!value && (
        <div className="text-center py-2">
          <span className="text-xs text-indigo-600 font-semibold">📊 Showing All-Time Data</span>
        </div>
      )}
    </div>
  );
}