import React from 'react';
import { FaUserCircle, FaCog, FaGlobe } from 'react-icons/fa';

const AdminProfileManagement = () => {
  return (
    <div className="h-full flex flex-col font-sans max-w-360 mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="relative z-10">
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Profile & Platform Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage admin identity and default platform preferences.</p>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <FaUserCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Super Admin</h2>
            <p className="text-sm text-slate-500">admin@shnoor.com</p>
            <span className="inline-flex mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100 bg-indigo-50 text-indigo-600">
              System Administrator
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">General Preferences</h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center">
                <FaGlobe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Timezone & Region</p>
                <p className="text-sm text-slate-500">Asia/Kolkata (GMT+5:30)</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-white transition-colors">
              Edit
            </button>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center">
                <FaCog className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Default Branding</p>
                <p className="text-sm text-slate-500">Shnoor LMS Theme (Navy Blue)</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-white transition-colors">
              Customize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileManagement;