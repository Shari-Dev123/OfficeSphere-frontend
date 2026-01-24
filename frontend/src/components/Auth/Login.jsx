import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaLock, FaUserTie, FaUserCog, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'employee' // default role
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);

    try {
      // Call login function with email, password, role
      const result = await login(formData.email, formData.password, formData.role);

      if (result.success) {
        // Navigate based on role
        navigate(`/${result.user.role}/dashboard`);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo Section */}
        <div className="login-header">
          <div className="logo-circle">
            <FaUserCog size={40} />
          </div>
          <h1>OfficeSphere</h1>
          <p>Smart Company Management System</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selection">
            <label className="role-label">Select Role</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <FaUserTie />
                <span>Admin</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'employee' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'employee' })}
              >
                <FaUsers />
                <span>Employee</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'client' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'client' })}
              >
                <FaUser />
                <span>Client</span>
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Register Link */}
          <div className="register-link">
            Don't have an account? 
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
              Register here
            </a>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <div className="demo-list">
            <div className="demo-item">
              <strong>Admin:</strong> admin@office.com / admin123
            </div>
            <div className="demo-item">
              <strong>Employee:</strong> employee@office.com / emp123
            </div>
            <div className="demo-item">
              <strong>Client:</strong> client@office.com / client123
            </div>
          </div>
        </div>
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

export default Login;