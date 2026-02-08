import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiDollarSign, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AddEmployee.css';

function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
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

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
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
      await adminAPI.addEmployee(formData);
      toast.success('Employee added successfully!');
      navigate('/admin/employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/employees');
  };

  return (
    <div className="add-employee">
      <div className="addEmployee-page-header">
        <div>
          <button className="back-btn" onClick={handleCancel}>
            <FiArrowLeft /> Back
          </button>
          <h1>Add New Employee</h1>
          <p>Create a new employee account</p>
        </div>
      </div>

      <div className="adminEmployee-form-container">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="adminEmployee-section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="adminEmployee-form-group">
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

              <div className="adminEmployee-form-group">
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

              <div className="adminEmployee-form-group">
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

              <div className="adminEmployee-form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password (min 6 characters)"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="form-section">
            <h3 className="adminEmployee-section-title">Job Information</h3>
            <div className="form-grid">
              <div className="adminEmployee-form-group">
                <label>
                  <FiBriefcase /> Position *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Software Developer"
                  className={errors.position ? 'error' : ''}
                />
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>

              <div className="adminEmployee-form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Hr">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="adminEmployee-form-group">
                <label>
                  <FiDollarSign /> Salary
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter salary amount"
                />
              </div>

              <div className="adminEmployee-form-group">
                <label>Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3 className="adminEmployee-section-title">Additional Information</h3>
            <div className="form-grid">
              <div className="adminEmployee-form-group full-width">
                <label>
                  <FiMapPin /> Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="3"
                ></textarea>
              </div>

              <div className="adminEmployee-form-group">
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

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="AddEmployee-btn AddEmployee-btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="AddEmployee-btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Employee...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;