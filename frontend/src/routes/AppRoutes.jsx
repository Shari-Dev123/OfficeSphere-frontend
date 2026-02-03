import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "../hooks/useAuth";

// Auth Components
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";

// Admin Components
import AdminLayout from "../Components/Shared/Layout/AdminLayout";
import AdminDashboard from "../Components/Admin/Dashboard/AdminDashboard";
import EmployeeList from "../Components/Admin/Employees/EmployeeList";
import AddEmployee from "../Components/Admin/Employees/AddEmployee";
import ClientList from "../Components/Admin/Clients/ClientList";
import AddClient from "../Components/Admin/Clients/AddClient";
import ProjectList from "../Components/Admin/Projects/ProjectList";
import AddProject from "../Components/Admin/Projects/AddProject";
import AttendanceMonitor from "../Components/Admin/Attendance/AttendanceMonitor";
import TaskList from "../Components/Admin/Tasks/TaskList";
import CreateTask from "../Components/Admin/Tasks/CreateTask"; // ✅ NEW
import EditTask from "../Components/Admin/Tasks/EditTask";
import MeetingList from "../Components/Admin/Meetings/MeetingList";
import ReportGenerator from "../Components/Admin/Reports/ReportGenerator";
import AdminSettings from "../Components/Admin/Settings/AdminSettings"; // ← ADDED
import AdminNotifications from '../Components/Admin/AdminNotifications/AdminNotifications.jsx'
import EmployeeNotifications from '../Components/Employee/Employeenotifications/Employeenotifications.jsx';

// Employee Components
import EmployeeLayout from "../Components/Shared/Layout/EmployeeLayout";
import EmployeeDashboard from "../Components/Employee/Dashboard/EmployeeDashboard";
import MyTasks from "../Components/Employee/Tasks/MyTasks";
import AutoAttendance from "../Components/Employee/Attendance/AutoAttendance";
import MyProjects from "../Components/Employee/Projects/MyProjects";
import DailyReportForm from "../Components/Employee/DailyReport/DailyReportForm";
import EmployeeMeetings from "../Components/Employee/Meetings/EmployeeMeetings";
import EmployeeProfile from "../Components/Employee/Profile/EmployeeProfile";

// Client Components
import ClientLayout from "../Components/Shared/Layout/ClientLayout";
import ClientDashboard from "../Components/Client/Dashboard/ClientDashboard";
import ClientProjects from "../Components/Client/Projects/ClientProjects";
import ClientMeetings from "../Components/Client/Meetings/ClientMeetings";
import ClientReports from "../Components/Client/Reports/ClientReports";
import FeedbackForm from "../Components/Client/Feedback/FeedbackForm";
import ClientProfile from "../Components/Client/Profile/ClientProfile"; // ← ADDED
import ClientNotifications from "../Components/Client/Clientnotifications/Clientnotifications.jsx"
// Loader
import Loader from "../Components/Shared/Loader/Loader";

// Error Pages Components
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ef4444" }}>
        401
      </h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Unauthorized Access
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => navigate("/login")}
        style={{
          padding: "12px 24px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "500",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
        onMouseOut={(e) => (e.target.style.background = "#2563eb")}
      >
        Back to Login
      </button>
    </div>
  );
};

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ef4444" }}>
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Page Not Found
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={handleGoHome}
        style={{
          padding: "12px 24px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "500",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
        onMouseOut={(e) => (e.target.style.background = "#2563eb")}
      >
        Go Home
      </button>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </PrivateRoute>
        }
        
      >
        <Route path="notifications" element={<AdminNotifications />} />
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
        <Route path="tasks/create" element={<CreateTask />} />
        <Route path="tasks/edit/:id" element={<EditTask />} />
        <Route path="meetings" element={<MeetingList />} />
        <Route path="reports" element={<ReportGenerator />} />
        <Route path="settings" element={<AdminSettings />} /> {/* ← ADDED */}
      </Route>

      {/* Employee Routes */}
      <Route
        path="/employee/*"
        element={
          <PrivateRoute allowedRoles={["employee"]}>
            <EmployeeLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="notifications" element={<EmployeeNotifications />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="attendance" element={<AutoAttendance />} />
        <Route path="projects" element={<MyProjects />} />
        <Route path="daily-report" element={<DailyReportForm />} />
        <Route path="meetings" element={<EmployeeMeetings />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <PrivateRoute allowedRoles={["client"]}>
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route path="notifications" element={<ClientNotifications />} />
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="meetings" element={<ClientMeetings />} />
        <Route path="reports" element={<ClientReports />} />
        <Route path="feedback" element={<FeedbackForm />} />
        <Route path="profile" element={<ClientProfile />} /> {/* ← ADDED */}
      </Route>

      {/* Default Redirect */}
      <Route
        path="/"
        element={
          isAuthenticated && user?.role ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
