import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { MdAssignment, MdMeetingRoom } from 'react-icons/md';
import './EmployeeDashboard.css';

function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    myTasks: 0,
    completedTasks: 0,
    todayHours: '0h',
    thisWeekHours: '0h',
    upcomingMeetings: 0,
    pendingReviews: 0,
    todayAttendance: null,
    todayTasks: [],
    upcomingMeetingsList: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashResponse = await employeeAPI.getDashboard();
      
      // Fetch today's tasks
      const tasksResponse = await employeeAPI.getMyTasks();
      
      // Fetch attendance status
      const attendanceResponse = await employeeAPI.getAttendanceStatus();
      
      // Fetch upcoming meetings
      const meetingsResponse = await employeeAPI.getMyMeetings();

      setDashboardData({
        ...dashResponse.data,
        todayTasks: tasksResponse.data || [],
        todayAttendance: attendanceResponse.data || null,
        upcomingMeetingsList: meetingsResponse.data || [],
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time;
  };

  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>{getGreeting()}, {user?.name}!</h1>
          <p>Here's what's happening with your work today</p>
        </div>
        <div className="current-date">
          <p>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <MdAssignment style={{ color: '#249E94' }} />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.myTasks || 0}</h3>
            <p>My Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <FiCheckCircle style={{ color: '#249E94' }} />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.completedTasks || 0}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <FiClock style={{ color: '#249E94' }} />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.todayHours || '0h'}</h3>
            <p>Today's Hours</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
            <FiTrendingUp style={{ color: '#249E94' }} />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.thisWeekHours || '0h'}</h3>
            <p>This Week</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Attendance Widget */}
        <div className="dashboard-section attendance-widget">
          <h2>
            <FiClock /> Today's Attendance
          </h2>
          {dashboardData.todayAttendance && dashboardData.todayAttendance.checkIn ? (
            <div className="attendance-info">
              <div className="attendance-status">
                <span className="status-badge present">
                  Present
                </span>
              </div>
              <div className="time-info">
                <p>
                  <strong>Check In:</strong> {dashboardData.todayAttendance.checkIn}
                </p>
                {dashboardData.todayAttendance.checkOut && (
                  <p>
                    <strong>Check Out:</strong> {dashboardData.todayAttendance.checkOut}
                  </p>
                )}
                {!dashboardData.todayAttendance.checkOut && (
                  <p className="working-time">
                    <strong>Status:</strong> Currently Working
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="no-attendance">
              <p>No attendance record for today</p>
              <button className="btn-primary" onClick={() => window.location.href = '/employee/attendance'}>
                Mark Attendance
              </button>
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="dashboard-section today-tasks">
          <h2>
            <MdAssignment /> Today's Tasks
          </h2>
          {dashboardData.todayTasks && dashboardData.todayTasks.length > 0 ? (
            <div className="tasks-list">
              {dashboardData.todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.description || 'No description'}</p>
                    <span className={`priority-badge ${task.priority?.toLowerCase() || 'medium'}`}>
                      {task.priority || 'Medium'}
                    </span>
                  </div>
                  <span className={`status-badge ${task.status?.toLowerCase().replace(' ', '-') || 'pending'}`}>
                    {task.status || 'Pending'}
                  </span>
                </div>
              ))}
              {dashboardData.todayTasks.length > 5 && (
                <button 
                  className="view-all-btn"
                  onClick={() => window.location.href = '/employee/tasks'}
                >
                  View All Tasks ({dashboardData.todayTasks.length})
                </button>
              )}
            </div>
          ) : (
            <div className="no-data">
              <p>No tasks scheduled for today</p>
              <button className="btn-primary" onClick={() => window.location.href = '/employee/tasks'}>
                Check Tasks
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="dashboard-section upcoming-meetings">
          <h2>
            <MdMeetingRoom /> Upcoming Meetings
          </h2>
          {dashboardData.upcomingMeetingsList && dashboardData.upcomingMeetingsList.length > 0 ? (
            <div className="meetings-list">
              {dashboardData.upcomingMeetingsList.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-time">
                    <span className="time">{meeting.time}</span>
                    <span className="date">{meeting.date}</span>
                  </div>
                  <div className="meeting-info">
                    <h4>{meeting.title}</h4>
                    <p>{meeting.location || 'No location specified'}</p>
                    <span className="meeting-type">{meeting.status || 'Scheduled'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No upcoming meetings</p>
              <button className="btn-primary" onClick={() => window.location.href = '/employee/meetings'}>
                Check Meetings
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section recent-activity">
          <h2>Recent Activity</h2>
          {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
            <div className="activity-timeline">
              {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.description}</p>
                    <span className="activity-time">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No recent activity</p>
              <button className="btn-primary" onClick={() => window.location.href = '/employee/activities'}>
                Check Activities
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => window.location.href = '/employee/attendance'}
          >
            <FiClock />
            <span>Mark Attendance</span>
          </button>
          <button 
            className="action-card"
            onClick={() => window.location.href = '/employee/tasks'}
          >
            <MdAssignment />
            <span>View Tasks</span>
          </button>
          <button 
            className="action-card"
            onClick={() => window.location.href = '/employee/daily-report'}
          >
            <FiCheckCircle />
            <span>Submit Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;