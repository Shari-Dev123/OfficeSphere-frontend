import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiSave, FiX, FiUser, FiCalendar, FiClock, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './EditTask.css';

function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get task ID from URL
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    project: '',
    dueDate: '',
    estimatedHours: '',
    tags: []
  });

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTaskAndDropdownData();
  }, [id]);

  const fetchTaskAndDropdownData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch task data and dropdown data in parallel
      const [taskRes, employeesRes, projectsRes] = await Promise.all([
        adminAPI.getTask(id),
        adminAPI.getEmployees(),
        adminAPI.getProjects()
      ]);

      // Extract task data
      const taskData = taskRes.data.data || taskRes.data.task || taskRes.data;
      
      // Populate form with existing task data
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'pending',
        assignedTo: taskData.assignedTo?._id || taskData.assignedTo || '',
        project: taskData.project?._id || taskData.project || '',
        dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
        estimatedHours: taskData.estimatedHours || '',
        tags: taskData.tags || []
      });

      // Extract employees and projects
      const employeesData = employeesRes.data.data || employeesRes.data.employees || employeesRes.data || [];
      const projectsData = projectsRes.data.data || projectsRes.data.projects || projectsRes.data || [];

      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching task data:', error);
      toast.error('Failed to load task data');
      navigate('/admin/tasks');
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

      await adminAPI.updateTask(id, taskData);
      
      toast.success('Task updated successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${formData.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteTask(id);
      toast.success('Task deleted successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/admin/tasks');
    }
  };

  if (loadingData) {
    return (
      <div className="edit-task">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading task data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-task">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Edit Task</h1>
          <p>Update task details and assignment</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            <FiTrash2 /> Delete Task
          </button>
          <button className="btn btn-secondary" onClick={handleCancel}>
            <FiX /> Cancel
          </button>
        </div>
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
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Updating...
              </>
            ) : (
              <>
                <FiSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTask;