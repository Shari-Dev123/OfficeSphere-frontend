import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication
 * Provides easy access to auth context and helper methods
 */
export const useAuth = () => {
  const context = useAuthContext();

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  // Check if user is admin
  const isAdmin = () => {
    return context.user?.role === 'admin';
  };

  // Check if user is employee
  const isEmployee = () => {
    return context.user?.role === 'employee';
  };

  // Check if user is client
  const isClient = () => {
    return context.user?.role === 'client';
  };

  // Get user's full name
  const getUserName = () => {
    return context.user?.name || 'User';
  };

  // Get user's email
  const getUserEmail = () => {
    return context.user?.email || '';
  };

  // Get user's avatar
  const getUserAvatar = () => {
    return context.user?.avatar || '/default-avatar.png';
  };

  // Get user ID
  const getUserId = () => {
    return context.user?._id || context.user?.id;
  };

  // Check if user can access admin routes
  const canAccessAdmin = () => {
    return context.user?.role === 'admin';
  };

  // Check if user can access employee routes
  const canAccessEmployee = () => {
    return context.user?.role === 'employee';
  };

  // Check if user can access client routes
  const canAccessClient = () => {
    return context.user?.role === 'client';
  };

  return {
    // From context
    user: context.user,
    loading: context.loading,
    isAuthenticated: context.isAuthenticated,
    login: context.login,
    logout: context.logout,
    updateUser: context.updateUser,
    getUserRole: context.getUserRole,
    hasRole: context.hasRole,
    
    // Helper methods
    isAdmin,
    isEmployee,
    isClient,
    getUserName,
    getUserEmail,
    getUserAvatar,
    getUserId,
    canAccessAdmin,
    canAccessEmployee,
    canAccessClient,
  };
};

export default useAuth;