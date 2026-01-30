import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBuilding,
  FaUserTie,
  FaBriefcase,
  FaSitemap,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "employee",
    company: "",
    department: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "client" && !formData.company.trim()) {
      newErrors.company = "Company name is required for clients";
    }

    if (formData.role === "employee") {
      if (!formData.department.trim()) {
        newErrors.department = "Department is required for employees";
      }
      if (!formData.designation.trim()) {
        newErrors.designation = "Designation is required for employees";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === "employee") {
        userData.department = formData.department;
        userData.designation = formData.designation;
      } else if (formData.role === "client") {
        userData.company = formData.company;
      }

      const result = await register(userData);

      if (result.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <div className="register-logo-circle">
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
                className={`role-btn ${
                  formData.role === "employee" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, role: "employee", company: "" })
                }
              >
                <FaUser />
                <span>Employee</span>
              </button>
              <button
                type="button"
                className={`role-btn ${
                  formData.role === "client" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    role: "client",
                    department: "",
                    designation: "",
                  })
                }
              >
                <FaBuilding />
                <span>Client</span>
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="register-form-group">
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
                className={errors.name ? "error" : ""}
              />
            </div>
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* Email Input */}
          <div className="register-form-group">
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
                className={errors.email ? "error" : ""}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Phone Input */}
          <div className="register-form-group">
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
          {formData.role === "client" && (
            <div className="register-form-group">
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
                  className={errors.company ? "error" : ""}
                />
              </div>
              {errors.company && (
                <span className="error-message">{errors.company}</span>
              )}
            </div>
          )}

          {/* Department Input (for employees) */}
          {formData.role === "employee" && (
            <div className="register-form-group">
              <label htmlFor="department">Department *</label>
              <div className="input-with-icon">
                <FaSitemap className="input-icon" />
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? "error" : ""}
                >
                  <option value="">Select Department</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              {errors.department && (
                <span className="error-message">{errors.department}</span>
              )}
            </div>
          )}

          {/* Designation Input (for employees) */}
          {formData.role === "employee" && (
            <div className="register-form-group">
              <label htmlFor="designation">Designation *</label>
              <div className="input-with-icon">
                <FaBriefcase className="input-icon" />
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  placeholder="e.g., Software Developer, Project Manager"
                  value={formData.designation}
                  onChange={handleChange}
                  className={errors.designation ? "error" : ""}
                />
              </div>
              {errors.designation && (
                <span className="error-message">{errors.designation}</span>
              )}
            </div>
          )}

          {/* Password Input */}
          <div className="register-form-group">
            <label htmlFor="password">Password *</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="register-form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="terms-checkbox">
            <label>
              <input type="checkbox" required />
              <span>I agree to the Terms and Conditions</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <div className="login-link">
            Already have an account?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
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