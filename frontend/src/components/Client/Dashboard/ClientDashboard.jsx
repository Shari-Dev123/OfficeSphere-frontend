import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';
import { MdOutlineSchedule } from 'react-icons/md';
import Card from '../../Shared/Card/Card';
import Loader from '../../Shared/Loader/Loader';
import { toast } from 'react-toastify';
import './ClientDashboard.css';

function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getDashboard();

      console.log('📊 Dashboard Response:', response.data);

      // Handle both possible response structures
      const data = response.data.data || response.data;

      setDashboardData(data.stats || response.data.stats);
      setRecentUpdates(data.recentUpdates || []);
      setUpcomingDeadlines(data.upcomingDeadlines || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const stats = [
    {
      title: 'Active Projects',
      value: dashboardData?.activeProjects || 0,
      icon: <BiTask />,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Completed Projects',
      value: dashboardData?.completedProjects || 0,
      icon: <FiCheckCircle />,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Pending Approvals',
      value: dashboardData?.pendingApprovals || 0,
      icon: <FiAlertCircle />,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Upcoming Meetings',
      value: dashboardData?.upcomingMeetings || 0,
      icon: <MdOutlineSchedule />,
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': '#3b82f6',
      'Completed': '#10b981',
      'On Hold': '#f59e0b',
      'Pending': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="client-dashboard">
      {/* Welcome Section */}
      <div className="client-dashboard-header">
        <div className="client-welcome-section">
          <h1>Welcome back! 👋</h1>
          <p>Here's what's happening with your projects today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="client-stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} className="client-stat-card">
            <div className="client-stat-content">
              <div
                className="client-stat-icon"
                style={{ backgroundColor: stat.bgColor, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="client-stat-details">
                <p className="client-stat-title">{stat.title}</p>
                <h2 className="client-stat-value">{stat.value}</h2>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Updates */}
        <Card className="recent-updates-card">
          <div className="card-header">
            <h3>
              <FiTrendingUp /> Recent Updates
            </h3>
          </div>
          <div className="updates-list">
            {recentUpdates.length > 0 ? (
              recentUpdates.map((update, index) => (
                <div key={index} className="update-item">
                  <div className="update-icon">
                    <FiCheckCircle style={{ color: getStatusColor(update.status) }} />
                  </div>
                  <div className="update-content">
                    <h4>{update.projectName}</h4>
                    <p>{update.description}</p>
                    <span className="update-time">{formatDate(update.date)}</span>
                  </div>
                  <div
                    className="update-status"
                    style={{ color: getStatusColor(update.status) }}
                  >
                    {update.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No recent updates</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="deadlines-card">
          <div className="card-header">
            <h3>
              <FiClock /> Upcoming Deadlines
            </h3>
          </div>
          <div className="deadlines-list">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline, index) => {
                const daysLeft = getDaysRemaining(deadline.deadline);
                return (
                  <div key={index} className="deadline-item">
                    <div className="deadline-info">
                      <h4>{deadline.projectName}</h4>
                      <p>{deadline.milestone}</p>
                    </div>
                    <div className="deadline-date">
                      <span className={`days-badge ${daysLeft <= 3 ? 'urgent' : ''}`}>
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                            ? 'Today'
                            : 'Overdue'
                        }
                      </span>
                      <span className="date-text">{formatDate(deadline.deadline)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-data">
                <p>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="client-quick-actions-card">
        <h3>Quick Actions</h3>
        <div className="client-quick-actions-grid">
          <button className="client-action-btn">
            <BiTask />
            <span>View All Projects</span>
          </button>
          <button className="client-action-btn">
            <MdOutlineSchedule />
            <span>Schedule Meeting</span>
          </button>
          <button className="client-action-btn">
            <FiCheckCircle />
            <span>Approve Milestones</span>
          </button>
          <button className="client-action-btn">
            <FiTrendingUp />
            <span>View Reports</span>
          </button>
        </div>
      </Card>
    </div>
  );
}

export default ClientDashboard;