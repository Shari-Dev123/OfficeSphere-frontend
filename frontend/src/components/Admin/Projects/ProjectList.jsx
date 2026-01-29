import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, 
  FiUsers, FiDollarSign, FiCheck, FiX, FiClock 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ProjectList.css';

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which project is being updated

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
      
      console.log('📊 Admin Projects Response:', response.data);
      console.log('📊 Projects array:', response.data.projects);
      console.log('📊 Number of projects:', response.data.projects?.length);
      
      const projectsArray = response.data.projects || [];
      
      console.log('✅ Setting projects state to:', projectsArray);
      setProjects(projectsArray);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    console.log('🔍 Filtering projects...');
    let filtered = [...projects];

    // Filter by status
    if (filterStatus !== 'all') {
      const statusMap = {
        'planning': 'Planning',
        'active': 'In Progress',
        'completed': 'Completed',
        'on-hold': 'On Hold'
      };
      
      const backendStatus = statusMap[filterStatus];
      filtered = filtered.filter(project => project.status === backendStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProjects(filtered);
  };

  // ✅ NEW: Handle status change
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      setUpdatingStatus(projectId);
      console.log('🔄 Updating project status:', projectId, 'to', newStatus);

      await adminAPI.updateProject(projectId, { status: newStatus });
      
      toast.success(`Project status updated to ${newStatus}`);
      
      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project._id === projectId
            ? { ...project, status: newStatus }
            : project
        )
      );
      
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ✅ NEW: Accept project (move to In Progress)
  const handleAcceptProject = async (projectId, projectName) => {
    if (!window.confirm(`Accept project "${projectName}" and move to In Progress?`)) {
      return;
    }

    try {
      setUpdatingStatus(projectId);
      
      await adminAPI.updateProject(projectId, { 
        status: 'In Progress',
        acceptedAt: new Date(),
        acceptedBy: 'admin' // You can get actual admin name from context
      });
      
      toast.success(`Project "${projectName}" accepted!`);
      
      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project._id === projectId
            ? { ...project, status: 'In Progress' }
            : project
        )
      );
      
    } catch (error) {
      console.error('Error accepting project:', error);
      toast.error('Failed to accept project');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ✅ NEW: Reject project (move to On Hold or delete)
  const handleRejectProject = async (projectId, projectName) => {
    const action = window.confirm(
      `Reject project "${projectName}"?\n\nClick OK to move to "On Hold"\nClick Cancel to delete permanently`
    );

    try {
      setUpdatingStatus(projectId);

      if (action) {
        // Move to On Hold
        await adminAPI.updateProject(projectId, { 
          status: 'On Hold',
          rejectedAt: new Date(),
          rejectedBy: 'admin'
        });
        
        toast.warning(`Project "${projectName}" moved to On Hold`);
        
        setProjects(prevProjects =>
          prevProjects.map(project =>
            project._id === projectId
              ? { ...project, status: 'On Hold' }
              : project
          )
        );
      } else {
        // Delete permanently
        await adminAPI.deleteProject(projectId);
        toast.error(`Project "${projectName}" deleted`);
        
        setProjects(prevProjects =>
          prevProjects.filter(project => project._id !== projectId)
        );
      }
      
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast.error('Failed to reject project');
    } finally {
      setUpdatingStatus(null);
    }
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
    const statusColors = {
      'Planning': 'status-planning',
      'In Progress': 'status-active',
      'Completed': 'status-completed',
      'On Hold': 'status-on-hold',
      'Cancelled': 'status-cancelled'
    };
    return statusColors[status] || 'status-planning';
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
          <p>Manage and track your projects ({projects.length} total)</p>
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
            All ({projects.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'planning' ? 'active' : ''}`}
            onClick={() => setFilterStatus('planning')}
          >
            Planning ({projects.filter(p => p.status === 'Planning').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            In Progress ({projects.filter(p => p.status === 'In Progress').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({projects.filter(p => p.status === 'Completed').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'on-hold' ? 'active' : ''}`}
            onClick={() => setFilterStatus('on-hold')}
          >
            On Hold ({projects.filter(p => p.status === 'On Hold').length})
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
          <span className="stat-label">Planning</span>
          <span className="stat-value stat-info">
            {projects.filter(p => p.status === 'Planning').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">In Progress</span>
          <span className="stat-value stat-success">
            {projects.filter(p => p.status === 'In Progress').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed</span>
          <span className="stat-value stat-info">
            {projects.filter(p => p.status === 'Completed').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">On Hold</span>
          <span className="stat-value stat-warning">
            {projects.filter(p => p.status === 'On Hold').length}
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
                  
                  {/* ✅ NEW: Status Dropdown */}
                  <div className="status-selector">
                    <select
                      className={`status-dropdown ${getStatusColor(project.status)}`}
                      value={project.status}
                      onChange={(e) => handleStatusChange(project._id, e.target.value)}
                      disabled={updatingStatus === project._id}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                    {updatingStatus === project._id && (
                      <FiClock className="updating-icon spin" />
                    )}
                  </div>
                </div>

                <div className="project-actions">
                  {/* ✅ NEW: Accept/Reject Buttons (only for Planning status) */}
                  {project.status === 'Planning' && (
                    <>
                      <button
                        className="action-btn accept-btn"
                        onClick={() => handleAcceptProject(project._id, project.name)}
                        title="Accept Project"
                        disabled={updatingStatus === project._id}
                      >
                        <FiCheck />
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleRejectProject(project._id, project.name)}
                        title="Reject Project"
                        disabled={updatingStatus === project._id}
                      >
                        <FiX />
                      </button>
                    </>
                  )}

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
                      <span className="info-value">
                        {project.client.companyName || project.client.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {project.endDate && (
                  <div className="info-item">
                    <FiCalendar />
                    <div>
                      <span className="info-label">Deadline</span>
                      <span className="info-value">
                        {new Date(project.endDate).toLocaleDateString()}
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

                {project.team && project.team.length > 0 && (
                  <div className="info-item">
                    <FiUsers />
                    <div>
                      <span className="info-label">Team</span>
                      <span className="info-value">{project.team.length} members</span>
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
              ? `No projects match your filters (Total projects: ${projects.length})`
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