import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api'; // Import your mock API

// Create Auth Context
export const AuthContext = createContext();

// Custom hook to use Auth Context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const useAuth = useAuthContext;

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  // Login function - Updated to match Login.js usage
  const login = async (email, password, role) => {
    try {
      // Call the mock API
      const response = await authAPI.login({ email, password, role });
      const { user: userData, token } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
      return { success: false, error: error.message };
    }
  };

  // Register function (optional)
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success(`Welcome, ${newUser.name}!`);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('Logged out successfully');
  };

  // Update user data
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    getUserRole,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;