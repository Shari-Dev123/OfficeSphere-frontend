import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

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

  // ✅ LOGIN FUNCTION - FIXED
  const login = async (email, password, role) => {
    try {
      console.log('🔐 Login attempt:', { email, role });
      
      // Call backend API
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      });

      console.log('✅ Login response:', response.data);

      // Check if login was successful
      if (response.data && response.data.success) {
        const { user: userData, token } = response.data;

        // ⚠️ CRITICAL: Store data BEFORE updating state
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('💾 Saved to localStorage:', {
          token: token.substring(0, 20) + '...',
          user: userData.email
        });
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(`Welcome back, ${userData.name}!`);
        
        // Return user data with role for navigation
        return { 
          success: true, 
          user: {
            ...userData,
            role: userData.role // Ensure role is included
          }
        };
      } else {
        toast.error(response.data?.message || 'Login failed');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle error response
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ REGISTER FUNCTION - FIXED
  const register = async (userData) => {
    try {
      console.log('📝 Register attempt:', userData);
      
      // Call backend API
      const response = await api.post('/auth/register', userData);

      console.log('✅ Register response:', response.data);

      if (response.data.success) {
        const { user: newUser, token } = response.data;

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Update state
        setUser(newUser);
        setIsAuthenticated(true);
        
        toast.success(`Welcome, ${newUser.name}!`);
        return { success: true, user: newUser };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ LOGOUT FUNCTION
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