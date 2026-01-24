import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { DATE_FORMATS } from './constants';

// ========================================
// DATE & TIME HELPERS
// ========================================

/**
 * Format date to display format
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: DISPLAY)
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format time to display format
 * @param {Date|string} date - Date/time to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  return formatDate(date, DATE_FORMATS.TIME);
};

/**
 * Get relative time (Today, Yesterday, or date)
 * @param {Date|string} date - Date to check
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return 'Today';
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    console.error('Relative time error:', error);
    return '';
  }
};

/**
 * Calculate days difference
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} - Days difference
 */
export const getDaysDifference = (date1, date2) => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d1, d2);
  } catch (error) {
    console.error('Days difference error:', error);
    return 0;
  }
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
  } catch (error) {
    return false;
  }
};

// ========================================
// STRING HELPERS
// ========================================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ========================================
// NUMBER HELPERS
// ========================================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount, currency = '$') => {
  if (!amount && amount !== 0) return `${currency}0`;
  return `${currency}${formatNumber(amount.toFixed(2))}`;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} - Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimals (default: 0)
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  const regex = /^[\d\s\-\+\(\)]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with strength and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, strength: 'weak', message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, strength: 'weak', message: 'Password must be at least 6 characters' };
  }
  
  let strength = 'weak';
  let score = 0;
  
  // Check length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Check for numbers
  if (/\d/.test(password)) score++;
  
  // Check for lowercase
  if (/[a-z]/.test(password)) score++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) score++;
  
  // Check for special characters
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'medium';
  else strength = 'strong';
  
  return { 
    isValid: true, 
    strength, 
    message: `Password strength: ${strength}` 
  };
};

// ========================================
// ARRAY HELPERS
// ========================================

/**
 * Remove duplicates from array
 * @param {Array} arr - Array with duplicates
 * @returns {Array} - Array without duplicates
 */
export const removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

/**
 * Sort array of objects by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc' (default: 'asc')
 * @returns {Array} - Sorted array
 */
export const sortByKey = (arr, key, order = 'asc') => {
  return arr.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
export const groupBy = (arr, key) => {
  return arr.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// ========================================
// FILE HELPERS
// ========================================

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file is image
 * @param {string} filename - Filename
 * @returns {boolean} - True if image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
};

// ========================================
// LOCAL STORAGE HELPERS
// ========================================

/**
 * Save to local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const saveToStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

/**
 * Get from local storage
 * @param {string} key - Storage key
 * @returns {any} - Stored value or null
 */
export const getFromStorage = (key) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) return null;
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error getting from storage:', error);
    return null;
  }
};

/**
 * Remove from local storage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};

/**
 * Clear all local storage
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// ========================================
// URL HELPERS
// ========================================

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string} - Query string
 */
export const buildQueryString = (params) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return query ? `?${query}` : '';
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} - Parameters object
 */
export const parseQueryString = (queryString) => {
  if (!queryString) return {};
  
  const params = {};
  const pairs = queryString.substring(1).split('&');
  
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  
  return params;
};

// ========================================
// DEBOUNCE HELPER
// ========================================

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ========================================
// COPY TO CLIPBOARD
// ========================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// ========================================
// COLOR HELPERS
// ========================================

/**
 * Generate random color
 * @returns {string} - Random hex color
 */
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// ========================================
// DOWNLOAD HELPER
// ========================================

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};