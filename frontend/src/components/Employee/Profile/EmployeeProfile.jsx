import React, { useState, useEffect } from "react";
import { employeeAPI } from "../../../utils/api";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiEdit2,
  FiSave,
  FiBriefcase,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiFileText,
  FiDollarSign,
  FiHeart,
  FiHome,
  FiAlertCircle,
  FiCreditCard,
} from "react-icons/fi";
import "./EmployeeProfile.css";

function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodGroup: "",
    bio: "",
    
    // Work Info (Read-only, populated from profile)
    employeeId: "",
    designation: "",
    department: "",
    joiningDate: "",
    experience: "",
    reportingTo: "",
    skills: [],
    
    // Address
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    
    // Bank Details
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    accountHolderName: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getProfile();

      if (response.data && response.data.success) {
        const profileData = response.data.data;
        setProfile(profileData);

        // Format date of birth
        let dob = "";
        if (profileData.dateOfBirth) {
          dob = new Date(profileData.dateOfBirth).toISOString().split("T")[0];
        }

        // Format joining date
        let joinDate = "";
        if (profileData.joiningDate) {
          joinDate = new Date(profileData.joiningDate).toISOString().split("T")[0];
        }

        // Format skills array to comma-separated string
        const skillsString = Array.isArray(profileData.skills) 
          ? profileData.skills.join(", ") 
          : "";

        // Get manager name if exists
        let managerName = "";
        if (profileData.reportingTo) {
          managerName = profileData.reportingTo.name || profileData.reportingTo;
        }

        setFormData({
          // Personal Info
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          dateOfBirth: dob,
          bloodGroup: profileData.bloodGroup || "",
          bio: profileData.bio || "",
          
          // Work Info (Read-only)
          employeeId: profileData.employeeId || "",
          designation: profileData.designation || "",
          department: profileData.department || "",
          joiningDate: joinDate,
          experience: profileData.experience || 0,
          reportingTo: managerName,
          skills: skillsString,
          
          // Address
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          country: profileData.address?.country || "",
          zipCode: profileData.address?.zipCode || "",
          
          // Emergency Contact
          emergencyName: profileData.emergencyContact?.name || "",
          emergencyRelationship: profileData.emergencyContact?.relationship || "",
          emergencyPhone: profileData.emergencyContact?.phone || "",
          
          // Bank Details
          accountNumber: profileData.bankDetails?.accountNumber || "",
          bankName: profileData.bankDetails?.bankName || "",
          ifscCode: profileData.bankDetails?.ifscCode || "",
          accountHolderName: profileData.bankDetails?.accountHolderName || "",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare update data
      const updateData = {
        // Personal
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        bio: formData.bio,
        
        // Address (send as comma-separated string)
        address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.country}, ${formData.zipCode}`,
        
        // Emergency Contact
        emergencyContact: formData.emergencyName,
        emergencyRelationship: formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone,
        
        // Skills (convert comma-separated string to array)
        skills: formData.skills
          ? formData.skills.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        
        // Bank Details
        bankDetails: {
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
        }
      };

      const response = await employeeAPI.updateProfile(updateData);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await employeeAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
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
      <div className="employee-profile-header">
        <h1>
          <FiUser /> My Profile
        </h1>
        {!editing && (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Avatar Section */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{profile?.name}</h2>
            <p className="profile-role">{profile?.designation || "Employee"}</p>
            <p className="profile-id">ID: {profile?.employeeId || "N/A"}</p>
            <p className="profile-dept">{profile?.department}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* ========== PERSONAL INFORMATION ========== */}
          <div className="section-title">
            <FiUser /> Personal Information
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label><FiUser /> Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                disabled
                className="read-only"
              />
              <small className="field-note">Contact admin to change name</small>
            </div>

            <div className="form-group">
              <label><FiMail /> Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="read-only"
              />
              <small className="field-note">Contact admin to change email</small>
            </div>

            <div className="form-group">
              <label><FiPhone /> Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="form-group">
              <label><FiCalendar /> Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label><FiHeart /> Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="form-group full-width">
            <label><FiFileText /> About Me / Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Tell us about yourself..."
              maxLength="500"
              rows="4"
            />
            <small className="char-count">{formData.bio?.length || 0}/500 characters</small>
          </div>

          {/* ========== WORK INFORMATION ========== */}
          <div className="section-title">
            <FiBriefcase /> Work Information
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label><FiBriefcase /> Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                disabled
                className="read-only"
              />
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Designation</label>
              <input
                type="text"
                value={formData.designation}
                disabled
                className="read-only"
              />
              <small className="field-note">Contact admin to update</small>
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Department</label>
              <input
                type="text"
                value={formData.department}
                disabled
                className="read-only"
              />
              <small className="field-note">Contact admin to update</small>
            </div>

            <div className="form-group">
              <label><FiCalendar /> Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                disabled
                className="read-only"
              />
            </div>

            <div className="form-group">
              <label><FiTrendingUp /> Experience (Years)</label>
              <input
                type="number"
                value={formData.experience}
                disabled
                className="read-only"
              />
            </div>

            <div className="form-group">
              <label><FiUser /> Reporting To</label>
              <input
                type="text"
                value={formData.reportingTo || "N/A"}
                disabled
                className="read-only"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="form-group full-width">
            <label><FiAward /> Skills</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              disabled={!editing}
              placeholder="React, Node.js, MongoDB, etc. (comma separated)"
            />
            <small className="field-note">Separate skills with commas</small>
          </div>

          {/* ========== ADDRESS ========== */}
          <div className="section-title">
            <FiHome /> Address
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label><FiMapPin /> Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                disabled={!editing}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Rawalpindi"
              />
            </div>

            <div className="form-group">
              <label>State/Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Punjab"
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Pakistan"
              />
            </div>

            <div className="form-group">
              <label>ZIP/Postal Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={!editing}
                placeholder="46000"
              />
            </div>
          </div>

          {/* ========== EMERGENCY CONTACT ========== */}
          <div className="section-title">
            <FiAlertCircle /> Emergency Contact
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                disabled={!editing}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Father, Mother, Spouse, etc."
              />
            </div>

            <div className="form-group full-width">
              <label><FiPhone /> Emergency Phone</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          {/* ========== BANK DETAILS ========== */}
          <div className="section-title">
            <FiCreditCard /> Bank Details
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                disabled={!editing}
                placeholder="1234567890"
              />
            </div>

            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                disabled={!editing}
                placeholder="HBL, UBL, etc."
              />
            </div>

            <div className="form-group">
              <label>IFSC/SWIFT Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                disabled={!editing}
                placeholder="HBL0001234"
              />
            </div>

            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                disabled={!editing}
                placeholder="As per bank records"
              />
            </div>
          </div>

          {/* ========== PERFORMANCE STATS (READ-ONLY) ========== */}
          {profile?.performance && (
            <>
              <div className="section-title">
                <FiAward /> Performance Statistics
              </div>
              <div className="performance-grid">
                <div className="employee-stat-card">
                  <div className="employee-stat-icon">⭐</div>
                  <div className="employee-stat-value">{profile.performance.rating.toFixed(1)}/5.0</div>
                  <div className="employee-stat-label">Performance Rating</div>
                </div>
                <div className="employee-stat-card">
                  <div className="employee-stat-icon">✅</div>
                  <div className="employee-stat-value">{profile.performance.totalTasksCompleted || 0}</div>
                  <div className="employee-stat-label">Tasks Completed</div>
                </div>
                <div className="employee-stat-card">
                  <div className="employee-stat-icon">⏱️</div>
                  <div className="employee-stat-value">{profile.performance.onTimeCompletion || 0}%</div>
                  <div className="employee-stat-label">On-Time Completion</div>
                </div>
                <div className="employee-stat-card">
                  <div className="employee-stat-icon">📊</div>
                  <div className="employee-stat-value">{profile.performance.averageTaskTime || 0}h</div>
                  <div className="employee-stat-label">Avg Task Time</div>
                </div>
              </div>
            </>
          )}

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
          <h3>
            <FiLock /> Change Password
          </h3>
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
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
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