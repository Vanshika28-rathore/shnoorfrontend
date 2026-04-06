import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaSave, FaLock } from 'react-icons/fa';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../auth/firebase';
import '../../styles/Dashboard.css';

const InstructorSettings = () => {
    const [profile, setProfile] = useState({
        displayName: '',
        bio: '',
        email: ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        setProfile({
            displayName: auth.currentUser.displayName || 'Instructor Name',
            bio: 'This is a mock bio for frontend demo.',
            email: auth.currentUser.email
        });
        setLoading(false);
    };

    const handleProfileUpdate = async () => {
        try {
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, passwords.current);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, passwords.new);
            alert("Password changed successfully!");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Failed to change password. check your current password.");
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="content-area">
            <div className="page-title mb-lg">
                <h2>Instructor Profile & Settings</h2>
            </div>

            <div className="form-box full-width mb-lg">
                <h4 className="form-header flex-center-gap">
                    <FaUserEdit /> Public Profile
                </h4>
                <div className="grid-2">
                    <div className="full-width form-group">
                        <label>Display Name</label>
                        <input
                            value={profile.displayName}
                            onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                        />
                    </div>
                    <div className="full-width form-group">
                        <label>Bio (Visible to students)</label>
                        <textarea
                            rows="3"
                            value={profile.bio}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button className="btn-primary" onClick={handleProfileUpdate}>
                        <FaSave /> Save Profile
                    </button>
                </div>
            </div>

            <div className="form-box full-width">
                <h4 className="form-header flex-center-gap">
                    <FaLock /> Security
                </h4>
                <div className="grid-2">
                    <div className="full-width form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button className="btn-secondary" onClick={handlePasswordChange}>
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructorSettings;
