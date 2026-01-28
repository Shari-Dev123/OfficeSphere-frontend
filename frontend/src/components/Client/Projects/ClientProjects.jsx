import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiSearch, FiFilter, FiGrid, FiList, FiTrendingUp, FiClock, FiCheckCircle, FiPlus, FiSend, FiX } from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';
import Card from '../../Shared/Card/Card';
import Loader from '../../Shared/Loader/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './ClientProjects.css';

function ClientProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // New project form data
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    deadline: '',
    budget: '',
    requirements: '',
    priority: 'Medium',
    category: ''
  });

  // Send to admin form data
  const [sendData, setSendData] = useState({
    message: '',
    urgency: 'Normal',
    requestType: 'Review' // Review, Approval, Discussion, etc.
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, filterStatus, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getMyProjects();
      setProjects(response.data.projects || []);
      setFilteredProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(filtered);
  };

  // Handle Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      // Validation
      if (!newProject.name || !newProject.description || !newProject.startDate || !newProject.deadline) {
        toast.error('Please fill all required fields');
        return;
      }

      const projectData = {
        ...newProject,
        status: 'Planning', // Default status
        progress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        milestonesCompleted: 0,
        totalMilestones: 0
      };

      console.log('Creating project:', projectData);
      const response = await clientAPI.createProject(projectData);
      
      toast.success('Project created successfully!');
      
      // Refresh projects list
      await fetchProjects();
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        deadline: '',
        budget: '',
        requirements: '',
        priority: 'Medium',
        category: ''
      });

    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Send to Admin
  const handleSendToAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      if (!sendData.message) {
        toast.error('Please enter a message');
        return;
      }

      const requestData = {
        projectId: selectedProject._id,
        projectName: selectedProject.name,
        message: sendData.message,
        urgency: sendData.urgency,
        requestType: sendData.requestType,
        clientInfo: {
          // Add any client info you want to send
        }
      };

      console.log('Sending to admin:', requestData);
      const response = await clientAPI.sendProjectToAdmin(requestData);
      
      toast.success('Project sent to admin successfully!');
      
      // Close modal and reset
      setShowSendModal(false);
      setSelectedProject(null);
      setSendData({
        message: '',
        urgency: 'Normal',
        requestType: 'Review'
      });

    } catch (error) {
      console.error('Error sending to admin:', error);
      toast.error(error.response?.data?.message || 'Failed to send to admin');
    } finally {
      setSubmitting(false);
    }
  };

  const openSendModal = (project) => {
    setSelectedProject(project);
    setShowSendModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': '#3b82f6',
      'Completed': '#10b981',
      'On Hold': '#f59e0b',
      'Planning': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewProject = (projectId) => {
    navigate(`/client/projects/${projectId}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="client-projects">
      {/* Header */}
      <div className="projects-header">
        <div className="header-content">
          <h1>My Projects</h1>
          <p>Track and manage all your active projects</p>
        </div>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus />
          Create New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="projects-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        <div className={`projects-container ${viewMode}`}>
          {filteredProjects.map((project) => {
            const daysLeft = calculateDaysLeft(project.deadline);
            return (
              <Card key={project._id} className="project-card">
                <div className="project-header">
                  <div className="project-title-section">
                    <h3>{project.name}</h3>
                    <span 
                      className="project-status"
                      style={{ 
                        backgroundColor: `${getStatusColor(project.status)}20`,
                        color: getStatusColor(project.status)
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                </div>

                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: getProgressColor(project.progress)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="project-stats">
                  <div className="stat-item">
                    <BiTask className="stat-icon" />
                    <div className="stat-details">
                      <span className="stat-value">{project.tasksCompleted}/{project.totalTasks}</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <FiCheckCircle className="stat-icon" />
                    <div className="stat-details">
                      <span className="stat-value">{project.milestonesCompleted}/{project.totalMilestones}</span>
                      <span className="stat-label">Milestones</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <FiClock className="stat-icon" />
                    <div className="stat-details">
                      <span className={`stat-value ${daysLeft <= 7 ? 'urgent' : ''}`}>
                        {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                      </span>
                      <span className="stat-label">Remaining</span>
                    </div>
                  </div>
                </div>

                <div className="project-footer">
                  <div className="project-dates">
                    <span className="date-label">Start:</span>
                    <span className="date-value">{formatDate(project.startDate)}</span>
                    <span className="date-separator">•</span>
                    <span className="date-label">End:</span>
                    <span className="date-value">{formatDate(project.deadline)}</span>
                  </div>
                  
                  <div className="project-actions">
                    <button 
                      className="send-to-admin-btn"
                      onClick={() => openSendModal(project)}
                      title="Send to Admin"
                    >
                      <FiSend />
                      Send to Admin
                    </button>
                    
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewProject(project._id)}
                    >
                      <FiTrendingUp />
                      View Details
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="no-projects">
          <BiTask className="no-projects-icon" />
          <h3>No Projects Found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'You don\'t have any projects yet'}
          </p>
          <button 
            className="create-first-project-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            Create Your First Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="project-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe your project"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deadline *</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Budget</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    placeholder="Enter budget (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Category</label>
                  <input
                    type="text"
                    value={newProject.category}
                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                    placeholder="e.g., Web Development, Mobile App, etc."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Requirements</label>
                  <textarea
                    value={newProject.requirements}
                    onChange={(e) => setNewProject({...newProject, requirements: e.target.value})}
                    placeholder="List project requirements (optional)"
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send to Admin Modal */}
      {showSendModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send to Admin</h2>
              <button 
                className="close-btn"
                onClick={() => setShowSendModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="selected-project-info">
              <h3>{selectedProject.name}</h3>
              <p>{selectedProject.description}</p>
            </div>

            <form onSubmit={handleSendToAdmin} className="send-form">
              <div className="form-group">
                <label>Request Type</label>
                <select
                  value={sendData.requestType}
                  onChange={(e) => setSendData({...sendData, requestType: e.target.value})}
                >
                  <option value="Review">Review Request</option>
                  <option value="Approval">Approval Request</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Update">Status Update</option>
                  <option value="Issue">Report Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Urgency Level</label>
                <select
                  value={sendData.urgency}
                  onChange={(e) => setSendData({...sendData, urgency: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message to Admin *</label>
                <textarea
                  value={sendData.message}
                  onChange={(e) => setSendData({...sendData, message: e.target.value})}
                  placeholder="Explain what you need from the admin..."
                  rows="6"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowSendModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send to Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProjects;