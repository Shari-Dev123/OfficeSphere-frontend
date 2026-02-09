import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../utils/api";
import StatCard from "./StatCard";
import { FiUsers, FiUserCheck, FiBriefcase, FiClock, FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

function AdminDashboard() {
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Use ref for polling interval
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    fetchRecentProjects();
    fetchTodayAttendance();

    // ✅ NEW: Set up auto-refresh polling every 30 seconds
    console.log('🔄 Setting up auto-refresh polling (30s interval)');
    pollingIntervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      refreshDashboardData();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();

      console.log("🔍 Dashboard API Response:", response.data);

      let dashboardData = {};

      if (response.data && response.data.data) {
        dashboardData = response.data.data;
      } else if (response.data) {
        dashboardData = response.data;
      }

      console.log("📊 Dashboard Data:", dashboardData);

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

  // ✅ NEW: Refresh function for auto-polling (doesn't show loading spinner)
  const refreshDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch attendance (most important for live updates)
      await fetchTodayAttendance();

      // Fetch stats
      const response = await adminAPI.getDashboardStats();
      let dashboardData = {};

      if (response.data && response.data.data) {
        dashboardData = response.data.data;
      } else if (response.data) {
        dashboardData = response.data;
      }

      setStats({
        totalEmployees: dashboardData.totalEmployees || 0,
        presentToday: dashboardData.presentToday || 0,
        activeProjects: dashboardData.activeProjects || 0,
        pendingTasks: dashboardData.pendingTasks || 0,
      });

      setLastRefreshTime(new Date());
      console.log('✅ Dashboard refreshed successfully');

    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      // Don't show toast on auto-refresh errors to avoid annoying users
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ IMPROVED: Separate function to fetch today's attendance
  const fetchTodayAttendance = async () => {
    try {
      console.log('====================================');
      console.log('🔍 Fetching today\'s attendance for dashboard...');
      console.log('====================================');

      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Fetching attendance for date:', today);

      const response = await adminAPI.getDailyAttendance({ date: today });

      console.log('📊 ATTENDANCE API RESPONSE:');
      console.log('Full response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.attendance:', response.data.attendance);
      console.log('response.data.stats:', response.data.stats);

      if (response.data && response.data.attendance) {
        const attendanceList = response.data.attendance;
        console.log('✅ Attendance data received:', attendanceList.length, 'records');

        if (attendanceList.length > 0) {
          console.log('✅ First record:', attendanceList[0]);
        }

        // Take only first 5 for dashboard display
        const dashboardAttendance = attendanceList.slice(0, 5);
        console.log('✅ Setting dashboard attendance (first 5):', dashboardAttendance.length, 'records');

        setAttendanceData(dashboardAttendance);
        console.log('✅ Attendance data set successfully');
      } else {
        console.log('⚠️ No attendance data in response');
        setAttendanceData([]);
      }
      console.log('====================================');
    } catch (error) {
      console.error('====================================');
      console.error('❌ Error fetching attendance for dashboard');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('====================================');
      setAttendanceData([]);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      console.log('🔍 Starting fetchRecentProjects...');

      const response = await adminAPI.getProjects();

      console.log('====================================');
      console.log('📊 PROJECTS FETCH DEBUG');
      console.log('====================================');
      console.log('Full response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.projects:', response.data.projects);
      console.log('====================================');

      const projects = response.data.projects || response.data.data || [];

      console.log('✅ Projects array:', projects);
      console.log('✅ Projects length:', projects.length);

      const recent = projects.slice(0, 5);
      console.log('✅ Setting recentProjects to:', recent);

      setRecentProjects(recent);

      console.log('✅ setRecentProjects called');

    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  // ✅ NEW: Manual refresh handler
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setLoading(true);
    Promise.all([
      fetchDashboardData(),
      fetchRecentProjects(),
      fetchTodayAttendance()
    ]).finally(() => {
      setLoading(false);
      toast.success('Dashboard refreshed!');
    });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Planning': 'planning',
      'In Progress': 'in-progress',
      'Completed': 'completed',
      'On Hold': 'on-hold',
    };
    return statusMap[status] || 'planning';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    if (!time) return 'Not checked in';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ NEW: Format last refresh time
  const formatLastRefresh = () => {
    const now = new Date();
    const diff = Math.floor((now - lastRefreshTime) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 120) return '1 minute ago';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastRefreshTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('🎨 RENDERING AdminDashboard');
  console.log('🎨 recentProjects.length:', recentProjects.length);
  console.log('🎨 attendanceData.length:', attendanceData.length);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
          {/* ✅ NEW: Last refresh indicator */}
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            {refreshing ? (
              <>
                <FiRefreshCw style={{
                  animation: 'spin 1s linear infinite',
                  marginRight: '4px',
                  display: 'inline-block'
                }} />
                Refreshing...
              </>
            ) : (
              <>Last updated: {formatLastRefresh()}</>
            )}
          </p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
          >
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

        {/* ✅ IMPROVED: Real-time Attendance with Live Badge */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Today's Attendance</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-success" style={{
                animation: 'pulse 2s ease-in-out infinite',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'inline-block'
                }}></span>
                Live
              </span>
              <button
                className="view-all-btn"
                onClick={() => navigate('/admin/attendance')}
              >
                View All <FiArrowRight />
              </button>
            </div>
          </div>
          <div className="card-body">
            {attendanceData.length > 0 ? (
              <div className="attendance-list">
                {attendanceData.map((record, index) => (
                  <div key={index} className="attendance-item">
                    <div className="employee-info">
                      <div className="employee-avatar">
                        {record.employeeName?.charAt(0) || "E"}
                      </div>
                      <div>
                        <p className="employee-name">{record.employeeName || 'Unknown'}</p>
                        <p className="check-time">
                          {formatTime(record.checkIn)}
                          {record.checkOut && (
                            <> → {formatTime(record.checkOut)}</>
                          )}
                        </p>
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
                ))}
              </div>
            ) : (
              <div className="empty-state">
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
                  <div key={index} className="admin-activity-item">
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
              <button
                className="quick-action-btn"
                onClick={() => navigate('/admin/tasks')}
              >
                <FiClock />
                <span>Assign Task</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate('/admin/meetings/schedule')}
              >
                <FiUserCheck />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;