import React, { useState, useEffect, useRef } from "react";
import { clientAPI } from "../../../utils/api";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
  FiGlobe,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
} from "react-icons/fi";
import "./ClientProfile.css";

const ClientProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const hasFetchedRef = useRef(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    taxId: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getProfile();

      if (response.data && response.data.data) {
        const profile = response.data.data;

        console.log("✅ Profile data loaded:", profile);

        // Set personal info
        setPersonalInfo({
          name: profile.name || user?.name || "",
          email: profile.email || user?.email || "",
          phone: profile.phone || user?.phone || "",
          avatar: profile.avatar || user?.avatar || "",
        });

        // Set company info
        setCompanyInfo({
          companyName: profile.companyName || "",
          industry: profile.industry || "",
          companySize: profile.companySize || "",
          website: profile.companyWebsite || profile.website || "",
          address: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "",
          taxId: profile.taxInfo?.taxId || "",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      console.log('====================================');
      console.log('💾 SAVING CLIENT PROFILE');
      console.log('====================================');

      // ✅ Build clean profile data - only send non-empty strings
      const profileData = {
        // Personal info - always send these
        name: personalInfo.name?.trim() || '',
        email: personalInfo.email?.trim() || '',
        phone: personalInfo.phone?.trim() || '',
      };

      // Only add avatar if it exists
      if (personalInfo.avatar?.trim()) {
        profileData.avatar = personalInfo.avatar.trim();
      }

      // Only add company info if they exist
      if (companyInfo.companyName?.trim()) {
        profileData.companyName = companyInfo.companyName.trim();
      }

      if (companyInfo.industry?.trim()) {
        profileData.industry = companyInfo.industry.trim();
      }

      if (companyInfo.companySize?.trim()) {
        profileData.companySize = companyInfo.companySize.trim();
      }

      if (companyInfo.website?.trim()) {
        profileData.website = companyInfo.website.trim();
      }

      // Only add address fields if they exist
      if (companyInfo.address?.trim()) {
        profileData.address = companyInfo.address.trim();
      }

      if (companyInfo.city?.trim()) {
        profileData.city = companyInfo.city.trim();
      }

      if (companyInfo.state?.trim()) {
        profileData.state = companyInfo.state.trim();
      }

      if (companyInfo.zipCode?.trim()) {
        profileData.zipCode = companyInfo.zipCode.trim();
      }

      if (companyInfo.country?.trim()) {
        profileData.country = companyInfo.country.trim();
      }

      // Only add taxId if it exists
      if (companyInfo.taxId?.trim()) {
        profileData.taxId = companyInfo.taxId.trim();
      }

      console.log('📤 Sending profile data:', JSON.stringify(profileData, null, 2));
      console.log('====================================');

      const response = await clientAPI.updateProfile(profileData);

      console.log('✅ Server response:', response.data);
      console.log('====================================');

      if (response.data && response.data.success) {
        const updatedProfile = response.data.data;

        // Update local state with server response
        setPersonalInfo({
          name: updatedProfile.name || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          avatar: updatedProfile.avatar || '',
        });

        setCompanyInfo({
          companyName: updatedProfile.companyName || '',
          industry: updatedProfile.industry || '',
          companySize: updatedProfile.companySize || '',
          website: updatedProfile.companyWebsite || updatedProfile.website || '',
          address: updatedProfile.address?.street || '',
          city: updatedProfile.address?.city || '',
          state: updatedProfile.address?.state || '',
          zipCode: updatedProfile.address?.zipCode || '',
          country: updatedProfile.address?.country || '',
          taxId: updatedProfile.taxInfo?.taxId || '',
        });

        toast.success('✅ Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      console.error('====================================');
      console.error('❌ PROFILE UPDATE ERROR');
      console.error('====================================');
      console.error('Full Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('====================================');

      // Show detailed error message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Failed to update profile';
      
      const errorDetails = error.response?.data?.errors 
        ? '\n' + error.response.data.errors.join('\n')
        : '';

      toast.error(`❌ ${errorMessage}${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      await clientAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
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
            <button
              className="btn-save"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              <FiSave /> {loading ? 'Saving...' : 'Save'}
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
            <FiUser /> Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={personalInfo.name}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>
            <FiMail /> Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={personalInfo.email}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
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
            value={personalInfo.phone}
            onChange={handlePersonalChange}
            disabled={!editing}
            className="form-input"
            placeholder="+1234567890"
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
            <button
              className="btn-save"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              <FiSave /> {loading ? 'Saving...' : 'Save'}
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
          <FiLock /> {loading ? 'Changing...' : 'Change Password'}
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
          {personalInfo.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'C'}
        </div>
        <div className="profile-info">
          <h1>{personalInfo.name || "Loading..."}</h1>
          <p className="profile-email">{personalInfo.email || "Loading..."}</p>
          <p className="profile-role">Client</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <FiUser /> Personal Info
        </button>
        <button
          className={`tab-btn ${activeTab === "company" ? "active" : ""}`}
          onClick={() => setActiveTab("company")}
        >
          <FiHome /> Company Info
        </button>
        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <FiLock /> Security
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "personal" && renderPersonalInfo()}
        {activeTab === "company" && renderCompanyInfo()}
        {activeTab === "security" && renderSecurity()}
      </div>
    </div>
  );
};

export default ClientProfile;