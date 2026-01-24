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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error - Backend might be down');
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
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// ========================================
// ADMIN API
// ========================================
export const adminAPI = {
  // ============ Dashboard ============
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentActivity: () => api.get('/admin/dashboard/activity'),
  
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
  assignTeam: (projectId, teamMembers) => 
    api.post(`/admin/projects/${projectId}/assign`, { teamMembers }),
  
  // ============ Attendance ============
  getAttendance: (date) => api.get('/admin/attendance', { params: { date } }),
  getAttendanceReport: (startDate, endDate) => 
    api.get('/admin/attendance/report', { params: { startDate, endDate } }),
  getDailyAttendance: (date) => api.get('/admin/attendance/daily', { params: { date } }),
  getMonthlyAttendance: (month, year) => 
    api.get('/admin/attendance/monthly', { params: { month, year } }),
  getLateArrivals: (date) => api.get('/admin/attendance/late', { params: { date } }),
  approveCorrection: (id) => api.put(`/admin/attendance/correction/${id}/approve`),
  rejectCorrection: (id) => api.put(`/admin/attendance/correction/${id}/reject`),
  
  // ============ Tasks ============
  getTasks: (params) => api.get('/admin/tasks', { params }),
  getTask: (id) => api.get(`/admin/tasks/${id}`),
  addTask: (data) => api.post('/admin/tasks', data),
  updateTask: (id, data) => api.put(`/admin/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/admin/tasks/${id}`),
  assignTask: (id, employeeId) => api.post(`/admin/tasks/${id}/assign`, { employeeId }),
  
  // ============ Meetings ============
  getMeetings: (params) => api.get('/admin/meetings', { params }),
  getMeeting: (id) => api.get(`/admin/meetings/${id}`),
  scheduleMeeting: (data) => api.post('/admin/meetings', data),
  updateMeeting: (id, data) => api.put(`/admin/meetings/${id}`, data),
  deleteMeeting: (id) => api.delete(`/admin/meetings/${id}`),
  addMeetingMinutes: (id, minutes) => api.post(`/admin/meetings/${id}/minutes`, { minutes }),
  
  // ============ Reports ============
  generateReport: (type, params) => api.post('/admin/reports/generate', { type, ...params }),
  getPerformanceReport: (startDate, endDate) => 
    api.get('/admin/reports/performance', { params: { startDate, endDate } }),
  getProductivityReport: (startDate, endDate) => 
    api.get('/admin/reports/productivity', { params: { startDate, endDate } }),
  getAttendanceReport: (startDate, endDate) => 
    api.get('/admin/reports/attendance', { params: { startDate, endDate } }),
  exportReport: (reportId, format) => 
    api.get(`/admin/reports/${reportId}/export`, { 
      params: { format }, 
      responseType: 'blob' 
    }),
  
  // ============ Settings ============
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getCompanyProfile: () => api.get('/admin/settings/company'),
  updateCompanyProfile: (data) => api.put('/admin/settings/company', data),
};

// ========================================
// EMPLOYEE API
// ========================================
export const employeeAPI = {
  // ============ Dashboard ============
  getDashboard: () => api.get('/employee/dashboard'),
  
  // ============ Attendance ============
  checkIn: (data) => api.post('/employee/attendance/checkin', data),
  checkOut: (data) => api.post('/employee/attendance/checkout', data),
  getMyAttendance: (params) => api.get('/employee/attendance', { params }),
  getAttendanceStatus: () => api.get('/employee/attendance/status'),
  getAttendanceSummary: (month, year) => 
    api.get('/employee/attendance/summary', { params: { month, year } }),
  requestCorrection: (data) => api.post('/employee/attendance/correction', data),
  requestLeave: (data) => api.post('/employee/attendance/leave', data),
  
  // ============ Tasks ============
  getMyTasks: (params) => api.get('/employee/tasks', { params }),
  getTask: (id) => api.get(`/employee/tasks/${id}`),
  updateTaskStatus: (id, status) => api.patch(`/employee/tasks/${id}/status`, { status }),
  addTaskComment: (id, comment) => api.post(`/employee/tasks/${id}/comments`, { comment }),
  startTaskTimer: (id) => api.post(`/employee/tasks/${id}/timer/start`),
  stopTaskTimer: (id) => api.post(`/employee/tasks/${id}/timer/stop`),
  getTaskTimer: (id) => api.get(`/employee/tasks/${id}/timer`),
  
  // ============ Projects ============
  getMyProjects: () => api.get('/employee/projects'),
  getProject: (id) => api.get(`/employee/projects/${id}`),
  
  // ============ Daily Report ============
  submitDailyReport: (data) => api.post('/employee/reports/daily', data),
  getMyReports: (params) => api.get('/employee/reports', { params }),
  getReport: (id) => api.get(`/employee/reports/${id}`),
  updateDailyReport: (id, data) => api.put(`/employee/reports/${id}`, data),
  
  // ============ Meetings ============
  getMyMeetings: (params) => api.get('/employee/meetings', { params }),
  getMeeting: (id) => api.get(`/employee/meetings/${id}`),
  
  // ============ Profile ============
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  changePassword: (data) => api.post('/employee/profile/change-password', data),
  getActivityLog: (params) => api.get('/employee/profile/activity', { params }),
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
  getProjectTimeline: (id) => api.get(`/client/projects/${id}/timeline`),
  getProjectMilestones: (id) => api.get(`/client/projects/${id}/milestones`),
  
  // ============ Meetings ============
  getMyMeetings: (params) => api.get('/client/meetings', { params }),
  getMeeting: (id) => api.get(`/client/meetings/${id}`),
  scheduleMeeting: (data) => api.post('/client/meetings', data),
  cancelMeeting: (id) => api.delete(`/client/meetings/${id}`),
  
  // ============ Reports ============
  getProjectReports: (projectId, params) => 
    api.get(`/client/projects/${projectId}/reports`, { params }),
  getWeeklyReport: (projectId, week) => 
    api.get(`/client/projects/${projectId}/reports/weekly`, { params: { week } }),
  downloadReport: (reportId) => 
    api.get(`/client/reports/${reportId}/download`, { responseType: 'blob' }),
  
  // ============ Feedback ============
  submitFeedback: (projectId, data) => 
    api.post(`/client/projects/${projectId}/feedback`, data),
  getFeedbackHistory: (projectId) => 
    api.get(`/client/projects/${projectId}/feedback`),
  approveMilestone: (projectId, milestoneId, data) => 
    api.post(`/client/projects/${projectId}/milestones/${milestoneId}/approve`, data),
  requestChanges: (projectId, milestoneId, data) => 
    api.post(`/client/projects/${projectId}/milestones/${milestoneId}/changes`, data),
  rateSatisfaction: (projectId, rating) => 
    api.post(`/client/projects/${projectId}/rating`, { rating }),
  
  // ============ Profile ============
  getProfile: () => api.get('/client/profile'),
  updateProfile: (data) => api.put('/client/profile', data),
  updateCompanyInfo: (data) => api.put('/client/profile/company', data),
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
  
  // Upload document
  uploadDocument: (file, projectId) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('projectId', projectId);
    return api.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};