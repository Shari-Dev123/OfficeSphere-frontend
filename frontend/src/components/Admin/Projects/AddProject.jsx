import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiBriefcase, FiDollarSign, FiCalendar, FiAlignLeft, FiUsers, FiFlag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AddProject.css';

function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '', // Will be ObjectId from dropdown
    projectManager: '', // Optional
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', // Changed from 'deadline'
    budget: '', // Required
    status: 'Planning', // Match model enum
    priority: 'Medium', // Match model enum (capitalized)
    tags: []
  });

  const [errors, setErrors] = useState({});

  // ✅ Load clients and employees on mount
  useEffect(() => {
    loadClients();
    loadEmployees();
  }, []);

  const loadClients = async () => {
    try {
      const response = await adminAPI.getClients();
      const clientsData = response.data.data || response.data.clients || response.data || [];
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await adminAPI.getEmployees();
      const employeesData = response.data.data || response.data.employees || response.data || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

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

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.client) {
      newErrors.client = 'Client selection is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
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

      // ✅ Prepare data to match Project model schema
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        client: formData.client, // ObjectId from dropdown
        projectManager: formData.projectManager || undefined, // Optional
        startDate: formData.startDate,
        endDate: formData.endDate, // Match model field name
        budget: parseFloat(formData.budget),
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags
      };

      console.log('📤 Sending project data:', projectData);

      await adminAPI.addProject(projectData);
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
      <div className="AdminAddProject-page-header">
        <div>
          <h1>Create New Project</h1>
          <p>Set up a new project for your client</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Project Details */}
          <div className="form-section">
            <h3 className="AdminAddProject-section-title">
              <FiBriefcase /> Project Details
            </h3>
            <div className="form-grid">
              <div className="AdminAddProject-form-group full-width">
                <label>Project Name *</label>
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

              <div className="AdminAddProject-form-group full-width">
                <label>
                  <FiAlignLeft /> Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows="4"
                  className={errors.description ? 'error' : ''}
                ></textarea>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              {/* ✅ FIXED: Client Dropdown */}
              <div className="AdminAddProject-form-group">
                <label>
                  <FiUsers /> Client *
                </label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className={errors.client ? 'error' : ''}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name || client.companyName || 'Unknown Client'}
                    </option>
                  ))}
                </select>
                {errors.client && <span className="error-message">{errors.client}</span>}
              </div>

              {/* ✅ NEW: Project Manager (Optional) */}
              <div className="AdminAddProject-form-group">
                <label>
                  <FiUsers /> Project Manager (Optional)
                </label>
                <select
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleChange}
                >
                  <option value="">Assign later</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.userId?.name || emp.name || 'Unknown Employee'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timeline & Budget */}
          <div className="form-section">
            <h3 className="AdminAddProject-section-title">
              <FiCalendar /> Timeline & Budget
            </h3>
            <div className="form-grid">
              <div className="AdminAddProject-form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              {/* ✅ FIXED: Changed to endDate */}
              <div className="AdminAddProject-form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>

              {/* ✅ FIXED: Budget now required */}
              <div className="AdminAddProject-form-group full-width">
                <label>
                  <FiDollarSign /> Budget *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget amount (e.g., 50000)"
                  min="0"
                  step="0.01"
                  className={errors.budget ? 'error' : ''}
                />
                {errors.budget && <span className="error-message">{errors.budget}</span>}
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="form-section">
            <h3 className="AdminAddProject-section-title">
              <FiFlag /> Status & Priority
            </h3>
            <div className="form-grid">
              {/* ✅ FIXED: Status values match model enum */}
              <div className="AdminAddProject-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* ✅ FIXED: Priority values match model enum (capitalized) */}
              <div className="AdminAddProject-form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="AdminAddProject-form-actions">
            <button
              type="button"
              className="AdminAddProject-btn AdminAddProject-btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="AdminAddProject-btn AdminAddProject-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiBriefcase /> Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;