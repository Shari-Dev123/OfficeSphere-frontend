import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiSearch, FiFilter, FiGrid, FiList, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(filtered);
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

                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewProject(project._id)}
                  >
                    <FiTrendingUp />
                    View Details
                  </button>
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
        </div>
      )}
    </div>
  );
}

export default ClientProjects;