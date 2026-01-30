import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  FiSave, 
  FiHome,
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiGlobe,
  FiClock,
  FiDollarSign,
  FiSettings
} from 'react-icons/fi';
import './AdminSettings.css';

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  
  const [companySettings, setCompanySettings] = useState({
    companyName: 'OfficeSphere Solutions',
    email: 'info@officesphere.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    website: 'www.officesphere.com',
    logo: '',
  });

  const [workSettings, setWorkSettings] = useState({
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '18:00',
    lunchBreak: '60',
    timezone: 'America/Los_Angeles',
    weekendDays: ['Saturday', 'Sunday'],
  });

  const [attendanceSettings, setAttendanceSettings] = useState({
    autoCheckout: true,
    lateThreshold: '15',
    halfDayHours: '4',
    fullDayHours: '8',
    overtimeRate: '1.5',
    allowManualCorrection: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    notifyNewEmployee: true,
    notifyTaskAssignment: true,
    notifyMeetings: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
  try {
    setLoading(true);
    console.log('🔍 Fetching settings...'); // ✅ ADD
    
    const response = await adminAPI.getSettings();
    
    console.log('📥 Response:', response.data); // ✅ ADD
    
    if (response && response.data) {
      const settings = response.data.data || response.data; // ✅ CHANGE: Add .data fallback
      
      console.log('✅ Settings received:', settings); // ✅ ADD
      
      // Update each setting only if it exists in the response
      if (settings.company) {
        setCompanySettings(prev => ({
          ...prev,
          ...settings.company
        }));
      }
      if (settings.work) {
        setWorkSettings(prev => ({
          ...prev,
          ...settings.work
        }));
      }
      if (settings.attendance) {
        setAttendanceSettings(prev => ({
          ...prev,
          ...settings.attendance
        }));
      }
      if (settings.email) {
        setEmailSettings(prev => ({
          ...prev,
          ...settings.email
        }));
      }
      
      toast.success('Settings loaded successfully');
    }
  } catch (error) {
    console.error('❌ Error fetching settings:', error); // ✅ CHANGE
    if (error.response?.status === 404) {
      toast.info('No saved settings found. Using default values.');
    } else {
      toast.error('Failed to load settings. Using default values.');
    }
  } finally {
    setLoading(false);
  }
};
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWorkSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAttendanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAttendanceSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailChange = (e) => {
    const { name, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

 const handleSaveSettings = async () => {
  try {
    setSaving(true);
    
    // Prepare data for saving
    const allSettings = {
      company: companySettings,
      work: workSettings,
      attendance: attendanceSettings,
      email: emailSettings,
      // ❌ REMOVE: updatedBy and updatedAt (backend handles this)
    };

    console.log('===================================='); // ✅ ADD
    console.log('💾 Saving settings:', allSettings); // ✅ CHANGE
    console.log('===================================='); // ✅ ADD

    // Call API to save settings
    const response = await adminAPI.updateSettings(allSettings);
    
    console.log('✅ Save response:', response.data); // ✅ ADD
    console.log('===================================='); // ✅ ADD
    
    if (response && (response.status === 200 || response.status === 201)) {
      toast.success('✅ Settings saved successfully!'); // ✅ CHANGE
      
      // Wait a bit then refresh to verify
      setTimeout(() => { // ✅ ADD
        fetchSettings();
      }, 500);
    } else {
      throw new Error('Failed to save settings');
    }
  } catch (error) {
    console.error('===================================='); // ✅ ADD
    console.error('❌ Error saving settings:', error);
    console.error('Response:', error.response?.data); // ✅ ADD
    console.error('===================================='); // ✅ ADD
    
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || 'Failed to save settings';
      toast.error(`Error: ${errorMessage}`);
    } else if (error.request) {
      // Request made but no response
      toast.error('Server not responding. Please try again.');
    } else {
      // Other errors
      toast.error('Failed to save settings. Please try again.');
    }
  } finally {
    setSaving(false);
  }
};

  const renderCompanySettings = () => (
    <div className="settings-section">
      <h3 className="section-title">
        <FiHome /> Company Information
      </h3>
      
      <div className="settings-grid">
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={companySettings.companyName}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="Enter company name"
          />
        </div>

        <div className="form-group">
          <label>
            <FiMail /> Email
          </label>
          <input
            type="email"
            name="email"
            value={companySettings.email}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="company@email.com"
          />
        </div>

        <div className="form-group">
          <label>
            <FiPhone /> Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={companySettings.phone}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label>
            <FiGlobe /> Website
          </label>
          <input
            type="text"
            name="website"
            value={companySettings.website}
            onChange={handleCompanyChange}
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
            value={companySettings.address}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="Street address"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={companySettings.city}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="City"
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            name="state"
            value={companySettings.state}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="State"
          />
        </div>

        <div className="form-group">
          <label>ZIP Code</label>
          <input
            type="text"
            name="zipCode"
            value={companySettings.zipCode}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="ZIP Code"
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={companySettings.country}
            onChange={handleCompanyChange}
            className="form-input"
            placeholder="Country"
          />
        </div>
      </div>
    </div>
  );

  const renderWorkSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">
        <FiClock /> Working Hours & Schedule
      </h3>
      
      <div className="settings-grid">
        <div className="form-group">
          <label>Work Start Time</label>
          <input
            type="time"
            name="startTime"
            value={workSettings.startTime}
            onChange={handleWorkChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Work End Time</label>
          <input
            type="time"
            name="endTime"
            value={workSettings.endTime}
            onChange={handleWorkChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Lunch Break (minutes)</label>
          <input
            type="number"
            name="lunchBreak"
            value={workSettings.lunchBreak}
            onChange={handleWorkChange}
            className="form-input"
            min="0"
            max="120"
          />
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            name="timezone"
            value={workSettings.timezone}
            onChange={handleWorkChange}
            className="form-input"
          >
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Asia/Karachi">Pakistan (PKT)</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Working Days</label>
          <div className="checkbox-group">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <label key={day} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={workSettings.workingDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setWorkSettings(prev => ({
                        ...prev,
                        workingDays: [...prev.workingDays, day]
                      }));
                    } else {
                      setWorkSettings(prev => ({
                        ...prev,
                        workingDays: prev.workingDays.filter(d => d !== day)
                      }));
                    }
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">
        <FiSettings /> Attendance Settings
      </h3>
      
      <div className="settings-grid">
        <div className="form-group">
          <label>Late Threshold (minutes)</label>
          <input
            type="number"
            name="lateThreshold"
            value={attendanceSettings.lateThreshold}
            onChange={handleAttendanceChange}
            className="form-input"
            min="0"
            max="60"
          />
        </div>

        <div className="form-group">
          <label>Half Day Hours</label>
          <input
            type="number"
            name="halfDayHours"
            value={attendanceSettings.halfDayHours}
            onChange={handleAttendanceChange}
            className="form-input"
            min="1"
            max="12"
          />
        </div>

        <div className="form-group">
          <label>Full Day Hours</label>
          <input
            type="number"
            name="fullDayHours"
            value={attendanceSettings.fullDayHours}
            onChange={handleAttendanceChange}
            className="form-input"
            min="1"
            max="24"
          />
        </div>

        <div className="form-group">
          <label>
            <FiDollarSign /> Overtime Rate (multiplier)
          </label>
          <input
            type="number"
            step="0.1"
            name="overtimeRate"
            value={attendanceSettings.overtimeRate}
            onChange={handleAttendanceChange}
            className="form-input"
            min="1"
            max="3"
          />
        </div>

        <div className="form-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="autoCheckout"
              checked={attendanceSettings.autoCheckout}
              onChange={handleAttendanceChange}
            />
            Enable Auto Checkout at End Time
          </label>
        </div>

        <div className="form-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="allowManualCorrection"
              checked={attendanceSettings.allowManualCorrection}
              onChange={handleAttendanceChange}
            />
            Allow Manual Attendance Correction Requests
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">
        <FiMail /> Email Notification Settings
      </h3>
      
      <div className="settings-list">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="notifyNewEmployee"
            checked={emailSettings.notifyNewEmployee}
            onChange={handleEmailChange}
          />
          Notify when new employee joins
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="notifyTaskAssignment"
            checked={emailSettings.notifyTaskAssignment}
            onChange={handleEmailChange}
          />
          Notify on task assignment
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="notifyMeetings"
            checked={emailSettings.notifyMeetings}
            onChange={handleEmailChange}
          />
          Notify about upcoming meetings
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="dailyReports"
            checked={emailSettings.dailyReports}
            onChange={handleEmailChange}
          />
          Send daily attendance reports
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="weeklyReports"
            checked={emailSettings.weeklyReports}
            onChange={handleEmailChange}
          />
          Send weekly performance reports
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="monthlyReports"
            checked={emailSettings.monthlyReports}
            onChange={handleEmailChange}
          />
          Send monthly summary reports
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1>System Settings</h1>
        <button 
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={saving || loading}
        >
          <FiSave /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="settings-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <FiHome /> Company
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'work' ? 'active' : ''}`}
          onClick={() => setActiveTab('work')}
        >
          <FiClock /> Working Hours
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FiSettings /> Attendance
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          <FiMail /> Notifications
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'company' && renderCompanySettings()}
        {activeTab === 'work' && renderWorkSettings()}
        {activeTab === 'attendance' && renderAttendanceSettings()}
        {activeTab === 'email' && renderEmailSettings()}
      </div>
    </div>
  );
};

export default AdminSettings;