import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../auth/firebase';

export const RANKS = {
    NOVICE: { name: 'Novice', minXP: 0, color: 'text-slate-600', bg: 'bg-slate-100' },
    APPRENTICE: { name: 'Apprentice', minXP: 100, color: 'text-[#003B5C]', bg: 'bg-[#DBEAFE]' },
    SCHOLAR: { name: 'Scholar', minXP: 500, color: 'text-amber-700', bg: 'bg-amber-100' },
    MASTER: { name: 'Master', minXP: 1000, color: 'text-[#E8AA25]', bg: 'bg-[#FEF3C7]' }
};

export const getRank = (xp) => {
    if (xp >= 1000) return RANKS.MASTER;
    if (xp >= 500) return RANKS.SCHOLAR;
    if (xp >= 100) return RANKS.APPRENTICE;
    return RANKS.NOVICE;
};

export const getNextLevelProgress = (xp) => {
    let nextLevelXP = 100;
    if (xp >= 1000) return { progress: 100, nextLevelXP: 'Max' };
    if (xp >= 500) nextLevelXP = 1000;
    else if (xp >= 100) nextLevelXP = 500;

    const progress = Math.min(Math.round((xp / nextLevelXP) * 100), 100);
    return { progress, nextLevelXP };
};

export const awardXP = async (userId, amount, reason) => {
    if (!userId) return;

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            xp: increment(amount),
            lastXPAward: new Date().toISOString()
        });

        console.log(`Awarded ${amount} XP to user ${userId} for ${reason}`);
        return true;
    } catch (error) {
        console.error("Error awarding XP:", error);
        return false;
    }
};

export const checkDailyStreak = async (userId) => {
    if (!userId) return;

    const today = new Date().toDateString();
    const userRef = doc(db, "users", userId);

    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastLogin = data.lastLoginDate;
            let currentStreak = data.streak || 0;

            if (lastLogin === today) return currentStreak;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastLogin === yesterday.toDateString()) {
                currentStreak += 1;
            } else {
                currentStreak = 1;
            }

            await updateDoc(userRef, {
                lastLoginDate: today,
                streak: currentStreak
            });

            if (lastLogin !== today) {
                await awardXP(userId, 5, 'Daily Login');
            }

            return currentStreak;
        }
    } catch (error) {
        console.error("Error checking streak:", error);
        return 0;
    }
};
