import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from './StatCard';
import { FiUsers, FiUserCheck, FiBriefcase, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      
      if (response.data) {
        setStats({
          totalEmployees: response.data.totalEmployees || 0,
          presentToday: response.data.presentToday || 0,
          activeProjects: response.data.activeProjects || 0,
          pendingTasks: response.data.pendingTasks || 0,
        });
        
        setRecentActivity(response.data.recentActivity || []);
        setAttendanceData(response.data.attendanceData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
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
        {/* Real-time Attendance */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Today's Attendance</h3>
            <span className="badge badge-success">Live</span>
          </div>
          <div className="card-body">
            {attendanceData.length > 0 ? (
              <div className="attendance-list">
                {attendanceData.slice(0, 5).map((record, index) => (
                  <div key={index} className="attendance-item">
                    <div className="employee-info">
                      <div className="employee-avatar">
                        {record.employeeName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <p className="employee-name">{record.employeeName}</p>
                        <p className="check-time">{record.checkInTime}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${record.status}`}>
                      {record.status === 'present' ? 'Present' : 
                       record.status === 'late' ? 'Late' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No attendance records yet</p>
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
              <button className="quick-action-btn">
                <FiUsers />
                <span>Add Employee</span>
              </button>
              <button className="quick-action-btn">
                <FiBriefcase />
                <span>New Project</span>
              </button>
              <button className="quick-action-btn">
                <FiClock />
                <span>Assign Task</span>
              </button>
              <button className="quick-action-btn">
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