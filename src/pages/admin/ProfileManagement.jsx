import React from 'react';
import { FaUserCircle, FaCog, FaGlobe } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const AdminProfileManagement = () => {
  return (
    <div className="form-container">
      <div className="form-box">
        <h3 className="form-header">Profile & Platform Settings</h3>
        <div className="profile-header">
          <FaUserCircle className="profile-avatar-large" />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1f2937' }}>Super Admin</h4>
            <p style={{ margin: '5px 0 0', color: '#6b7280' }}>admin@shnoor.com</p>
            <span className="role-badge">System Administrator</span>
          </div>
        </div>

        <h4 style={{ color: '#003366', marginBottom: '15px' }}>General Preferences</h4>
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaGlobe style={{ fontSize: '1.5rem', color: '#4b5563' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Timezone & Region</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Asia/Kolkata (GMT+5:30)</div>
            </div>
          </div>
          <button className="btn-secondary">Edit</button>
        </div>
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaCog style={{ fontSize: '1.5rem', color: '#4b5563' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Default Branding</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Shnoor LMS Theme (Navy Blue)</div>
            </div>
          </div>
          <button className="btn-secondary">Customize</button>
        </div>
      </div>
    </div>
  );
};
export default AdminProfileManagement;