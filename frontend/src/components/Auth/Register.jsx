import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaUserTie } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'employee',
    company: '' // For clients
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'client' && !formData.company.trim()) {
      newErrors.company = 'Company name is required for clients';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        company: formData.company
      });

      if (result.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <div className="logo-circle">
            <FaUserTie size={40} />
          </div>
          <h1>Create Account</h1>
          <p>Join OfficeSphere Management System</p>
        </div>

        {/* Registration Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selection">
            <label className="role-label">I am registering as</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${formData.role === 'employee' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'employee' })}
              >
                <FaUser />
                <span>Employee</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'client' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'client' })}
              >
                <FaBuilding />
                <span>Client</span>
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Phone Input */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-icon">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company Input (for clients) */}
          {formData.role === 'client' && (
            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <div className="input-with-icon">
                <FaBuilding className="input-icon" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Enter your company name"
                  value={formData.company}
                  onChange={handleChange}
                  className={errors.company ? 'error' : ''}
                />
              </div>
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
          )}

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Terms & Conditions */}
          <div className="terms-checkbox">
            <label>
              <input type="checkbox" required />
              <span>I agree to the Terms and Conditions</span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="login-link">
            Already have an account? 
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Login here
            </a>
          </div>
        </form>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
}

export default Register;