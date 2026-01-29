import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../utils/api";
import StatCard from "./StatCard";
import { FiUsers, FiUserCheck, FiBriefcase, FiClock, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

function AdminDashboard() {
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

  useEffect(() => {
    fetchDashboardData();
    fetchRecentProjects();
  }, []);

  // 🔍 DEBUG: Monitor recentProjects state changes
  useEffect(() => {
    console.log('🔍 STATE UPDATE - recentProjects:', recentProjects);
    console.log('🔍 STATE UPDATE - length:', recentProjects.length);
  }, [recentProjects]);

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
      setAttendanceData(dashboardData.attendanceData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
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
      console.log('response.data.data:', response.data.data);
      console.log('====================================');
      
      // Get projects from response
      const projects = response.data.projects || response.data.data || [];
      
      console.log('✅ Projects array:', projects);
      console.log('✅ Projects length:', projects.length);
      console.log('✅ First project:', projects[0]);
      console.log('✅ Is array?', Array.isArray(projects));
      console.log('====================================');
      
      // Set state
      const recent = projects.slice(0, 5);
      console.log('✅ Setting recentProjects to:', recent);
      console.log('✅ Recent length:', recent.length);
      
      setRecentProjects(recent);
      
      console.log('✅ setRecentProjects called');
      
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      console.error('❌ Error details:', error.response?.data);
    }
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

  // 🔍 DEBUG: Log render
  console.log('🎨 RENDERING AdminDashboard');
  console.log('🎨 recentProjects in render:', recentProjects);
  console.log('🎨 recentProjects.length:', recentProjects.length);

  const handleAddEmployee = () => {
    navigate("/admin/employees/add");
  };

  const handleNewProject = () => {
    navigate("/admin/projects/add");
  };

  const handleAssignTask = () => {
    navigate("/admin/tasks");
  };

  const handleScheduleMeeting = () => {
    navigate("/admin/meetings/schedule");
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
          <button className="btn btn-primary" onClick={() => {
            fetchDashboardData();
            fetchRecentProjects();
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
            {/* 🔍 DEBUG: Show what's happening */}
            {console.log('🎨 Rendering projects section, length:', recentProjects.length)}
            
            {recentProjects.length > 0 ? (
              <div className="projects-list">
                {console.log('🎨 Rendering projects list')}
                {recentProjects.map((project, index) => {
                  console.log(`🎨 Rendering project ${index}:`, project);
                  return (
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
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                {console.log('🎨 Rendering empty state')}
                <FiBriefcase style={{ fontSize: '48px', color: '#d1d5db' }} />
                <p>No projects yet</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  Debug: recentProjects.length = {recentProjects.length}
                </p>
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
                        {record.employeeName?.charAt(0) || "E"}
                      </div>
                      <div>
                        <p className="employee-name">{record.employeeName}</p>
                        <p className="check-time">{record.checkInTime}</p>
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