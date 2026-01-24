import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../../utils/api';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiUsers
} from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';
import Card from '../../Shared/Card/Card';
import Loader from '../../Shared/Loader/Loader';
import { toast } from 'react-toastify';
import './ProjectProgress.css';

function ProjectProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, progressRes, milestonesRes, timelineRes] = await Promise.all([
        clientAPI.getProject(id),
        clientAPI.getProjectProgress(id),
        clientAPI.getProjectMilestones(id),
        clientAPI.getProjectTimeline(id)
      ]);

      setProject(projectRes.data.project);
      setProgress(progressRes.data.progress);
      setMilestones(milestonesRes.data.milestones || []);
      setTimeline(timelineRes.data.timeline || []);
      setTeamMembers(projectRes.data.project.teamMembers || []);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    try {
      await clientAPI.approveMilestone(id, milestoneId, {
        approved: true,
        comment: 'Milestone approved'
      });
      toast.success('Milestone approved successfully!');
      fetchProjectDetails();
    } catch (error) {
      console.error('Error approving milestone:', error);
      toast.error('Failed to approve milestone');
    }
  };

  const handleRequestChanges = async (milestoneId) => {
    const comment = prompt('Please describe the changes needed:');
    if (!comment) return;

    try {
      await clientAPI.requestChanges(id, milestoneId, {
        comment
      });
      toast.success('Change request submitted');
      fetchProjectDetails();
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to submit change request');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': '#10b981',
      'In Progress': '#3b82f6',
      'Pending': '#f59e0b',
      'On Hold': '#ef4444',
      'Approved': '#10b981',
      'Needs Changes': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return '#10b981';
    if (percent >= 50) return '#3b82f6';
    if (percent >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const calculateDaysLeft = (deadline) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <Loader />;
  }

  if (!project) {
    return (
      <div className="project-progress">
        <div className="error-container">
          <FiAlertCircle className="error-icon" />
          <h3>Project Not Found</h3>
          <button onClick={() => navigate('/client/projects')} className="back-btn">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const daysLeft = calculateDaysLeft(project.deadline);

  return (
    <div className="project-progress">
      {/* Header */}
      <div className="progress-header">
        <button className="back-button" onClick={() => navigate('/client/projects')}>
          <FiArrowLeft />
          Back to Projects
        </button>
        <div className="header-content">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="header-status">
          <span 
            className="status-badge"
            style={{ 
              backgroundColor: `${getStatusColor(project.status)}20`,
              color: getStatusColor(project.status)
            }}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Project Stats */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-details">
            <span className="stat-label">Overall Progress</span>
            <span className="stat-value">{progress?.overall || 0}%</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
            <BiTask />
          </div>
          <div className="stat-details">
            <span className="stat-label">Completed Tasks</span>
            <span className="stat-value">{progress?.tasksCompleted || 0}/{progress?.totalTasks || 0}</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-details">
            <span className="stat-label">Milestones</span>
            <span className="stat-value">{progress?.milestonesCompleted || 0}/{progress?.totalMilestones || 0}</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: daysLeft <= 7 ? '#fee2e2' : '#ede9fe', color: daysLeft <= 7 ? '#991b1b' : '#5b21b6' }}>
            <FiClock />
          </div>
          <div className="stat-details">
            <span className="stat-label">Days Remaining</span>
            <span className={`stat-value ${daysLeft <= 7 ? 'urgent' : ''}`}>
              {daysLeft > 0 ? daysLeft : 'Overdue'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Progress Bar */}
      <Card className="main-progress-card">
        <h3>Overall Project Progress</h3>
        <div className="main-progress">
          <div className="progress-info">
            <span>Completion</span>
            <span className="progress-percentage">{progress?.overall || 0}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${progress?.overall || 0}%`,
                backgroundColor: getProgressColor(progress?.overall || 0)
              }}
            ></div>
          </div>
          <div className="progress-dates">
            <div className="date-item">
              <FiCalendar />
              <span>Start: {formatDate(project.startDate)}</span>
            </div>
            <div className="date-item">
              <FiCalendar />
              <span>End: {formatDate(project.deadline)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones Section */}
      <Card className="milestones-card">
        <h3>
          <FiCheckCircle /> Project Milestones
        </h3>
        <div className="milestones-list">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <div key={milestone._id} className={`milestone-item ${milestone.status.toLowerCase().replace(' ', '-')}`}>
                <div className="milestone-number">{index + 1}</div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <h4>{milestone.name}</h4>
                    <span 
                      className="milestone-status"
                      style={{ 
                        backgroundColor: `${getStatusColor(milestone.status)}20`,
                        color: getStatusColor(milestone.status)
                      }}
                    >
                      {milestone.status}
                    </span>
                  </div>
                  <p>{milestone.description}</p>
                  
                  <div className="milestone-meta">
                    <span className="milestone-date">
                      <FiCalendar />
                      Due: {formatDate(milestone.deadline)}
                    </span>
                    <div className="milestone-progress">
                      <span>{milestone.progress}%</span>
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-fill"
                          style={{ 
                            width: `${milestone.progress}%`,
                            backgroundColor: getProgressColor(milestone.progress)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {milestone.status === 'Pending Approval' && (
                    <div className="milestone-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproveMilestone(milestone._id)}
                      >
                        <FiCheckCircle />
                        Approve
                      </button>
                      <button 
                        className="changes-btn"
                        onClick={() => handleRequestChanges(milestone._id)}
                      >
                        <FiAlertCircle />
                        Request Changes
                      </button>
                    </div>
                  )}

                  {milestone.status === 'Approved' && (
                    <div className="approval-badge">
                      <FiCheckCircle />
                      Approved on {formatDate(milestone.approvedDate)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-milestones">
              <p>No milestones defined yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Timeline & Team Grid */}
      <div className="timeline-team-grid">
        {/* Timeline */}
        <Card className="timeline-card">
          <h3>
            <FiClock /> Activity Timeline
          </h3>
          <div className="timeline-list">
            {timeline.length > 0 ? (
              timeline.map((activity, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className="timeline-date">{formatDate(activity.date)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-timeline">
                <p>No activity yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Team Members */}
        <Card className="team-card">
          <h3>
            <FiUsers /> Team Members
          </h3>
          <div className="team-list">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member._id} className="team-member">
                  <div className="member-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <span>{member.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-team">
                <p>No team members assigned</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProjectProgress;