import { useNavigate } from 'react-router-dom';
import { useAuth } from '@auth/useAuth';
import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import PracticeListView from './view';

const PracticeList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchChallenges();
        }
    }, [currentUser]);

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/api/practice');
            setChallenges(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load challenges");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this challenge?")) return;

        try {
            await api.delete(`/api/practice/${id}`);
            toast.success("Challenge deleted");
            setChallenges(challenges.filter(c => c.challenge_id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete challenge");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <PracticeListView
            challenges={challenges}
            navigate={navigate}
            handleDelete={handleDelete}
        />
    );
};

export default PracticeList;
