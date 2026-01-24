import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AddClient.css';

function AddClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    industry: '',
    address: '',
    website: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.addClient(formData);
      toast.success('Client added successfully!');
      navigate('/admin/clients');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error(error.response?.data?.message || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/admin/clients');
    }
  };

  return (
    <div className="add-client">
      <div className="page-header">
        <div>
          <h1>Add New Client</h1>
          <p>Create a new client account</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FiUser /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>
                  <FiMail /> Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
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
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="form-section">
            <h3 className="section-title">Company Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FiBriefcase /> Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && <span className="error-message">{errors.company}</span>}
              </div>

              <div className="form-group">
                <label>Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  <FiMapPin /> Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter company address"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClient;