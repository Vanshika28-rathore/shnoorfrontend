import React from 'react';
import { User, Mail, BookOpen, Phone, Info, GraduationCap, CheckCircle2 } from 'lucide-react';

const AddInstructorView = ({ loading, data, handleChange, handleSubmit, navigate,showSuccessPopup, setShowSuccessPopup }) => {

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[var(--color-indigo-600)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium tracking-tight">Adding instructor...</p>
            </div>
        </div>
    );

    return (
        <div className="p-2 w-full h-full flex flex-col font-sans">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[var(--color-indigo-600)] flex items-center justify-center shadow-sm border border-indigo-100">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Instructor Details</h2>
                        <p className="text-base text-slate-500 font-medium">Add a new instructor to the platform.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    name="fullName"
                                    value={data.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter User name"
                                    className="input-field !pl-12 text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your gmail"
                                    className="input-field !pl-12 text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Subject / Specialization</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    name="subject"
                                    value={data.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mathematics, ReactJS..."
                                    className="input-field !pl-12 text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Phone (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    name="phone"
                                    value={data.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234..."
                                    className="input-field !pl-12 text-base"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Bio (Optional)</label>
                        <div className="relative">
                            <Info className="absolute left-4 top-4 text-slate-400" size={20} />
                            <textarea
                                name="bio"
                                value={data.bio}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Short biography..."
                                className="input-field !pl-12 resize-none text-base"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/dashboard')}
                            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-[var(--color-primary)] hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 transform transition-all active:scale-[0.98] text-sm"
                        >
                            Add Instructor
                        </button>
                    </div>
                </form>
            </div>
            {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Assignment Complete!
            </h3>
            <p className="text-slate-500 mb-6">
              Courses have been successfully assigned to the selected students.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-[var(--color-primary)] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Continue
            </button>
          </div>
        </div>
      )}
        </div>
    );
};

export default AddInstructorView;
