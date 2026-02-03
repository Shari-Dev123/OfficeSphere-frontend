// components/Shared/Navbar/Navbar.jsx - WITH SOCKET.IO INTEGRATION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaBars } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { useSocket } from '../../../context/SocketContext'; // ✅ ADDED
import { adminAPI, employeeAPI, clientAPI } from '../../../utils/api';
import { toast } from 'react-toastify'; // ✅ ADDED
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket(); // ✅ ADDED
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notifications based on user role
  useEffect(() => {
    if (user?.role) {
      console.log('🔔 Navbar mounted - User role:', user.role);
      fetchNotifications();
      
      // Auto-refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications(true); // Silent refresh
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // ✅ NEW: Socket listener for real-time notifications
  useEffect(() => {
    if (!socket || !connected || !user?.role) {
      console.log('🔔 Navbar: Socket not ready', { socket: !!socket, connected, role: user?.role });
      return;
    }

    console.log('🔔 Navbar: Setting up socket listener for', user.role);

    const handleNewNotification = (notification) => {
      console.log('🔔 Navbar: New notification received:', notification);
      
      // Add to notifications list (keep only latest 5)
      setNotifications(prev => [notification, ...prev].slice(0, 5));
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(`📬 ${notification.title}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    socket.on('new-notification', handleNewNotification);

    return () => {
      console.log('🔔 Navbar: Cleaning up socket listener');
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, connected, user?.role]);

  // ✅ Fetch notifications from API (admin, employee, or client)
  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      console.log(`🔍 Fetching notifications for role: ${user?.role}`);
      
      let response;
      
      // ✅ Fetch based on role
      if (user?.role === 'admin') {
        response = await adminAPI.getNotifications();
      } else if (user?.role === 'employee') {
        console.log('📞 Calling employeeAPI.getNotifications()...');
        response = await employeeAPI.getNotifications();
      } else if (user?.role === 'client') {
        response = await clientAPI.getNotifications();
      } else {
        console.warn('⚠️ Unknown role:', user?.role);
        return;
      }
      
      console.log('📦 Raw API Response:', response);
      console.log('📦 Response data:', response.data);
      
      // ✅ Handle different response formats
      let notificationsData;
      if (response.data.success && response.data.data) {
        notificationsData = response.data.data.notifications || response.data.data;
      } else if (response.data.notifications) {
        notificationsData = response.data.notifications;
      } else if (response.data.data) {
        notificationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        notificationsData = [];
      }
      
      const notificationsList = Array.isArray(notificationsData) ? notificationsData : [];
      
      console.log(`📬 Fetched ${notificationsList.length} notifications for ${user.role}`);
      console.log('📋 Notifications list:', notificationsList);
      
      // Get only latest 5 for navbar dropdown
      const latestNotifications = notificationsList.slice(0, 5);
      setNotifications(latestNotifications);
      
      // Count unread
      const unread = notificationsList.filter(n => !n.isRead && !n.read).length;
      setUnreadCount(unread);
      
      console.log(`✅ Set ${latestNotifications.length} notifications, ${unread} unread`);
      
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Don't show error to user, just set empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ✅ Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      console.log(`📝 Marking notification ${id} as read...`);
      
      if (user?.role === 'admin') {
        await adminAPI.markNotificationAsRead(id);
      } else if (user?.role === 'employee') {
        await employeeAPI.markNotificationAsRead(id);
      } else if (user?.role === 'client') {
        await clientAPI.markNotificationAsRead(id);
      }
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, isRead: true, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('✅ Notification marked as read');
      
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // ✅ Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      console.log('📝 Marking all notifications as read...');
      
      if (user?.role === 'admin') {
        await adminAPI.markAllNotificationsAsRead();
      } else if (user?.role === 'employee') {
        await employeeAPI.markAllNotificationsAsRead();
      } else if (user?.role === 'client') {
        await clientAPI.markAllNotificationsAsRead();
      }
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true, read: true }))
      );
      
      setUnreadCount(0);
      
      console.log('✅ All notifications marked as read');
      
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  // ✅ Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // ✅ Navigate to full notifications page
  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    if (user?.role === 'admin') {
      navigate('/admin/notifications');
    } else if (user?.role === 'employee') {
      navigate('/employee/notifications');
    } else if (user?.role === 'client') {
      navigate('/client/notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else if (user?.role === 'employee') {
      navigate('/employee/profile');
    } else if (user?.role === 'client') {
      navigate('/client/profile');
    }
    setShowUserMenu(false);
  };

  // ✅ Show notifications for admin, employee, and client
  const showNotificationBell = ['admin', 'employee', 'client'].includes(user?.role);

  console.log('🔔 Navbar render - showNotificationBell:', showNotificationBell, 'role:', user?.role);
  console.log('🔔 Socket status:', { connected, hasSocket: !!socket });

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        <div className="navbar-brand">
          <h2>OfficeSphere</h2>
        </div>
      </div>

      <div className="navbar-right">
        {/* ✅ Notifications - Show for admin, employee, and client */}
        {showNotificationBell && (
          <div className="navbar-item">
            <button 
              className="navbar-icon-btn"
              onClick={() => {
                console.log('🔔 Notification bell clicked');
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              title={`${unreadCount} unread notifications`}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="dropdown-menu notifications-menu">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      className="mark-read-btn"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="notifications-list">
                  {loading ? (
                    <div className="notifications-loading">
                      <div className="spinner-small"></div>
                      <p>Loading...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${(!notification.isRead && !notification.read) ? 'unread' : ''}`}
                        onClick={() => {
                          if (!notification.isRead && !notification.read) {
                            handleMarkAsRead(notification._id);
                          }
                        }}
                      >
                        <div className="notification-content">
                          <p className="notification-title">{notification.title}</p>
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        {(!notification.isRead && !notification.read) && (
                          <div className="notification-dot"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="notifications-empty">
                      <FaBell className="empty-icon" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="dropdown-footer">
                    <button 
                      className="view-all-btn"
                      onClick={handleViewAllNotifications}
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Menu */}
        <div className="navbar-item">
          <button 
            className="navbar-user-btn"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <FaUserCircle className="user-icon" />
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Role'}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="dropdown-menu user-menu">
              <div className="user-menu-header">
                <FaUserCircle className="user-avatar-large" />
                <div>
                  <p className="user-menu-name">{user?.name}</p>
                  <p className="user-menu-email">{user?.email}</p>
                </div>
              </div>
              <div className="user-menu-items">
                <button className="user-menu-item" onClick={handleProfile}>
                  <FaCog /> Settings
                </button>
                <button className="user-menu-item logout" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="navbar-overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;