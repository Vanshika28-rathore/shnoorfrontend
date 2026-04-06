import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { getRank } from '../../utils/gamification.js';


const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            let fetchedUsers = [];
            try {
                const usersRef = collection(db, "users");
                const q = query(
                    usersRef,
                    where("role", "==", "student"),
                    orderBy("xp", "desc"),
                    limit(10)
                );

                const snapshot = await getDocs(q);
                fetchedUsers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

            } catch (error) {
                console.warn("Leaderboard fetch failed (likely missing index), using mock data:", error);
            } finally {
                if (fetchedUsers.length < 5) {
                    const bots = [
                        { id: 'bot1', displayName: 'Alice Bot', xp: 1250, role: 'student' },
                        { id: 'bot2', displayName: 'Bob Bot', xp: 980, role: 'student' },
                        { id: 'bot3', displayName: 'Charlie Bot', xp: 850, role: 'student' },
                        { id: 'bot4', displayName: 'Diana Bot', xp: 720, role: 'student' },
                        { id: 'bot5', displayName: 'Evan Bot', xp: 500, role: 'student' },
                        { id: 'bot6', displayName: 'Frank Bot', xp: 450, role: 'student' },
                        { id: 'bot7', displayName: 'Grace Bot', xp: 300, role: 'student' },
                    ];
                    fetchedUsers = [...fetchedUsers, ...bots].sort((a, b) => b.xp - a.xp).slice(0, 10);
                }

                setLeaders(fetchedUsers);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);



    if (loading) return <div className="p-8 text-center text-gray-500">Loading Rankings...</div>;

    const topThree = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-2 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} /> Student Leaderboard
            </h2>
            <p className="text-slate-500 mb-8">Compete with peers and earn your place among the masters!</p>

            <div className="flex justify-center items-end gap-4 mb-12 h-64">
                {topThree[1] && (
                    <div className="flex flex-col items-center animate-bounce-slow-2s">
                        <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center mb-2 overflow-hidden shadow-lg relative">
                            <span className="text-2xl font-bold text-slate-500">{topThree[1].displayName[0]}</span>
                            <div className="absolute -top-1 -right-1 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white">2</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-slate-700 text-sm">{topThree[1].displayName}</div>
                            <div className="text-xs text-slate-500 font-mono">{topThree[1].xp} XP</div>
                        </div>
                        <div className="w-24 bg-gradient-to-t from-slate-300 to-slate-100 rounded-t-lg shadow-sm h-32 flex items-end justify-center pb-2">
                            <Medal className="text-slate-400" size={32} />
                        </div>
                    </div>
                )}

                {topThree[0] && (
                    <div className="flex flex-col items-center z-10 animate-bounce-slow">
                        <Crown className="text-yellow-500" size={32} style={{ marginBottom: '4px', transform: 'rotate(12deg)' }} />
                        <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center mb-2 overflow-hidden shadow-xl relative">
                            <span className="text-3xl font-bold text-yellow-600">{topThree[0].displayName[0]}</span>
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">1</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-primary-900">{topThree[0].displayName}</div>
                            <div className="text-sm text-yellow-600 font-mono font-bold">{topThree[0].xp} XP</div>
                        </div>
                        <div className="w-28 bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-t-lg shadow-md h-40 flex items-end justify-center pb-4">
                            <Trophy className="text-yellow-500" size={40} />
                        </div>
                    </div>
                )}

                {topThree[2] && (
                    <div className="flex flex-col items-center animate-bounce-slow-2-5s">
                        <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center mb-2 overflow-hidden shadow-lg relative">
                            <span className="text-2xl font-bold text-amber-600">{topThree[2].displayName[0]}</span>
                            <div className="absolute -top-1 -right-1 bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white">3</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-slate-700 text-sm">{topThree[2].displayName}</div>
                            <div className="text-xs text-slate-500 font-mono">{topThree[2].xp} XP</div>
                        </div>
                        <div className="w-24 bg-gradient-to-t from-amber-300 to-amber-100 rounded-t-lg shadow-sm h-24 flex items-end justify-center pb-2">
                            <Medal className="text-amber-600" size={32} />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto custom-scrollbar overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="py-3 px-4 text-left text-slate-500 font-semibold text-sm w-16">Rank</th>
                            <th className="py-3 px-4 text-left text-slate-500 font-semibold text-sm">Student</th>
                            <th className="py-3 px-4 text-left text-slate-500 font-semibold text-sm">Level</th>
                            <th className="py-3 px-4 text-right text-slate-500 font-semibold text-sm">Total XP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rest.map((student, idx) => {
                            const rank = getRank(student.xp);
                            return (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-400">#{idx + 4}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {student.displayName[0]}
                                            </div>
                                            <span className="text-slate-900 font-medium">{student.displayName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${rank.color} ${rank.bg} bg-opacity-50 border-opacity-30 font-semibold`}>
                                            {rank.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-600 font-bold">
                                        {student.xp} XP
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Leaderboard;
