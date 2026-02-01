// CreateTask.jsx - Admin Task Creation Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, uploadAPI } from '../../../utils/api';
import { FiSave, FiX, FiUser, FiCalendar, FiClock, FiAlertCircle, FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './CreateTask.css';

function CreateTask() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    project: '',
    dueDate: '',
    estimatedHours: '',
    tags: [],
    attachments: []
  });

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch employees and projects in parallel
      const [employeesRes, projectsRes] = await Promise.all([
        adminAPI.getEmployees(),
        adminAPI.getProjects()
      ]);

      const employeesData = employeesRes.data.data || employeesRes.data.employees || employeesRes.data || [];
      const projectsData = projectsRes.data.data || projectsRes.data.projects || projectsRes.data || [];

      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load employees and projects');
      setEmployees([]);
      setProjects([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error('Some files exceed 10MB limit');
      return;
    }

    try {
      setUploadingFiles(true);

      // Upload each file
      const uploadPromises = files.map(async (file) => {
        const uploadRes = await uploadAPI.uploadFile(file, 'task-attachment');
        return {
          name: file.name,
          url: uploadRes.data.url || uploadRes.data.file?.url,
          uploadedAt: new Date()
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploadingFiles(false);
      e.target.value = ''; // Reset file input
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
    toast.info('Attachment removed');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign this task to an employee';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours must be positive';
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

      // Prepare data for submission
      const taskData = {
        ...formData,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0
      };

      // Remove project if empty
      if (!taskData.project) {
        delete taskData.project;
      }

      await adminAPI.addTask(taskData);
      
      toast.success('Task created successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/admin/tasks');
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loadingData) {
    return (
      <div className="create-task">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-task">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Create New Task</h1>
          <p>Assign a new task to your team members</p>
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          <FiX /> Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-column">
            {/* Task Title */}
            <div className="form-group">
              <label htmlFor="title" className="required">
                Task Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title..."
                className={errors.title ? 'error' : ''}
                maxLength={100}
              />
              {errors.title && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.title}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="required">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the task in detail..."
                rows={5}
                className={errors.description ? 'error' : ''}
                maxLength={500}
              />
              <small className="char-count">
                {formData.description.length}/500 characters
              </small>
              {errors.description && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.description}
                </span>
              )}
            </div>

            {/* Priority & Status */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* File Attachments */}
            <div className="form-group">
              <label htmlFor="attachments">
                <FiUpload /> Attachments (Optional)
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploadingFiles}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                  style={{ display: 'none' }}
                />
                <label htmlFor="attachments" className="file-upload-label">
                  <FiUpload />
                  <span>{uploadingFiles ? 'Uploading...' : 'Click to upload files'}</span>
                  <small>PDF, DOC, TXT, Images, Excel (Max 10MB each)</small>
                </label>
              </div>

              {/* Attachment List */}
              {formData.attachments.length > 0 && (
                <div className="attachments-list">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <FiFile />
                      <span className="attachment-name">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="remove-attachment-btn"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="form-column">
            {/* Assign To */}
            <div className="form-group">
              <label htmlFor="assignedTo" className="required">
                <FiUser /> Assign To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className={errors.assignedTo ? 'error' : ''}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name || emp.userId?.name || 'Unknown'} - {emp.position || emp.designation || 'No Position'}
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.assignedTo}
                </span>
              )}
            </div>

            {/* Project (Optional) */}
            <div className="form-group">
              <label htmlFor="project">Project (Optional)</label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
              >
                <option value="">No Project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name || proj.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label htmlFor="dueDate" className="required">
                <FiCalendar /> Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={getMinDate()}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.dueDate}
                </span>
              )}
            </div>

            {/* Estimated Hours */}
            <div className="form-group">
              <label htmlFor="estimatedHours">
                <FiClock /> Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                placeholder="e.g., 8"
                min="0"
                step="0.5"
                className={errors.estimatedHours ? 'error' : ''}
              />
              {errors.estimatedHours && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.estimatedHours}
                </span>
              )}
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
            <FiX /> Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || uploadingFiles}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Creating...
              </>
            ) : (
              <>
                <FiSave /> Create Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;