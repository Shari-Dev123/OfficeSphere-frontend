// ========================================
// USER ROLES
// ========================================
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
};

// ========================================
// TASK STATUS
// ========================================
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const TASK_STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const TASK_STATUS_COLORS = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  in_review: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
};

// ========================================
// TASK PRIORITY
// ========================================
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TASK_PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TASK_PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

// ========================================
// PROJECT STATUS
// ========================================
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PROJECT_STATUS_LABELS = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PROJECT_STATUS_COLORS = {
  planning: '#6b7280',
  active: '#3b82f6',
  on_hold: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
};

// ========================================
// ATTENDANCE STATUS
// ========================================
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
};

export const ATTENDANCE_STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half Day',
  leave: 'Leave',
};

export const ATTENDANCE_STATUS_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  late: '#f59e0b',
  half_day: '#3b82f6',
  leave: '#6b7280',
};

// ========================================
// MEETING STATUS
// ========================================
export const MEETING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const MEETING_STATUS_LABELS = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ========================================
// LEAVE TYPES
// ========================================
export const LEAVE_TYPES = {
  SICK: 'sick',
  CASUAL: 'casual',
  ANNUAL: 'annual',
  UNPAID: 'unpaid',
  EMERGENCY: 'emergency',
};

export const LEAVE_TYPE_LABELS = {
  sick: 'Sick Leave',
  casual: 'Casual Leave',
  annual: 'Annual Leave',
  unpaid: 'Unpaid Leave',
  emergency: 'Emergency Leave',
};

// ========================================
// REPORT TYPES
// ========================================
export const REPORT_TYPES = {
  PERFORMANCE: 'performance',
  PRODUCTIVITY: 'productivity',
  ATTENDANCE: 'attendance',
  PROJECT: 'project',
  FINANCIAL: 'financial',
};

export const REPORT_TYPE_LABELS = {
  performance: 'Performance Report',
  productivity: 'Productivity Report',
  attendance: 'Attendance Report',
  project: 'Project Report',
  financial: 'Financial Report',
};

// ========================================
// DATE FORMATS
// ========================================
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy hh:mm a',
  API: 'yyyy-MM-dd',
  TIME: 'hh:mm a',
};

// ========================================
// PAGINATION
// ========================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};

// ========================================
// FILE UPLOAD
// ========================================
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

// ========================================
// VALIDATION RULES
// ========================================
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// ========================================
// SIDEBAR MENU ITEMS
// ========================================
export const ADMIN_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'MdDashboard',
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/admin/employees',
    icon: 'MdPeople',
  },
  {
    id: 'clients',
    label: 'Clients',
    path: '/admin/clients',
    icon: 'MdBusiness',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/admin/projects',
    icon: 'MdWork',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    path: '/admin/tasks',
    icon: 'MdTask',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/admin/attendance',
    icon: 'MdSchedule',
  },
  {
    id: 'meetings',
    label: 'Meetings',
    path: '/admin/meetings',
    icon: 'MdEvent',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/admin/reports',
    icon: 'MdAssessment',
  },
];

export const EMPLOYEE_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/employee/dashboard',
    icon: 'MdDashboard',
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    path: '/employee/tasks',
    icon: 'MdTask',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/employee/attendance',
    icon: 'MdSchedule',
  },
  {
    id: 'projects',
    label: 'My Projects',
    path: '/employee/projects',
    icon: 'MdWork',
  },
  {
    id: 'daily-report',
    label: 'Daily Report',
    path: '/employee/daily-report',
    icon: 'MdDescription',
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/employee/profile',
    icon: 'MdPerson',
  },
];

export const CLIENT_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/client/dashboard',
    icon: 'MdDashboard',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/client/projects',
    icon: 'MdWork',
  },
  {
    id: 'meetings',
    label: 'Meetings',
    path: '/client/meetings',
    icon: 'MdEvent',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/client/reports',
    icon: 'MdAssessment',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    path: '/client/feedback',
    icon: 'MdFeedback',
  },
];

// ========================================
// APP INFO
// ========================================
export const APP_INFO = {
  NAME: 'OfficeSphere',
  VERSION: '1.0.0',
  DESCRIPTION: 'Smart Company Management System',
  COPYRIGHT: `© ${new Date().getFullYear()} OfficeSphere. All rights reserved.`,
};

// ========================================
// LOCAL STORAGE KEYS
// ========================================
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
};

// ========================================
// NOTIFICATION TYPES
// ========================================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ========================================
// CHART COLORS
// ========================================
export const CHART_COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#10b981',
  ACCENT: '#f59e0b',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  INDIGO: '#6366f1',
};

// ========================================
// DEFAULT VALUES
// ========================================
export const DEFAULTS = {
  AVATAR: '/images/default-avatar.png',
  COMPANY_LOGO: '/images/default-logo.png',
  PAGINATION_LIMIT: 10,
  DEBOUNCE_DELAY: 300, // milliseconds
  AUTO_SAVE_DELAY: 2000, // milliseconds
};

// ========================================
// API ENDPOINTS (for reference)
// ========================================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    EMPLOYEES: '/admin/employees',
    CLIENTS: '/admin/clients',
    PROJECTS: '/admin/projects',
    ATTENDANCE: '/admin/attendance',
    TASKS: '/admin/tasks',
    MEETINGS: '/admin/meetings',
    REPORTS: '/admin/reports',
  },
  EMPLOYEE: {
    DASHBOARD: '/employee/dashboard',
    ATTENDANCE: '/employee/attendance',
    TASKS: '/employee/tasks',
    PROJECTS: '/employee/projects',
    REPORTS: '/employee/reports',
  },
  CLIENT: {
    DASHBOARD: '/client/dashboard',
    PROJECTS: '/client/projects',
    MEETINGS: '/client/meetings',
    REPORTS: '/client/reports',
    FEEDBACK: '/client/feedback',
  },
};

// ========================================
// ERROR MESSAGES
// ========================================
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
};

// ========================================
// SUCCESS MESSAGES
// ========================================
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SAVED: 'Saved successfully!',
  SUBMITTED: 'Submitted successfully!',
  SENT: 'Sent successfully!',
};