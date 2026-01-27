import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiHome,      // ← Changed from FiBuilding
  FiGlobe,
  FiEdit2,
  FiSave,
  FiX,
  FiLock
} from 'react-icons/fi';
import './ClientProfile.css';

const ClientProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    taxId: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getProfile();
      if (response.data) {
        const profile = response.data;
        setPersonalInfo({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          avatar: profile.avatar || '',
        });
        setCompanyInfo({
          companyName: profile.companyName || '',
          industry: profile.industry || '',
          companySize: profile.companySize || '',
          website: profile.website || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          country: profile.country || '',
          taxId: profile.taxId || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
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

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        ...personalInfo,
        ...companyInfo,
      };

      const response = await clientAPI.updateProfile(profileData);
      
      if (response.data) {
        updateUser(response.data);
        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      
      await clientAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>
          <FiUser /> Personal Information
        </h3>
        {!editing ? (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSaveProfile} disabled={loading}>
              <FiSave /> Save
            </button>
            <button className="btn-cancel" onClick={() => setEditing(false)}>
              <FiX /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-grid">
        <div className="form-group">
          <label>
            <FiUser /> Full Name
          </label>
          <input
            type="text"
            name="name"
            value={personalInfo.name}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <FiMail /> Email Address
          </label>
          <input
            type="email"
            name="email"
            value={personalInfo.email}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <FiPhone /> Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={personalInfo.phone}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Avatar URL</label>
          <input
            type="text"
            name="avatar"
            value={personalInfo.avatar}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>
          <FiHome /> Company Information
        </h3>
        {!editing ? (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSaveProfile} disabled={loading}>
              <FiSave /> Save
            </button>
            <button className="btn-cancel" onClick={() => setEditing(false)}>
              <FiX /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-grid">
        <div className="form-group">
          <label>
            <FiHome /> Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={companyInfo.companyName}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Industry</label>
          <select
            name="industry"
            value={companyInfo.industry}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Company Size</label>
          <select
            name="companySize"
            value={companyInfo.companySize}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <FiGlobe /> Website
          </label>
          <input
            type="text"
            name="website"
            value={companyInfo.website}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
            placeholder="www.company.com"
          />
        </div>

        <div className="form-group full-width">
          <label>
            <FiMapPin /> Address
          </label>
          <input
            type="text"
            name="address"
            value={companyInfo.address}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={companyInfo.city}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>State/Province</label>
          <input
            type="text"
            name="state"
            value={companyInfo.state}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>ZIP/Postal Code</label>
          <input
            type="text"
            name="zipCode"
            value={companyInfo.zipCode}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={companyInfo.country}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Tax ID / Registration Number</label>
          <input
            type="text"
            name="taxId"
            value={companyInfo.taxId}
            onChange={handleCompanyChange}
            disabled={!editing}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>
          <FiLock /> Change Password
        </h3>
      </div>

      <form onSubmit={handleChangePassword} className="password-form">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="form-input"
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="form-input"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          <FiLock /> Change Password
        </button>
      </form>

      <div className="password-requirements">
        <h4>Password Requirements:</h4>
        <ul>
          <li>Minimum 6 characters long</li>
          <li>Should contain letters and numbers</li>
          <li>Avoid using common passwords</li>
        </ul>
      </div>
    </div>
  );

  if (loading && !personalInfo.name) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {personalInfo.avatar ? (
            <img src={personalInfo.avatar} alt={personalInfo.name} />
          ) : (
            <div className="avatar-placeholder">
              <FiUser />
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{personalInfo.name}</h1>
          <p className="profile-email">{personalInfo.email}</p>
          <p className="profile-role">Client</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <FiUser /> Personal Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <FiHome /> Company Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FiLock /> Security
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'company' && renderCompanyInfo()}
        {activeTab === 'security' && renderSecurity()}
      </div>
    </div>
  );
};

export default ClientProfile;