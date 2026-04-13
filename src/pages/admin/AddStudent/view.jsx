import React from 'react';
import { User, Mail, Phone, Building, UserPlus, CheckCircle2, ArrowLeft, Upload, FileText, X, Info, LockKeyhole, Check, AlertCircle } from 'lucide-react';

const AddStudentView = ({
    loading, data, handleChange, handleSubmit, navigate, showSuccessPopup, setShowSuccessPopup, error,
    showBulkUpload, setShowBulkUpload, handleBulkFileSelect, bulkFile, handleBulkUpload,
    bulkUploadProgress, isBulkUploading, bulkUploadResult, closeBulkUpload
}) => {

    if (loading) return (
        <div className="flex items-center justify-center min-h-125">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 font-medium text-sm">Adding student...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col font-sans max-w-360 mx-auto space-y-6">
            {/* GRADIENT HEADER */}
            <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
                <div className="relative z-10 flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')}
                        className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <UserPlus size={24} className="text-emerald-300" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Add Student</h1>
                        <p className="text-slate-400 text-sm mt-0.5">Fill in the details to register a new student.</p>
                    </div>
                </div>
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 lg:px-8 pt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowBulkUpload(true)}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-2 transition-all"
                    >
                        <Upload size={16} className="text-emerald-500" />
                        Bulk Upload (CSV)
                    </button>
                </div>
                {error && (
                    <div className="mx-6 lg:mx-8 mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="fullName" value={data.fullName} onChange={handleChange} required
                                    placeholder="Enter student name"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium
                                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="email" type="email" value={data.email} onChange={handleChange} required
                                    placeholder="Enter student email"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium
                                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone (Optional)</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="phone" value={data.phone} onChange={handleChange}
                                    placeholder="+1 234..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium
                                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">College / Institution (Optional)</label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="college" value={data.college} onChange={handleChange}
                                    placeholder="University or institution"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium
                                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password (Optional)</label>
                            <div className="relative group">
                                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="password" type="password" value={data.password} onChange={handleChange}
                                    placeholder="Leave blank to send a create-password email"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium
                                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                        <button type="button" onClick={() => navigate('/admin/dashboard')}
                            className="px-6 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all border border-slate-200 text-sm">
                            Cancel
                        </button>
                        <button type="submit"
                            className="px-8 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] hover:shadow-xl"
                            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
                            Add Student
                        </button>
                    </div>
                </form>
            </div>

            {/* SUCCESS POPUP */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-primary-900 mb-2">Student Added!</h3>
                        <p className="text-slate-400 text-sm mb-6">The student account has been created and the invite email includes the next login steps.</p>
                        <button onClick={() => setShowSuccessPopup()}
                            className="w-full py-3 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 text-sm"
                            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* BULK UPLOAD MODAL */}
            {showBulkUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Bulk Upload Students</h3>
                            <button onClick={closeBulkUpload} className="text-slate-400 hover:text-slate-600 outline-none">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            {!bulkUploadResult ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
                                        <div className="flex gap-3">
                                            <Info className="text-indigo-600 shrink-0" size={18} />
                                            <p className="text-xs text-indigo-900 leading-relaxed">
                                                Upload a CSV file with these columns:
                                                <span className="block font-bold mt-1">fullName, email, phone (opt), college (opt)</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleBulkFileSelect}
                                            className="hidden"
                                            id="bulk-csv-student"
                                            disabled={isBulkUploading}
                                        />
                                        <label
                                            htmlFor="bulk-csv-student"
                                            className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                                                ${bulkFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                <FileText className={bulkFile ? 'text-indigo-600' : 'text-slate-400'} size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {bulkFile ? bulkFile.name : 'Choose CSV File'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Max file size 10MB
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {isBulkUploading && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                                <span>Uploading...</span>
                                                <span>{bulkUploadProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 transition-all duration-300"
                                                    style={{ width: `${bulkUploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeBulkUpload}
                                            disabled={isBulkUploading}
                                            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBulkUpload}
                                            disabled={!bulkFile || isBulkUploading}
                                            className="flex-[2] py-3 px-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 text-sm"
                                            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                                        >
                                            {isBulkUploading ? 'Processing...' : 'Upload & Process'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border
                                            ${bulkUploadResult.errors.length === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {bulkUploadResult.errors.length === 0 ? <Check size={32} /> : <AlertCircle size={32} />}
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">Process Completed</h4>
                                        <p className="text-slate-500 text-sm">
                                            Successfully added <span className="font-bold text-emerald-600">{bulkUploadResult.successCount}</span> students.
                                        </p>
                                    </div>

                                    {bulkUploadResult.errors.length > 0 && (
                                        <div className="max-h-48 overflow-auto border border-amber-100 rounded-xl bg-amber-50/50">
                                            <div className="p-3 border-b border-amber-100 sticky top-0 bg-amber-50">
                                                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">Errors ({bulkUploadResult.errors.length})</p>
                                            </div>
                                            <div className="divide-y divide-amber-100">
                                                {bulkUploadResult.errors.map((err, idx) => (
                                                    <div key={idx} className="p-3">
                                                        <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                                            {err.email ? `${err.email}: ` : `Row ${err.row}: `}
                                                            <span className="font-normal">{err.message}</span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={closeBulkUpload}
                                        className="w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] text-sm"
                                        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddStudentView;