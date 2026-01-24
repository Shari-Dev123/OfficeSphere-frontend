// import axios from 'axios';

// // Get API URL from .env file
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// console.log('🔗 API URL:', API_URL);

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 30000, // 30 seconds
// });

// // Request interceptor - Add token to headers
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized - redirect to login
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
    
//     // Handle network errors
//     if (!error.response) {
//       console.error('❌ Network Error - Backend might be down');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

// // ========================================
// // AUTH API
// // ========================================
// export const authAPI = {
//   // Login user
//   login: (data) => api.post('/auth/login', data),
  
//   // Register new user (client)
//   register: (data) => api.post('/auth/register', data),
  
//   // Logout user
//   logout: () => api.post('/auth/logout'),
  
//   // Verify JWT token
//   verifyToken: () => api.get('/auth/verify'),
  
//   // Forgot password
//   forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
//   // Reset password
//   resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
// };

// // ========================================
// // ADMIN API
// // ========================================
// export const adminAPI = {
//   // ============ Dashboard ============
//   getDashboardStats: () => api.get('/admin/dashboard'),
//   getRecentActivity: () => api.get('/admin/dashboard/activity'),
  
//   // ============ Employees ============
//   getEmployees: (params) => api.get('/admin/employees', { params }),
//   getEmployee: (id) => api.get(`/admin/employees/${id}`),
//   addEmployee: (data) => api.post('/admin/employees', data),
//   updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
//   deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  
//   // ============ Clients ============
//   getClients: (params) => api.get('/admin/clients', { params }),
//   getClient: (id) => api.get(`/admin/clients/${id}`),
//   addClient: (data) => api.post('/admin/clients', data),
//   updateClient: (id, data) => api.put(`/admin/clients/${id}`, data),
//   deleteClient: (id) => api.delete(`/admin/clients/${id}`),
  
//   // ============ Projects ============
//   getProjects: (params) => api.get('/admin/projects', { params }),
//   getProject: (id) => api.get(`/admin/projects/${id}`),
//   addProject: (data) => api.post('/admin/projects', data),
//   updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
//   deleteProject: (id) => api.delete(`/admin/projects/${id}`),
//   assignTeam: (projectId, teamMembers) => 
//     api.post(`/admin/projects/${projectId}/assign`, { teamMembers }),
  
//   // ============ Attendance ============
//   getAttendance: (date) => api.get('/admin/attendance', { params: { date } }),
//   getAttendanceReport: (startDate, endDate) => 
//     api.get('/admin/attendance/report', { params: { startDate, endDate } }),
//   getDailyAttendance: (date) => api.get('/admin/attendance/daily', { params: { date } }),
//   getMonthlyAttendance: (month, year) => 
//     api.get('/admin/attendance/monthly', { params: { month, year } }),
//   getLateArrivals: (date) => api.get('/admin/attendance/late', { params: { date } }),
//   approveCorrection: (id) => api.put(`/admin/attendance/correction/${id}/approve`),
//   rejectCorrection: (id) => api.put(`/admin/attendance/correction/${id}/reject`),
  
//   // ============ Tasks ============
//   getTasks: (params) => api.get('/admin/tasks', { params }),
//   getTask: (id) => api.get(`/admin/tasks/${id}`),
//   addTask: (data) => api.post('/admin/tasks', data),
//   updateTask: (id, data) => api.put(`/admin/tasks/${id}`, data),
//   deleteTask: (id) => api.delete(`/admin/tasks/${id}`),
//   assignTask: (id, employeeId) => api.post(`/admin/tasks/${id}/assign`, { employeeId }),
  
//   // ============ Meetings ============
//   getMeetings: (params) => api.get('/admin/meetings', { params }),
//   getMeeting: (id) => api.get(`/admin/meetings/${id}`),
//   scheduleMeeting: (data) => api.post('/admin/meetings', data),
//   updateMeeting: (id, data) => api.put(`/admin/meetings/${id}`, data),
//   deleteMeeting: (id) => api.delete(`/admin/meetings/${id}`),
//   addMeetingMinutes: (id, minutes) => api.post(`/admin/meetings/${id}/minutes`, { minutes }),
  
//   // ============ Reports ============
//   generateReport: (type, params) => api.post('/admin/reports/generate', { type, ...params }),
//   getPerformanceReport: (startDate, endDate) => 
//     api.get('/admin/reports/performance', { params: { startDate, endDate } }),
//   getProductivityReport: (startDate, endDate) => 
//     api.get('/admin/reports/productivity', { params: { startDate, endDate } }),
//   getAttendanceReport: (startDate, endDate) => 
//     api.get('/admin/reports/attendance', { params: { startDate, endDate } }),
//   exportReport: (reportId, format) => 
//     api.get(`/admin/reports/${reportId}/export`, { 
//       params: { format }, 
//       responseType: 'blob' 
//     }),
  
//   // ============ Settings ============
//   getSettings: () => api.get('/admin/settings'),
//   updateSettings: (data) => api.put('/admin/settings', data),
//   getCompanyProfile: () => api.get('/admin/settings/company'),
//   updateCompanyProfile: (data) => api.put('/admin/settings/company', data),
// };

// // ========================================
// // EMPLOYEE API
// // ========================================
// export const employeeAPI = {
//   // ============ Dashboard ============
//   getDashboard: () => api.get('/employee/dashboard'),
  
//   // ============ Attendance ============
//   checkIn: (data) => api.post('/employee/attendance/checkin', data),
//   checkOut: (data) => api.post('/employee/attendance/checkout', data),
//   getMyAttendance: (params) => api.get('/employee/attendance', { params }),
//   getAttendanceStatus: () => api.get('/employee/attendance/status'),
//   getAttendanceSummary: (month, year) => 
//     api.get('/employee/attendance/summary', { params: { month, year } }),
//   requestCorrection: (data) => api.post('/employee/attendance/correction', data),
//   requestLeave: (data) => api.post('/employee/attendance/leave', data),
  
//   // ============ Tasks ============
//   getMyTasks: (params) => api.get('/employee/tasks', { params }),
//   getTask: (id) => api.get(`/employee/tasks/${id}`),
//   updateTaskStatus: (id, status) => api.patch(`/employee/tasks/${id}/status`, { status }),
//   addTaskComment: (id, comment) => api.post(`/employee/tasks/${id}/comments`, { comment }),
//   startTaskTimer: (id) => api.post(`/employee/tasks/${id}/timer/start`),
//   stopTaskTimer: (id) => api.post(`/employee/tasks/${id}/timer/stop`),
//   getTaskTimer: (id) => api.get(`/employee/tasks/${id}/timer`),
  
//   // ============ Projects ============
//   getMyProjects: () => api.get('/employee/projects'),
//   getProject: (id) => api.get(`/employee/projects/${id}`),
  
//   // ============ Daily Report ============
//   submitDailyReport: (data) => api.post('/employee/reports/daily', data),
//   getMyReports: (params) => api.get('/employee/reports', { params }),
//   getReport: (id) => api.get(`/employee/reports/${id}`),
//   updateDailyReport: (id, data) => api.put(`/employee/reports/${id}`, data),
  
//   // ============ Meetings ============
//   getMyMeetings: (params) => api.get('/employee/meetings', { params }),
//   getMeeting: (id) => api.get(`/employee/meetings/${id}`),
  
//   // ============ Profile ============
//   getProfile: () => api.get('/employee/profile'),
//   updateProfile: (data) => api.put('/employee/profile', data),
//   changePassword: (data) => api.post('/employee/profile/change-password', data),
//   getActivityLog: (params) => api.get('/employee/profile/activity', { params }),
// };

// // ========================================
// // CLIENT API
// // ========================================
// export const clientAPI = {
//   // ============ Dashboard ============
//   getDashboard: () => api.get('/client/dashboard'),
  
//   // ============ Projects ============
//   getMyProjects: (params) => api.get('/client/projects', { params }),
//   getProject: (id) => api.get(`/client/projects/${id}`),
//   getProjectProgress: (id) => api.get(`/client/projects/${id}/progress`),
//   getProjectTimeline: (id) => api.get(`/client/projects/${id}/timeline`),
//   getProjectMilestones: (id) => api.get(`/client/projects/${id}/milestones`),
  
//   // ============ Meetings ============
//   getMyMeetings: (params) => api.get('/client/meetings', { params }),
//   getMeeting: (id) => api.get(`/client/meetings/${id}`),
//   scheduleMeeting: (data) => api.post('/client/meetings', data),
//   cancelMeeting: (id) => api.delete(`/client/meetings/${id}`),
  
//   // ============ Reports ============
//   getProjectReports: (projectId, params) => 
//     api.get(`/client/projects/${projectId}/reports`, { params }),
//   getWeeklyReport: (projectId, week) => 
//     api.get(`/client/projects/${projectId}/reports/weekly`, { params: { week } }),
//   downloadReport: (reportId) => 
//     api.get(`/client/reports/${reportId}/download`, { responseType: 'blob' }),
  
//   // ============ Feedback ============
//   submitFeedback: (projectId, data) => 
//     api.post(`/client/projects/${projectId}/feedback`, data),
//   getFeedbackHistory: (projectId) => 
//     api.get(`/client/projects/${projectId}/feedback`),
//   approveMilestone: (projectId, milestoneId, data) => 
//     api.post(`/client/projects/${projectId}/milestones/${milestoneId}/approve`, data),
//   requestChanges: (projectId, milestoneId, data) => 
//     api.post(`/client/projects/${projectId}/milestones/${milestoneId}/changes`, data),
//   rateSatisfaction: (projectId, rating) => 
//     api.post(`/client/projects/${projectId}/rating`, { rating }),
  
//   // ============ Profile ============
//   getProfile: () => api.get('/client/profile'),
//   updateProfile: (data) => api.put('/client/profile', data),
//   updateCompanyInfo: (data) => api.put('/client/profile/company', data),
// };

// // ========================================
// // FILE UPLOAD API
// // ========================================
// export const uploadAPI = {
//   // Upload any file
//   uploadFile: (file, type) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('type', type);
//     return api.post('/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
  
//   // Upload avatar/profile picture
//   uploadAvatar: (file) => {
//     const formData = new FormData();
//     formData.append('avatar', file);
//     return api.post('/upload/avatar', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
  
//   // Upload document
//   uploadDocument: (file, projectId) => {
//     const formData = new FormData();
//     formData.append('document', file);
//     formData.append('projectId', projectId);
//     return api.post('/upload/document', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
// };





// Mock API for Frontend-Only Testing

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database
const mockDB = {
  employees: [
    { id: 1, name: 'John Doe', email: 'john@office.com', department: 'Development', position: 'Senior Developer', status: 'Active', joinDate: '2023-01-15', phone: '+1234567890' },
    { id: 2, name: 'Jane Smith', email: 'jane@office.com', department: 'Design', position: 'UI/UX Designer', status: 'Active', joinDate: '2023-02-20', phone: '+1234567891' },
    { id: 3, name: 'Bob Johnson', email: 'bob@office.com', department: 'Marketing', position: 'Marketing Manager', status: 'Active', joinDate: '2023-03-10', phone: '+1234567892' }
  ],
  clients: [
    { id: 1, name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1234567890', company: 'ABC Corp', status: 'Active', joinDate: '2023-01-01' },
    { id: 2, name: 'XYZ Limited', email: 'info@xyz.com', phone: '+0987654321', company: 'XYZ Ltd', status: 'Active', joinDate: '2023-02-15' }
  ],
  projects: [
    { id: 1, name: 'Website Redesign', clientId: 1, client: 'ABC Corp', status: 'In Progress', progress: 65, deadline: '2024-03-15', startDate: '2024-01-01', budget: '$50,000', teamSize: 5 },
    { id: 2, name: 'Mobile App Development', clientId: 2, client: 'XYZ Ltd', status: 'Planning', progress: 25, deadline: '2024-05-20', startDate: '2024-02-01', budget: '$80,000', teamSize: 8 },
    { id: 3, name: 'E-commerce Platform', clientId: 1, client: 'ABC Corp', status: 'Completed', progress: 100, deadline: '2024-01-30', startDate: '2023-10-01', budget: '$120,000', teamSize: 10 }
  ],
  tasks: [
    { id: 1, title: 'Design Homepage', projectId: 1, project: 'Website Redesign', assigneeId: 2, assignee: 'Jane Smith', status: 'In Progress', priority: 'High', dueDate: '2024-02-15', description: 'Create mockups for homepage' },
    { id: 2, title: 'API Integration', projectId: 2, project: 'Mobile App', assigneeId: 1, assignee: 'John Doe', status: 'Pending', priority: 'Medium', dueDate: '2024-03-01', description: 'Integrate REST APIs' },
    { id: 3, title: 'Database Setup', projectId: 2, project: 'Mobile App', assigneeId: 1, assignee: 'John Doe', status: 'Completed', priority: 'High', dueDate: '2024-02-05', description: 'Setup PostgreSQL database' }
  ],
  meetings: [
    { id: 1, title: 'Project Kickoff', date: '2024-02-15', time: '10:00 AM', duration: '1 hour', participants: ['John Doe', 'Jane Smith', 'ABC Corp'], location: 'Conference Room A', status: 'Scheduled' },
    { id: 2, title: 'Client Review Meeting', date: '2024-02-20', time: '2:00 PM', duration: '2 hours', participants: ['ABC Corp', 'John Doe', 'Jane Smith'], location: 'Zoom', status: 'Scheduled' },
    { id: 3, title: 'Sprint Planning', date: '2024-02-10', time: '9:00 AM', duration: '1.5 hours', participants: ['John Doe', 'Jane Smith', 'Bob Johnson'], location: 'Conference Room B', status: 'Completed' }
  ],
  attendance: [
    { id: 1, employeeId: 1, employee: 'John Doe', date: '2024-02-01', checkIn: '09:00 AM', checkOut: '05:00 PM', status: 'Present', hours: '8h' },
    { id: 2, employeeId: 2, employee: 'Jane Smith', date: '2024-02-01', checkIn: '09:15 AM', checkOut: '05:30 PM', status: 'Present', hours: '8.25h' },
    { id: 3, employeeId: 1, employee: 'John Doe', date: '2024-02-02', checkIn: '09:05 AM', checkOut: '05:10 PM', status: 'Present', hours: '8h' }
  ],
  reports: [
    { id: 1, employeeId: 1, employee: 'John Doe', date: '2024-02-01', tasksCompleted: 3, hoursWorked: 8, achievements: 'Completed API integration', challenges: 'Database connection issues', type: 'daily' }
  ],
  dashboardStats: {
    admin: {
      totalEmployees: 3,
      totalClients: 2,
      activeProjects: 2,
      completedProjects: 1,
      pendingTasks: 1,
      todayAttendance: 3,
      revenue: '$250,000',
      growth: '+12%'
    },
    employee: {
      myTasks: 2,
      completedTasks: 1,
      todayHours: '8h',
      thisWeekHours: '40h',
      upcomingMeetings: 2,
      pendingReviews: 1
    },
    client: {
      myProjects: 2,
      activeProjects: 1,
      completedProjects: 1,
      upcomingMeetings: 1,
      totalInvoices: 5,
      pendingPayments: 1
    }
  }
};

// Helper functions
const getStoredData = (key) => {
  try {
    const stored = localStorage.getItem(`mock_${key}`);
    return stored ? JSON.parse(stored) : mockDB[key];
  } catch {
    return mockDB[key];
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to store data:', error);
  }
};

// Mock axios-like API object (no actual backend needed)
const api = {
  get: async (url) => {
    await delay();
    return { data: {} };
  },
  post: async (url, data) => {
    await delay();
    return { data: {} };
  },
  put: async (url, data) => {
    await delay();
    return { data: {} };
  },
  delete: async (url) => {
    await delay();
    return { data: {} };
  },
  patch: async (url, data) => {
    await delay();
    return { data: {} };
  }
};

export default api;

// ========================================
// AUTH API
// ========================================
export const authAPI = {
  login: async (data) => {
    await delay();
    
    const users = [
      { id: 1, email: 'admin@office.com', password: 'admin123', role: 'admin', name: 'Admin User' },
      { id: 2, email: 'employee@office.com', password: 'emp123', role: 'employee', name: 'John Doe' },
      { id: 3, email: 'client@office.com', password: 'client123', role: 'client', name: 'ABC Corp' }
    ];
    
    const user = users.find(u => u.email === data.email && u.password === data.password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const token = `mock_token_${user.id}_${Date.now()}`;
    const { password, ...userWithoutPassword } = user;
    
    return {
      data: {
        success: true,
        user: userWithoutPassword,
        token
      }
    };
  },
  
  register: async (data) => {
    await delay();
    const newUser = { id: Date.now(), ...data, role: 'client' };
    return { data: { success: true, user: newUser, token: `mock_token_${newUser.id}` } };
  },
  
  logout: async () => {
    await delay();
    return { data: { success: true } };
  },
  
  verifyToken: async () => {
    await delay();
    return { data: { success: true } };
  },
  
  forgotPassword: async (email) => {
    await delay();
    return { data: { success: true, message: 'Password reset email sent' } };
  },
  
  resetPassword: async (token, password) => {
    await delay();
    return { data: { success: true, message: 'Password reset successful' } };
  }
};

// ========================================
// ADMIN API
// ========================================
export const adminAPI = {
  // Dashboard
  getDashboardStats: async () => {
    await delay();
    return { data: mockDB.dashboardStats.admin };
  },
  
  getRecentActivity: async () => {
    await delay();
    return { data: [
      { id: 1, type: 'project', message: 'New project "Website Redesign" created', time: '2 hours ago' },
      { id: 2, type: 'employee', message: 'John Doe checked in', time: '3 hours ago' },
      { id: 3, type: 'task', message: 'Task "Design Homepage" completed', time: '5 hours ago' }
    ]};
  },
  
  // Employees
  getEmployees: async (params) => {
    await delay();
    return { data: getStoredData('employees') };
  },
  
  getEmployee: async (id) => {
    await delay();
    const employee = getStoredData('employees').find(e => e.id === parseInt(id));
    return { data: employee };
  },
  
  addEmployee: async (data) => {
    await delay();
    const employees = getStoredData('employees');
    const newEmployee = { id: employees.length + 1, ...data, status: 'Active', joinDate: new Date().toISOString().split('T')[0] };
    employees.push(newEmployee);
    setStoredData('employees', employees);
    return { data: newEmployee };
  },
  
  updateEmployee: async (id, data) => {
    await delay();
    const employees = getStoredData('employees');
    const index = employees.findIndex(e => e.id === parseInt(id));
    if (index !== -1) {
      employees[index] = { ...employees[index], ...data };
      setStoredData('employees', employees);
      return { data: employees[index] };
    }
    throw new Error('Employee not found');
  },
  
  deleteEmployee: async (id) => {
    await delay();
    const employees = getStoredData('employees');
    const filtered = employees.filter(e => e.id !== parseInt(id));
    setStoredData('employees', filtered);
    return { data: { success: true } };
  },
  
  // Clients
  getClients: async (params) => {
    await delay();
    return { data: getStoredData('clients') };
  },
  
  getClient: async (id) => {
    await delay();
    const client = getStoredData('clients').find(c => c.id === parseInt(id));
    return { data: client };
  },
  
  addClient: async (data) => {
    await delay();
    const clients = getStoredData('clients');
    const newClient = { id: clients.length + 1, ...data, status: 'Active', joinDate: new Date().toISOString().split('T')[0] };
    clients.push(newClient);
    setStoredData('clients', clients);
    return { data: newClient };
  },
  
  updateClient: async (id, data) => {
    await delay();
    const clients = getStoredData('clients');
    const index = clients.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
      setStoredData('clients', clients);
      return { data: clients[index] };
    }
    throw new Error('Client not found');
  },
  
  deleteClient: async (id) => {
    await delay();
    const clients = getStoredData('clients');
    const filtered = clients.filter(c => c.id !== parseInt(id));
    setStoredData('clients', filtered);
    return { data: { success: true } };
  },
  
  // Projects
  getProjects: async (params) => {
    await delay();
    return { data: getStoredData('projects') };
  },
  
  getProject: async (id) => {
    await delay();
    const project = getStoredData('projects').find(p => p.id === parseInt(id));
    return { data: project };
  },
  
  addProject: async (data) => {
    await delay();
    const projects = getStoredData('projects');
    const newProject = { id: projects.length + 1, ...data, status: 'Planning', progress: 0 };
    projects.push(newProject);
    setStoredData('projects', projects);
    return { data: newProject };
  },
  
  updateProject: async (id, data) => {
    await delay();
    const projects = getStoredData('projects');
    const index = projects.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data };
      setStoredData('projects', projects);
      return { data: projects[index] };
    }
    throw new Error('Project not found');
  },
  
  deleteProject: async (id) => {
    await delay();
    const projects = getStoredData('projects');
    const filtered = projects.filter(p => p.id !== parseInt(id));
    setStoredData('projects', filtered);
    return { data: { success: true } };
  },
  
  assignTeam: async (projectId, teamMembers) => {
    await delay();
    return { data: { success: true, projectId, teamMembers } };
  },
  
  // Attendance
  getAttendance: async (date) => {
    await delay();
    return { data: getStoredData('attendance') };
  },
  
  getAttendanceReport: async (startDate, endDate) => {
    await delay();
    return { data: getStoredData('attendance') };
  },
  
  getDailyAttendance: async (date) => {
    await delay();
    const today = date || new Date().toISOString().split('T')[0];
    return { data: getStoredData('attendance').filter(a => a.date === today) };
  },
  
  getMonthlyAttendance: async (month, year) => {
    await delay();
    return { data: getStoredData('attendance') };
  },
  
  getLateArrivals: async (date) => {
    await delay();
    return { data: getStoredData('attendance').filter(a => a.checkIn > '09:15 AM') };
  },
  
  approveCorrection: async (id) => {
    await delay();
    return { data: { success: true } };
  },
  
  rejectCorrection: async (id) => {
    await delay();
    return { data: { success: true } };
  },
  
  // Tasks
  getTasks: async (params) => {
    await delay();
    return { data: getStoredData('tasks') };
  },
  
  getTask: async (id) => {
    await delay();
    const task = getStoredData('tasks').find(t => t.id === parseInt(id));
    return { data: task };
  },
  
  addTask: async (data) => {
    await delay();
    const tasks = getStoredData('tasks');
    const newTask = { id: tasks.length + 1, ...data, status: 'Pending' };
    tasks.push(newTask);
    setStoredData('tasks', tasks);
    return { data: newTask };
  },
  
  updateTask: async (id, data) => {
    await delay();
    const tasks = getStoredData('tasks');
    const index = tasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...data };
      setStoredData('tasks', tasks);
      return { data: tasks[index] };
    }
    throw new Error('Task not found');
  },
  
  deleteTask: async (id) => {
    await delay();
    const tasks = getStoredData('tasks');
    const filtered = tasks.filter(t => t.id !== parseInt(id));
    setStoredData('tasks', filtered);
    return { data: { success: true } };
  },
  
  assignTask: async (id, employeeId) => {
    await delay();
    return { data: { success: true, taskId: id, employeeId } };
  },
  
  // Meetings
  getMeetings: async (params) => {
    await delay();
    return { data: getStoredData('meetings') };
  },
  
  getMeeting: async (id) => {
    await delay();
    const meeting = getStoredData('meetings').find(m => m.id === parseInt(id));
    return { data: meeting };
  },
  
  scheduleMeeting: async (data) => {
    await delay();
    const meetings = getStoredData('meetings');
    const newMeeting = { id: meetings.length + 1, ...data, status: 'Scheduled' };
    meetings.push(newMeeting);
    setStoredData('meetings', meetings);
    return { data: newMeeting };
  },
  
  updateMeeting: async (id, data) => {
    await delay();
    const meetings = getStoredData('meetings');
    const index = meetings.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      meetings[index] = { ...meetings[index], ...data };
      setStoredData('meetings', meetings);
      return { data: meetings[index] };
    }
    throw new Error('Meeting not found');
  },
  
  deleteMeeting: async (id) => {
    await delay();
    const meetings = getStoredData('meetings');
    const filtered = meetings.filter(m => m.id !== parseInt(id));
    setStoredData('meetings', filtered);
    return { data: { success: true } };
  },
  
  addMeetingMinutes: async (id, minutes) => {
    await delay();
    return { data: { success: true, meetingId: id, minutes } };
  },
  
  // Reports
  generateReport: async (type, params) => {
    await delay();
    return { data: { success: true, reportId: Date.now(), type, ...params } };
  },
  
  getPerformanceReport: async (startDate, endDate) => {
    await delay();
    return { data: { employees: mockDB.employees, startDate, endDate } };
  },
  
  getProductivityReport: async (startDate, endDate) => {
    await delay();
    return { data: { tasks: mockDB.tasks, startDate, endDate } };
  },
  
  getAttendanceReport: async (startDate, endDate) => {
    await delay();
    return { data: getStoredData('attendance') };
  },
  
  exportReport: async (reportId, format) => {
    await delay();
    return { data: new Blob(['Mock report data'], { type: 'text/plain' }) };
  },
  
  // Settings
  getSettings: async () => {
    await delay();
    return { data: { companyName: 'OfficeSphere', theme: 'light' } };
  },
  
  updateSettings: async (data) => {
    await delay();
    return { data: { success: true, ...data } };
  },
  
  getCompanyProfile: async () => {
    await delay();
    return { data: { name: 'OfficeSphere', email: 'info@officesphere.com' } };
  },
  
  updateCompanyProfile: async (data) => {
    await delay();
    return { data: { success: true, ...data } };
  }
};

// ========================================
// EMPLOYEE API
// ========================================
export const employeeAPI = {
  getDashboard: async () => {
    await delay();
    return { data: mockDB.dashboardStats.employee };
  },
  
  // Attendance
  checkIn: async (data) => {
    await delay();
    const attendance = getStoredData('attendance');
    const newRecord = {
      id: attendance.length + 1,
      employeeId: data.employeeId || 2,
      employee: 'Current User',
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Present'
    };
    attendance.push(newRecord);
    setStoredData('attendance', attendance);
    return { data: newRecord };
  },
  
  checkOut: async (data) => {
    await delay();
    const attendance = getStoredData('attendance');
    const today = new Date().toISOString().split('T')[0];
    const record = attendance.find(a => a.date === today && a.employeeId === (data.employeeId || 2));
    if (record) {
      record.checkOut = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setStoredData('attendance', attendance);
      return { data: record };
    }
    throw new Error('No check-in record found');
  },
  
  getMyAttendance: async (params) => {
    await delay();
    return { data: getStoredData('attendance') };
  },
  
  getAttendanceStatus: async () => {
    await delay();
    const today = new Date().toISOString().split('T')[0];
    const record = getStoredData('attendance').find(a => a.date === today);
    return { data: record || { status: 'not_checked_in' } };
  },
  
  getAttendanceSummary: async (month, year) => {
    await delay();
    return { data: { totalDays: 22, presentDays: 20, absentDays: 2, lateArrivals: 3 } };
  },
  
  requestCorrection: async (data) => {
    await delay();
    return { data: { success: true, requestId: Date.now() } };
  },
  
  requestLeave: async (data) => {
    await delay();
    return { data: { success: true, leaveId: Date.now() } };
  },
  
  // Tasks
  getMyTasks: async (params) => {
    await delay();
    return { data: getStoredData('tasks') };
  },
  
  getTask: async (id) => {
    await delay();
    const task = getStoredData('tasks').find(t => t.id === parseInt(id));
    return { data: task };
  },
  
  updateTaskStatus: async (id, status) => {
    await delay();
    const tasks = getStoredData('tasks');
    const task = tasks.find(t => t.id === parseInt(id));
    if (task) {
      task.status = status;
      setStoredData('tasks', tasks);
      return { data: task };
    }
    throw new Error('Task not found');
  },
  
  addTaskComment: async (id, comment) => {
    await delay();
    return { data: { success: true, taskId: id, comment } };
  },
  
  startTaskTimer: async (id) => {
    await delay();
    return { data: { success: true, taskId: id, startTime: new Date().toISOString() } };
  },
  
  stopTaskTimer: async (id) => {
    await delay();
    return { data: { success: true, taskId: id, endTime: new Date().toISOString() } };
  },
  
  getTaskTimer: async (id) => {
    await delay();
    return { data: { taskId: id, elapsed: '2h 30m' } };
  },
  
  // Projects
  getMyProjects: async () => {
    await delay();
    return { data: getStoredData('projects') };
  },
  
  getProject: async (id) => {
    await delay();
    const project = getStoredData('projects').find(p => p.id === parseInt(id));
    return { data: project };
  },
  
  // Daily Reports
  submitDailyReport: async (data) => {
    await delay();
    const reports = getStoredData('reports');
    const newReport = {
      id: reports.length + 1,
      ...data,
      date: new Date().toISOString().split('T')[0],
      type: 'daily'
    };
    reports.push(newReport);
    setStoredData('reports', reports);
    return { data: newReport };
  },
  
  getMyReports: async (params) => {
    await delay();
    return { data: getStoredData('reports') };
  },
  
  getReport: async (id) => {
    await delay();
    const report = getStoredData('reports').find(r => r.id === parseInt(id));
    return { data: report };
  },
  
  updateDailyReport: async (id, data) => {
    await delay();
    const reports = getStoredData('reports');
    const index = reports.findIndex(r => r.id === parseInt(id));
    if (index !== -1) {
      reports[index] = { ...reports[index], ...data };
      setStoredData('reports', reports);
      return { data: reports[index] };
    }
    throw new Error('Report not found');
  },
  
  // Meetings
  getMyMeetings: async (params) => {
    await delay();
    return { data: getStoredData('meetings') };
  },
  
  getMeeting: async (id) => {
    await delay();
    const meeting = getStoredData('meetings').find(m => m.id === parseInt(id));
    return { data: meeting };
  },
  
  // Profile
  getProfile: async () => {
    await delay();
    return { data: { id: 2, name: 'John Doe', email: 'employee@office.com', department: 'Development', position: 'Senior Developer' } };
  },
  
  updateProfile: async (data) => {
    await delay();
    return { data: { success: true, ...data } };
  },
  
  changePassword: async (data) => {
    await delay();
    return { data: { success: true, message: 'Password changed successfully' } };
  },
  
  getActivityLog: async (params) => {
    await delay();
    return { data: [
      { id: 1, activity: 'Logged in', timestamp: '2024-02-01 09:00 AM' },
      { id: 2, activity: 'Completed task', timestamp: '2024-02-01 10:30 AM' }
    ]};
  }
};

