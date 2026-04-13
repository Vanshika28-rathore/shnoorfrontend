import React from 'react';
import { Plus, Trash2, Code, Terminal } from 'lucide-react';

const PracticeListView = ({ challenges, navigate, handleDelete }) => {
    return (
        <div className="h-full flex flex-col font-sans max-w-360 mx-auto space-y-6">
            {/* GRADIENT HEADER */}
            <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Code size={24} className="text-emerald-300" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Practice Arena</h1>
                            <p className="text-slate-400 text-sm mt-0.5">Manage coding challenges for students.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('new')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
                        <Plus size={16} /> Create Challenge
                    </button>
                </div>
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
                {challenges.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                            <Terminal className="text-slate-300" size={28} />
                        </div>
                        <h3 className="text-sm font-bold text-primary-900 mb-1">No Challenges Yet</h3>
                        <p className="text-xs text-slate-400 mb-4">Create your first coding practice challenge.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</th>
                                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {challenges.map((item) => (
                                    <tr key={item.challenge_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-sm text-primary-900">{item.title}</div>
                                            <div className="text-xs text-slate-400 line-clamp-1 max-w-sm mt-0.5">{item.description}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    item.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {item.difficulty}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs font-mono text-slate-400 uppercase">{item.type}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleDelete(item.challenge_id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                                                title="Delete Challenge">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeListView;
