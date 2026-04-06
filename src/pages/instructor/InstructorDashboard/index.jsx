import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../auth/firebase';
import api from '../../../api/axios';
import InstructorDashboardView from './view';
import { useSocket } from '@context/useSocket';

export const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    avgRating: 0,
    coursesChange: 0,
    studentsChange: 0,
    performanceData: [],
  });
  const [studentRows, setStudentRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Instructor');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const debounceTimer = useRef(null);

  const fetchDashboardStats = useCallback(async (range, options = {}) => {
    const { silent = false } = options;

    try {
      if (!silent) setLoading(true);

      const token = await auth.currentUser?.getIdToken(true);
      const hasValidRange = Boolean(range?.startDate && range?.endDate);
      const params = hasValidRange
        ? {
            startDate: range.startDate,
            endDate: range.endDate,
          }
        : {};

      const [courseRes, studentRes, userRes, enrolledStudentsRes] = await Promise.all([
        api.get('/api/courses/instructor/stats', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }),
        api.get('/api/assignments/instructor/students/count', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }),
        api.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/assignments/instructor/students', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats({
        myCourses: Number(courseRes.data.total_courses || 0),
        totalStudents: Number(studentRes.data.total_students || 0),
        avgRating: Number(courseRes.data.avg_rating || 4.8),
        coursesChange: Number(courseRes.data.coursesChange || 0),
        studentsChange: Number(studentRes.data.studentsChange || 0),
        performanceData: Array.isArray(courseRes.data.performanceData) ? courseRes.data.performanceData : [],
      });

      setStudentRows(Array.isArray(enrolledStudentsRes.data) ? enrolledStudentsRes.data : []);
      setUserName(userRes.data.full_name || 'Instructor');
    } catch (err) {
      console.error('Dashboard stats error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats(dateRange);
  }, [dateRange, fetchDashboardStats]);

  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => fetchDashboardStats(dateRange, { silent: true });

    socket.on('new_notification', handleRefresh);
    socket.on('receive_message', handleRefresh);
    socket.on('dashboard_update', handleRefresh);
    socket.on('connect', handleRefresh);

    return () => {
      socket.off('new_notification', handleRefresh);
      socket.off('receive_message', handleRefresh);
      socket.off('dashboard_update', handleRefresh);
      socket.off('connect', handleRefresh);
    };
  }, [socket, dateRange, fetchDashboardStats]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardStats(dateRange, { silent: true });
    }, 30000);

    return () => clearInterval(timer);
  }, [dateRange, fetchDashboardStats]);

  useEffect(() => {
    const onFocus = () => fetchDashboardStats(dateRange, { silent: true });
    const onVisible = () => {
      if (!document.hidden) fetchDashboardStats(dateRange, { silent: true });
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [dateRange, fetchDashboardStats]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    try {
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      const token = await auth.currentUser.getIdToken();

      const res = await api.get('/api/courses/instructor/search', {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(res.data || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <InstructorDashboardView
      loading={loading}
      userName={userName}
      stats={stats}
      performanceData={stats.performanceData}
      studentRows={studentRows}
      searchResults={searchResults}
      searchLoading={searchLoading}
      onSearch={handleSearch}
      navigate={navigate}
      dateRange={dateRange}
      setDateRange={setDateRange}
    />
  );
};

export default InstructorDashboard;