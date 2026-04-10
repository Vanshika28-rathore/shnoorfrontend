import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { auth } from '../../auth/firebase';

const PracticeList = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [completedIds, setCompletedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;
            try {
                const token = await auth.currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch challenges and completed IDs in parallel
                const [challengesRes, completedRes] = await Promise.all([
                    api.get('/api/practice', { headers }),
                    api.get('/api/practice/completed', { headers }).catch(() => ({ data: { completedChallengeIds: [] } }))
                ]);

                // Shuffle challenges randomly (Fisher-Yates)
                const data = [...challengesRes.data];
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }
                setChallenges(data);

                // Store completed challenge IDs as a Set for O(1) lookups
                const ids = completedRes.data?.completedChallengeIds || [];
                setCompletedIds(new Set(ids));
            } catch (err) {
                console.error("Failed to fetch challenges", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading challenges...</div>;

    return (
        <div className="h-full flex flex-col font-sans max-w-[1440px] mx-auto space-y-6 p-4 md:p-0">
            {/* GRADIENT HEADER */}
            <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <Code size={24} className="text-indigo-300" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Practice Zone</h1>
                        <p className="text-slate-400 text-sm mt-0.5">Sharpen your coding skills with these challenges.</p>
                    </div>
                </div>
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {challenges.map(challenge => {
                    const isCompleted = completedIds.has(challenge.challenge_id);
                    return (
                        <div
                            key={challenge.challenge_id}
                            className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all p-6 cursor-pointer group ${isCompleted
                                ? 'border-emerald-300 bg-emerald-50/30'
                                : 'border-slate-200'
                                }`}
                            onClick={() => navigate(`/student/practice/session/${challenge.challenge_id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isCompleted
                                    ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                    : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={20} /> : <Code size={20} />}
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                                        {challenge.difficulty}
                                    </span>
                                    {isCompleted && (
                                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            <CheckCircle size={12} className="text-emerald-600" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">
                                {challenge.title}
                            </h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                {challenge.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock size={14} /> 15 mins
                                </div>
                                <button className={`text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'
                                    }`}>
                                    {isCompleted ? 'Review' : 'Solve'} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {challenges.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Code size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No active challenges found.</p>
                </div>
            )}
        </div>
    );
};

export default PracticeList;