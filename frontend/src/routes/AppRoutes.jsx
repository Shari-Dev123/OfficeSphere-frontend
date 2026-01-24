import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../hooks/useAuth';

// Auth Components
import Login from '../Components/Auth/Login';
import Register from '../Components/Auth/Register';

// Admin Components
import AdminLayout from '../Components/Shared/Layout/AdminLayout';
import AdminDashboard from '../Components/Admin/Dashboard/AdminDashboard';
import EmployeeList from '../Components/Admin/Employees/EmployeeList';
import AddEmployee from '../Components/Admin/Employees/AddEmployee';
import ClientList from '../Components/Admin/Clients/ClientList';
import AddClient from '../Components/Admin/Clients/AddClient';
import ProjectList from '../Components/Admin/Projects/ProjectList';
import AddProject from '../Components/Admin/Projects/AddProject';
import AttendanceMonitor from '../Components/Admin/Attendance/AttendanceMonitor';
import TaskList from '../Components/Admin/Tasks/TaskList';
import MeetingList from '../Components/Admin/Meetings/MeetingList';
import ReportGenerator from '../Components/Admin/Reports/ReportGenerator';

// Employee Components
import EmployeeLayout from '../Components/Shared/Layout/EmployeeLayout';
import EmployeeDashboard from '../Components/Employee/Dashboard/EmployeeDashboard';
import MyTasks from '../Components/Employee/Tasks/MyTasks';
import AutoAttendance from '../Components/Employee/Attendance/AutoAttendance';
import MyProjects from '../Components/Employee/Projects/MyProjects';
import DailyReportForm from '../Components/Employee/DailyReport/DailyReportForm';
import EmployeeProfile from '../Components/Employee/Profile/EmployeeProfile';

// Client Components
import ClientLayout from '../Components/Shared/Layout/ClientLayout';
import ClientDashboard from '../Components/Client/Dashboard/ClientDashboard';
import ClientProjects from '../Components/Client/Projects/ClientProjects';
import ClientMeetings from '../Components/Client/Meetings/ClientMeetings';
import ClientReports from '../Components/Client/Reports/ClientReports';
import FeedbackForm from '../Components/Client/Feedback/FeedbackForm';

// Loader
import Loader from '../Components/Shared/Loader/Loader';

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={`/${user?.role}/dashboard`} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to={`/${user?.role}/dashboard`} replace />
          ) : (
            <Register />
          )
        } 
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/add" element={<AddEmployee />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="clients/add" element={<AddClient />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/add" element={<AddProject />} />
        <Route path="attendance" element={<AttendanceMonitor />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="meetings" element={<MeetingList />} />
        <Route path="reports" element={<ReportGenerator />} />
      </Route>

      {/* Employee Routes */}
      <Route
        path="/employee/*"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <EmployeeLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="attendance" element={<AutoAttendance />} />
        <Route path="projects" element={<MyProjects />} />
        <Route path="daily-report" element={<DailyReportForm />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <PrivateRoute allowedRoles={['client']}>
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="meetings" element={<ClientMeetings />} />
        <Route path="reports" element={<ClientReports />} />
        <Route path="feedback" element={<FeedbackForm />} />
      </Route>

      {/* Default Redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={`/${user?.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Unauthorized Route */}
      <Route 
        path="/unauthorized" 
        element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            textAlign: 'center'
          }}>
            <h1>Unauthorized Access</h1>
            <p>You don't have permission to access this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        } 
      />

      {/* 404 Not Found */}
      <Route 
        path="*" 
        element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            textAlign: 'center'
          }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;