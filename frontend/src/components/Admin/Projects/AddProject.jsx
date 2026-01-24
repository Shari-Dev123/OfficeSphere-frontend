import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiBriefcase, FiDollarSign, FiCalendar, FiAlignLeft, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AddProject.css';

function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: '',
    status: 'active',
    priority: 'medium',
    teamSize: '',
    category: ''
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
      newErrors.name = 'Project name is required';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Client is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    if (formData.deadline && formData.startDate) {
      if (new Date(formData.deadline) < new Date(formData.startDate)) {
        newErrors.deadline = 'Deadline must be after start date';
      }
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
      await adminAPI.addProject(formData);
      toast.success('Project created successfully!');
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/admin/projects');
    }
  };

  return (
    <div className="add-project">
      <div className="page-header">
        <div>
          <h1>Create New Project</h1>
          <p>Set up a new project for your client</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Project Details */}
          <div className="form-section">
            <h3 className="section-title">Project Details</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  <FiBriefcase /> Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group full-width">
                <label>
                  <FiAlignLeft /> Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label>
                  <FiUsers /> Client *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  className={errors.client ? 'error' : ''}
                />
                {errors.client && <span className="error-message">{errors.client}</span>}
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline & Budget */}
          <div className="form-section">
            <h3 className="section-title">Timeline & Budget</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FiCalendar /> Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  <FiCalendar /> Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={errors.deadline ? 'error' : ''}
                />
                {errors.deadline && <span className="error-message">{errors.deadline}</span>}
              </div>

              <div className="form-group">
                <label>
                  <FiDollarSign /> Budget
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiUsers /> Team Size
                </label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  placeholder="Number of team members"
                />
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="form-section">
            <h3 className="section-title">Status & Priority</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;