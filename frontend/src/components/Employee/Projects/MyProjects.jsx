import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { FiFolder, FiUsers, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import './MyProjects.css';

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getMyProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      'not-started': '#9ca3af',
      'in-progress': '#3b82f6',
      'completed': '#10b981',
      'on-hold': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="my-projects">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-projects">
      <div className="projects-header">
        <h1><FiFolder /> My Projects</h1>
        <p>{projects.length} Active Projects</p>
      </div>

      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => {
            const progress = calculateProgress(project);
            const daysRemaining = getDaysRemaining(project.endDate);

            return (
              <div 
                key={project._id} 
                className="project-card"
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-header">
                  <div className="project-title-section">
                    <h3>{project.name}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? '#10b981' : '#667eea'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="project-info">
                  <div className="info-item">
                    <FiCalendar />
                    <div>
                      <span className="info-label">Deadline</span>
                      <span className="info-value">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FiTrendingUp />
                    <div>
                      <span className="info-label">Days Left</span>
                      <span className={`info-value ${daysRemaining < 7 ? 'urgent' : ''}`}>
                        {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FiUsers />
                    <div>
                      <span className="info-label">Team Size</span>
                      <span className="info-value">
                        {project.teamMembers?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                {project.client && (
                  <div className="client-info">
                    <span className="client-label">Client:</span>
                    <span className="client-name">{project.client.name}</span>
                  </div>
                )}

                {/* Team Members Avatars */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                  <div className="team-avatars">
                    {project.teamMembers.slice(0, 5).map((member, index) => (
                      <div 
                        key={member._id} 
                        className="avatar"
                        style={{ zIndex: 5 - index }}
                        title={member.name}
                      >
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.teamMembers.length > 5 && (
                      <div className="avatar-more">
                        +{project.teamMembers.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-projects">
            <FiFolder className="no-projects-icon" />
            <h3>No Projects Yet</h3>
            <p>You haven't been assigned to any projects</p>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedProject(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Description</h4>
                <p>{selectedProject.description}</p>
              </div>

              <div className="detail-section">
                <h4>Timeline</h4>
                <div className="timeline-info">
                  <div>
                    <span>Start Date:</span>
                    <strong>{new Date(selectedProject.startDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span>End Date:</span>
                    <strong>{new Date(selectedProject.endDate).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>

              {selectedProject.teamMembers && (
                <div className="detail-section">
                  <h4>Team Members</h4>
                  <div className="team-list">
                    {selectedProject.teamMembers.map(member => (
                      <div key={member._id} className="team-member-item">
                        <div className="member-avatar">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="member-name">{member.name}</p>
                          <p className="member-email">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div className="detail-section">
                  <h4>Tasks ({selectedProject.tasks.length})</h4>
                  <div className="tasks-summary">
                    <div className="summary-item">
                      <span>Completed:</span>
                      <strong>{selectedProject.tasks.filter(t => t.status === 'completed').length}</strong>
                    </div>
                    <div className="summary-item">
                      <span>In Progress:</span>
                      <strong>{selectedProject.tasks.filter(t => t.status === 'in-progress').length}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Pending:</span>
                      <strong>{selectedProject.tasks.filter(t => t.status === 'pending').length}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProjects;
