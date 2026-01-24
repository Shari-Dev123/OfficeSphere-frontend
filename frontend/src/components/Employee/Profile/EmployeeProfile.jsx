import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEdit2, FiSave } from 'react-icons/fi';
import './EmployeeProfile.css';

function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : '',
        emergencyContact: response.data.emergencyContact || '',
        emergencyPhone: response.data.emergencyPhone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await employeeAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="employee-profile">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-profile">
      <div className="profile-header">
        <h1><FiUser /> My Profile</h1>
        {!editing && (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{profile?.name}</h2>
            <p className="profile-role">{profile?.role || 'Employee'}</p>
            <p className="profile-id">ID: {profile?.employeeId || 'N/A'}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-group">
              <label>
                <FiUser /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>
                <FiMapPin /> Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Contact Name"
              />
            </div>

            <div className="form-group full-width">
              <label>Emergency Phone</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Emergency Contact Number"
              />
            </div>
          </div>

          {editing && (
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <FiSave /> Save Changes
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password Section */}
      <div className="password-section">
        <div className="section-header">
          <h3><FiLock /> Change Password</h3>
          {!changingPassword && (
            <button 
              className="change-password-btn"
              onClick={() => setChangingPassword(true)}
            >
              Change Password
            </button>
          )}
        </div>

        {changingPassword && (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter new password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Confirm new password"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                Update Password
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EmployeeProfile;