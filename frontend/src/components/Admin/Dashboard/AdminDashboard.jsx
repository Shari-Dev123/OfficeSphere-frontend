import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../utils/api";
import StatCard from "./StatCard";
import { FiUsers, FiUserCheck, FiBriefcase, FiClock, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSocket } from '../../../context/SocketContext';
import "./AdminDashboard.css";

function AdminDashboard() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [notifications, setNotifications] = useState([]); // ✅ NEW

  useEffect(() => {
    fetchDashboardData();
    fetchRecentProjects();
    fetchTodayAttendance();
  }, []);

  // ✅ NEW: Real-time Socket Listeners
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Socket connected, setting up listeners...');

    // Admin room join karo
    socket.emit('join-room', { role: 'admin', userId: localStorage.getItem('userId') });

    // Listen for employee attendance
    socket.on('attendance-marked', (data) => {
      console.log('🔔 Attendance marked:', data);
      addNotification(`${data.employeeName} marked attendance`);
      fetchTodayAttendance(); // Auto refresh
      fetchDashboardData(); // Update stats
    });

    // Listen for task updates
    socket.on('task-updated', (data) => {
      console.log('🔔 Task updated:', data);
      addNotification(`Task updated by employee`);
      fetchDashboardData();
    });

    // Listen for project updates
    socket.on('project-updated', (data) => {
      console.log('🔔 Project updated:', data);
      addNotification(`Project updated: ${data.project?.name}`);
      fetchRecentProjects();
      fetchDashboardData();
    });

    // Listen for client feedback
    socket.on('feedback-submitted', (data) => {
      console.log('🔔 Feedback received:', data);
      addNotification(`New feedback from ${data.clientName}`);
      fetchDashboardData();
    });

    // Listen for meeting updates
    socket.on('meeting-updated', (data) => {
      console.log('🔔 Meeting updated:', data);
      addNotification(`Meeting updated`);
      fetchDashboardData();
    });

    // Cleanup
    return () => {
      socket.off('attendance-marked');
      socket.off('task-updated');
      socket.off('project-updated');
      socket.off('feedback-submitted');
      socket.off('meeting-updated');
    };
  }, [socket]);

  // ✅ NEW: Notification function
  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only 10
    toast.info(message); // Show toast
  };

  // ✅ Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      let dashboardData = response.data.data || response.data;

      setStats({
        totalEmployees: dashboardData.totalEmployees || 0,
        presentToday: dashboardData.presentToday || 0,
        activeProjects: dashboardData.activeProjects || 0,
        pendingTasks: dashboardData.pendingTasks || 0,
      });

      setRecentActivity(dashboardData.recentActivity || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await adminAPI.getDailyAttendance({ date: today });
      
      if (response.data && response.data.attendance) {
        const dashboardAttendance = response.data.attendance.slice(0, 5);
        setAttendanceData(dashboardAttendance);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const response = await adminAPI.getProjects();
      const projects = response.data.projects || response.data.data || [];
      const recent = projects.slice(0, 5);
      setRecentProjects(recent);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // ... rest of your existing functions ...

  return (
    <div className="admin-dashboard">
      {/* Header with Notification Bell */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <div className="dashboard-actions">
          {/* ✅ NEW: Notification Bell */}
          <div className="notification-container">
            <button className="notification-bell">
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {notifications.length > 0 && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <p>{notif.message}</p>
                    <small>{new Date(notif.timestamp).toLocaleTimeString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => {
            fetchDashboardData();
            fetchRecentProjects();
            fetchTodayAttendance();
          }}>
            <FiClock /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<FiUsers />}
          color="primary"
          trend="+5%"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={<FiUserCheck />}
          color="success"
          trend={`${stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}%`}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<FiBriefcase />}
          color="warning"
          onClick={() => navigate('/admin/projects')}
          style={{ cursor: 'pointer' }}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<FiClock />}
          color="danger"
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-content">
        {/* Recent Projects Card */}
        <div className="dashboard-card projects-overview-card">
          <div className="card-header">
            <h3><FiBriefcase /> Recent Projects ({recentProjects.length})</h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/admin/projects')}
            >
              View All <FiArrowRight />
            </button>
          </div>
          <div className="card-body">
            {recentProjects.length > 0 ? (
              <div className="projects-list">
                {recentProjects.map((project) => (
                  <div 
                    key={project._id} 
                    className="project-item"
                    onClick={() => navigate(`/admin/projects/${project._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-info">
                      <h4>{project.name}</h4>
                      <div className="project-meta">
                        <span>Client: {project.client?.companyName || 'N/A'}</span>
                        {project.endDate && (
                          <>
                            <span>•</span>
                            <span>Due: {formatDate(project.endDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`project-status-badge ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiBriefcase style={{ fontSize: '48px', color: '#d1d5db' }} />
                <p>No projects yet</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/projects/add')}
                  style={{ marginTop: '12px' }}
                >
                  Create First Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ FIXED: Real-time Attendance */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Today's Attendance</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success">Live</span>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/admin/attendance')}
              >
                View All <FiArrowRight />
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* 🔍 DEBUG: Show what's happening */}
            {console.log('🎨 Rendering attendance section')}
            {console.log('🎨 attendanceData:', attendanceData)}
            {console.log('🎨 attendanceData.length:', attendanceData.length)}
            
            {attendanceData.length > 0 ? (
              <div className="attendance-list">
                {console.log('🎨 Rendering attendance list with', attendanceData.length, 'records')}
                {attendanceData.map((record, index) => {
                  console.log(`🎨 Rendering attendance record ${index}:`, record);
                  return (
                    <div key={index} className="attendance-item">
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {record.employeeName?.charAt(0) || "E"}
                        </div>
                        <div>
                          <p className="employee-name">{record.employeeName || 'Unknown'}</p>
                          <p className="check-time">{formatTime(record.checkIn)}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${record.status}`}>
                        {record.status === "present"
                          ? "Present"
                          : record.status === "late"
                            ? "Late"
                            : "Absent"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                {console.log('🎨 Rendering empty state for attendance')}
                <FiUserCheck style={{ fontSize: '32px', color: '#d1d5db' }} />
                <p>No attendance records yet</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  Employees haven't checked in today
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-body">
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <FiClock />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.description}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions-grid">
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/admin/employees/add')}
              >
                <FiUsers />
                <span>Add Employee</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/admin/projects/add')}
              >
                <FiBriefcase />
                <span>New Project</span>
              </button>
              <button className="quick-action-btn" onClick={handleAssignTask}>
                <FiClock />
                <span>Assign Task</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={handleScheduleMeeting}
              >
                <FiUserCheck />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;