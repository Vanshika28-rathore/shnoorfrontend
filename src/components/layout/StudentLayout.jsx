import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FaList, FaTrophy, FaUserCircle, FaSignOutAlt, FaStar, FaChartLine, FaCompass, FaClipboardList, FaCode } from 'react-icons/fa';
import logo from '../../assets/SHnoor_logo_1.jpg';
import '../../styles/Dashboard.css';
import { useState } from 'react';
import { useEffect } from 'react';
import api from '../../api/axios';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();


 const [studentName, setStudentName] = useState("");

  // fetch DB profile
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/api/users/me");
      setStudentName(res.data.name);
    };
    fetchProfile();
  }, []);    
  
  const xp = 0;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
              <div className="dashboard-container bg-background-muted text-slate-900">
            <div className="sidebar">
                <div className="sidebar-header" style={{ justifyContent: 'center', padding: '10px' }}>
                    <img src={logo} alt="Shnoor Logo" style={{ maxWidth: '80%', maxHeight: '50px', borderRadius: '4px' }} />
                </div>

                <ul className="nav-links">
                    <li
                        className={`nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                        onClick={() => navigate('/student/dashboard')}
                    >
                        <FaChartLine className="nav-icon" /> Dashboard
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('courses') && !location.pathname.includes('dashboard') ? 'active' : ''}`}
                        onClick={() => navigate('/student/courses')}
                    >
                        <FaList className="nav-icon" /> My Courses
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('exams') ? 'active' : ''}`}
                        onClick={() => navigate('/student/exam/:examId')}
                    >
                        <FaClipboardList className="nav-icon" /> Exams
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('certificates') ? 'active' : ''}`}
                        onClick={() => navigate('/student/certificates')}
                    >
                        <FaTrophy className="nav-icon" /> Certificates
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('practice') ? 'active' : ''}`}
                        onClick={() => navigate('/student/practice')}
                    >
                        <FaCode className="nav-icon" /> Practice Arena
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('chat') ? 'active' : ''}`}
                        onClick={() => navigate('/student/chat')}
                    >
                        <span style={{ fontSize: '1.2rem', marginRight: '10px', display: 'flex' }}>💬</span> Messages
                    </li>
                </ul>
            </div>

            <div className="main-content">
                <div className="top-bar">
                    <div className="page-title">
                        <h2 className="text-lg font-semibold text-primary">Student Portal</h2>
                    </div>

                    <div className="user-profile-section">
                        <div style={{
                            background: '#fef9c3', color: '#854d0e', padding: '6px 12px', borderRadius: '20px',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px',
                            border: '1px solid #fde047', marginRight: '15px'
                        }}>
                            <FaStar color="#eab308" /> {xp} XP
                        </div>

                        <div className="user-info">
                            <span className="user-name">{studentName}</span>
                            <span className="user-role">Student</span>
                        </div>
                        <FaUserCircle style={{ fontSize: '2.2rem', color: '#9ca3af' }} />
                        <button onClick={handleLogout} className="logout-btn" title="Logout">
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>

                <div className="content-area">
                    <Outlet context={{ studentName, xp }} />
                </div>
            </div>
        </div>
    );
};

export default StudentLayout;
