import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiUsers, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ProjectList.css';

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, filterStatus, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteProject(id);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleEdit = (id) => {
    toast.info('Edit functionality coming soon');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'on-hold':
        return 'status-on-hold';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-active';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    if (progress >= 25) return 'progress-low';
    return 'progress-very-low';
  };

  if (loading) {
    return (
      <div className="project-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-list">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track your projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/projects/add')}>
          <FiPlus /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filterStatus === 'on-hold' ? 'active' : ''}`}
            onClick={() => setFilterStatus('on-hold')}
          >
            On Hold
          </button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="project-stats">
        <div className="stat-item">
          <span className="stat-label">Total Projects</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active</span>
          <span className="stat-value stat-success">
            {projects.filter(p => p.status === 'active').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed</span>
          <span className="stat-value stat-info">
            {projects.filter(p => p.status === 'completed').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">On Hold</span>
          <span className="stat-value stat-warning">
            {projects.filter(p => p.status === 'on-hold').length}
          </span>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <div className="project-header-info">
                  <h3>{project.name}</h3>
                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="project-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(project._id)}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(project._id, project.name)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{project.progress || 0}%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className={`progress-bar ${getProgressColor(project.progress || 0)}`}
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Info */}
              <div className="project-info-grid">
                {project.client && (
                  <div className="info-item">
                    <FiUsers />
                    <div>
                      <span className="info-label">Client</span>
                      <span className="info-value">{project.client}</span>
                    </div>
                  </div>
                )}

                {project.deadline && (
                  <div className="info-item">
                    <FiCalendar />
                    <div>
                      <span className="info-label">Deadline</span>
                      <span className="info-value">
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {project.budget && (
                  <div className="info-item">
                    <FiDollarSign />
                    <div>
                      <span className="info-label">Budget</span>
                      <span className="info-value">${project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {project.teamSize !== undefined && (
                  <div className="info-item">
                    <FiUsers />
                    <div>
                      <span className="info-label">Team</span>
                      <span className="info-value">{project.teamSize} members</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FiPlus />
          </div>
          <h3>No Projects Found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'No projects match your filters'
              : 'Start by creating your first project'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button className="btn btn-primary" onClick={() => navigate('/admin/projects/add')}>
              <FiPlus /> Create First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectList;