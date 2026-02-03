// src/utils/api.js
// Production API Configuration - Connected to Backend

import axios from 'axios';

// Get API URL from .env file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.error('🚫 Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error - Backend might be down');
      console.error('Make sure backend is running on:', API_URL);
    } else {
      console.error('❌ API Error:', error.response.status, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;

// ========================================
// AUTH API
// ========================================
export const authAPI = {
  // Login user
  login: (data) => api.post('/auth/login', data),

  // Register new user (client)
  register: (data) => api.post('/auth/register', data),

  // Logout user
  logout: () => api.post('/auth/logout'),

  // Verify JWT token
  verifyToken: () => api.get('/auth/verify'),

  // Get current user
  getMe: () => api.get('/auth/me'),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (data) => api.post('/auth/reset-password', data),

  // Update password
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// ========================================
// ADMIN API
// ========================================
export const adminAPI = {
  // ============ Dashboard ============
  getDashboardStats: () => api.get('/admin/dashboard'),
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationAsRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markNotificationAsUnread: (id) => api.patch(`/admin/notifications/${id}/unread`),
  markAllNotificationsAsRead: () => api.patch('/admin/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  deleteNotifications: (ids) => api.post('/admin/notifications/delete-many', { ids }),



  // ============ Employees ============
  getEmployees: (params) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  addEmployee: (data) => api.post('/admin/employees', data),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),

  // ============ Clients ============
  getClients: (params) => api.get('/admin/clients', { params }),
  getClient: (id) => api.get(`/admin/clients/${id}`),
  addClient: (data) => api.post('/admin/clients', data),
  updateClient: (id, data) => api.put(`/admin/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/admin/clients/${id}`),

  // ============ Projects ============
  getProjects: (params) => api.get('/admin/projects', { params }),
  getProject: (id) => api.get(`/admin/projects/${id}`),
  addProject: (data) => api.post('/admin/projects', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),

  // ============ Attendance ============
  getDailyAttendance: (params) => api.get('/admin/attendance', { params }),
  getAllAttendance: (params) => api.get('/attendance/admin', { params }),
  getMonthlyAttendance: (params) => api.get('/attendance/admin/monthly', { params }),
  getAttendanceReport: (params) => api.get('/attendance/admin/report', { params }),
  getLateArrivals: (params) => api.get('/attendance/admin/late', { params }),
  getEmployeeAttendance: (employeeId, params) => api.get(`/attendance/admin/employee/${employeeId}`, { params }),
  approveCorrection: (id, data) => api.put(`/attendance/admin/correction/${id}/approve`, data),
  rejectCorrection: (id, data) => api.put(`/attendance/admin/correction/${id}/reject`, data),

  // ============ Tasks ============
  getTasks: (params) => api.get('/admin/tasks', { params }),
  getTask: (id) => api.get(`/admin/tasks/${id}`),
  addTask: (data) => api.post('/admin/tasks', data),
  updateTask: (id, data) => api.put(`/admin/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/admin/tasks/${id}`),

  // ============ Meetings ============
  getMeetings: (params) => api.get('/meetings/admin', { params }),
  getMeeting: (id) => api.get(`/meetings/admin/${id}`),
  scheduleMeeting: (data) => api.post('/meetings/admin', data),
  updateMeeting: (id, data) => api.put(`/meetings/admin/${id}`, data),
  deleteMeeting: (id) => api.delete(`/meetings/admin/${id}`),
  addMeetingMinutes: (id, data) => api.post(`/meetings/admin/${id}/minutes`, data),

  // ============ Reports ============
  generateReport: (data) => api.post('/reports/admin/generate', data),
  getPerformanceReport: (params) => api.get('/reports/admin/performance', { params }),
  getProductivityReport: (params) => api.get('/reports/admin/productivity', { params }),
  getAttendanceReportData: (params) => api.get('/reports/admin/attendance', { params }),
  getEmployeeReport: (params) => api.get('/reports/admin/employee', { params }),
  exportReport: (reportType, params) =>
    api.get(`/reports/admin/${reportType}/export`, {
      params,
      responseType: 'blob'
    }),

  // ============ Settings ============
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// ========================================
// EMPLOYEE API
// ========================================
export const employeeAPI = {
  // ============ Dashboard ============
  getDashboard: () => api.get('/employee/dashboard'),

  getNotifications: () => api.get('/employee/notifications'),
  getUnreadCount: () => api.get('/employee/notifications/unread-count'),
  markNotificationAsRead: (id) => api.patch(`/employee/notifications/${id}/read`),
  markNotificationAsUnread: (id) => api.patch(`/employee/notifications/${id}/unread`),
  markAllNotificationsAsRead: () => api.patch('/employee/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/employee/notifications/${id}`),
  deleteNotifications: (ids) => api.post('/employee/notifications/delete-many', { ids }),
  
  // ============ Attendance ============
  checkIn: (data) => api.post('/attendance/employee/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/employee/attendance/checkout', data),
  getMyAttendance: (params) => api.get('/attendance/employee', { params }),
  getAttendanceStatus: () => api.get('/attendance/employee/attendance/status'),
  getAttendanceSummary: (params) => api.get('/attendance/employee/summary', { params }),
  requestCorrection: (data) => api.post('/attendance/employee/correction', data),
  requestLeave: (data) => api.post('/attendance/employee/leave', data),

  // ============ Tasks ============
  // Update to the employeeAPI section - add these methods

  // ============ Tasks ============
  getMyTasks: (params) => api.get('/tasks/employee/my-tasks', { params }),
  getTask: (id) => api.get(`/employee/tasks/${id}`),
  updateTaskStatus: (id, status) => api.patch(`/tasks/employee/${id}/status`, { status }),
  startTaskTimer: (id) => api.post(`/tasks/employee/${id}/timer/start`),
  stopTaskTimer: (id) => api.post(`/tasks/employee/${id}/timer/stop`),
  addTaskComment: (id, comment) => api.post(`/employee/tasks/${id}/comments`, { comment }),

  // ============ Projects ============
  getMyProjects: (params) => api.get('/employee/projects', { params }),
  getProject: (id) => api.get(`/employee/projects/${id}`),

  // ============ Daily Report ============
  submitDailyReport: (data) => api.post('/employee/reports/daily', data),
  getMyReports: (params) => api.get('/employee/reports', { params }),
  getReport: (id) => api.get(`/employee/reports/${id}`),
  updateDailyReport: (id, data) => api.put(`/employee/reports/${id}`, data),

  // ============ Meetings ============
  getMyMeetings: (params) => api.get('/meetings/employee', { params }),
  getMeeting: (id) => api.get(`/meetings/employee/${id}`),
  updateMeetingStatus: (id, status) => api.patch(`/meetings/employee/${id}/status`, { status }),

  // ============ Profile ============
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  changePassword: (data) => api.post('/employee/profile/change-password', data),
};

// ========================================
// CLIENT API
// ========================================
export const clientAPI = {
  // ============ Dashboard ============
  getDashboard: () => api.get('/client/dashboard'),

  // ============ Projects ============
  getMyProjects: (params) => api.get('/client/projects', { params }),
  getProject: (id) => api.get(`/client/projects/${id}`),
  getProjectProgress: (id) => api.get(`/client/projects/${id}/progress`),
  createProject: (projectData) => api.post('/client/projects', projectData),
  updateProject: (id, projectData) => api.put(`/client/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/client/projects/${id}`),
  sendProjectToAdmin: (requestData) => api.post('/client/projects/send-to-admin', requestData),

  // ============ Meetings ============
  getMyMeetings: (params) => api.get('/meetings/client', { params }),
  getMeeting: (id) => api.get(`/meetings/client/${id}`),
  scheduleMeeting: (data) => api.post('/meetings/client', data),
  cancelMeeting: (id) => api.delete(`/meetings/client/${id}`),
  updateMeetingStatus: (id, status) => api.patch(`/meetings/client/${id}/status`, { status }),
  // Add these to clientAPI object
  getNotifications: () => api.get('/client/notifications'),
  markNotificationAsRead: (id) => api.patch(`/client/notifications/${id}/read`),
  markNotificationAsUnread: (id) => api.patch(`/client/notifications/${id}/unread`),
  markAllNotificationsAsRead: () => api.patch('/client/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/client/notifications/${id}`),
  // ============ Reports ============
  getProjectReports: (projectId, params) =>
    api.get(`/reports/client/projects/${projectId}`, { params }),
  getWeeklyReport: (projectId, params) =>
    api.get(`/reports/client/projects/${projectId}/weekly`, { params }),
  downloadReport: (reportId) =>
    api.get(`/reports/client/${reportId}/download`, { responseType: 'blob' }),

  // ============ Feedback ============
  submitFeedback: (projectId, data) =>
    api.post(`/client/projects/${projectId}/feedback`, data),
  getFeedbackHistory: (projectId) =>
    api.get(`/client/projects/${projectId}/feedback`),

  // ============ Profile ============
  getProfile: () => api.get('/client/profile'),
  updateProfile: (data) => api.put('/client/profile', data),
  changePassword: (data) => api.put('/client/password', data),
};

// ========================================
// FILE UPLOAD API
// ========================================
export const uploadAPI = {
  // Upload any file
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload avatar/profile picture
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