// ========================================
// CLIENT API
// ========================================
export const clientAPI = {
  getDashboard: async () => {
    await delay();
    return { data: mockDB.dashboardStats.client };
  },
  
  getMyProjects: async (params) => {
    await delay();
    return { data: getStoredData('projects').filter(p => p.clientId === 1) };
  },
  
  getProject: async (id) => {
    await delay();
    const project = getStoredData('projects').find(p => p.id === parseInt(id));
    return { data: project };
  },
  
  getProjectProgress: async (id) => {
    await delay();
    return { data: { projectId: id, progress: 65, milestones: 8, completed: 5 } };
  },
  
  getProjectTimeline: async (id) => {
    await delay();
    return { data: [
      { phase: 'Planning', status: 'Completed', date: '2024-01-01' },
      { phase: 'Development', status: 'In Progress', date: '2024-02-01' }
    ]};
  },
  
  getProjectMilestones: async (id) => {
    await delay();
    return { data: [
      { id: 1, name: 'Design Approval', status: 'Completed', date: '2024-01-15' },
      { id: 2, name: 'Beta Launch', status: 'Pending', date: '2024-03-01' }
    ]};
  },
  
  getMyMeetings: async (params) => {
    await delay();
    return { data: getStoredData('meetings') };
  },
  
  getMeeting: async (id) => {
    await delay();
    const meeting = getStoredData('meetings').find(m => m.id === parseInt(id));
    return { data: meeting };
  },
  
  scheduleMeeting: async (data) => {
    await delay();
    const meetings = getStoredData('meetings');
    const newMeeting = { id: meetings.length + 1, ...data, status: 'Scheduled' };
    meetings.push(newMeeting);
    setStoredData('meetings', meetings);
    return { data: newMeeting };
  },
  
  cancelMeeting: async (id) => {
    await delay();
    const meetings = getStoredData('meetings');
    const filtered = meetings.filter(m => m.id !== parseInt(id));
    setStoredData('meetings', filtered);
    return { data: { success: true } };
  },
  
  getProjectReports: async (projectId, params) => {
    await delay();
    return { data: getStoredData('reports') };
  },
  
  getWeeklyReport: async (projectId, week) => {
    await delay();
    return { data: { projectId, week, progress: 'On track', tasks: 15, completed: 12 } };
  },
  
  downloadReport: async (reportId) => {
    await delay();
    return { data: new Blob(['Mock report data'], { type: 'text/plain' }) };
  },
  
  submitFeedback: async (projectId, data) => {
    await delay();
    return { data: { success: true, feedbackId: Date.now(), projectId, ...data } };
  },
  
  getFeedbackHistory: async (projectId) => {
    await delay();
    return { data: [
      { id: 1, feedback: 'Great progress!', date: '2024-02-01', rating: 5 },
      { id: 2, feedback: 'Need some improvements', date: '2024-01-15', rating: 3 }
    ]};
  },
  
  approveMilestone: async (projectId, milestoneId, data) => {
    await delay();
    return { data: { success: true, projectId, milestoneId, status: 'Approved' } };
  },
  
  requestChanges: async (projectId, milestoneId, data) => {
    await delay();
    return { data: { success: true, projectId, milestoneId, changeRequest: data } };
  },
  
  rateSatisfaction: async (projectId, rating) => {
    await delay();
    return { data: { success: true, projectId, rating } };
  },
  
  getProfile: async () => {
    await delay();
    return { data: { id: 3, name: 'ABC Corp', email: 'client@office.com', company: 'ABC Corporation', phone: '+1234567890' } };
  },
  
  updateProfile: async (data) => {
    await delay();
    return { data: { success: true, ...data } };
  },
  
  updateCompanyInfo: async (data) => {
    await delay();
    return { data: { success: true, ...data } };
  }
};

// ========================================
// FILE UPLOAD API (Mock)
// ========================================
export const uploadAPI = {
  uploadFile: async (file, type) => {
    await delay(1000);
    return { data: { success: true, url: URL.createObjectURL(file), filename: file.name } };
  },
  
  uploadAvatar: async (file) => {
    await delay(1000);
    return { data: { success: true, url: URL.createObjectURL(file) } };
  },
  
  uploadDocument: async (file, projectId) => {
    await delay(1000);
    return { data: { success: true, url: URL.createObjectURL(file), projectId } };
  }
};