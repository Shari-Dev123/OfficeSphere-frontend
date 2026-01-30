import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaBars } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { adminAPI } from '../../../utils/api';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notifications based on user role
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminNotifications();
      
      // Auto-refresh notifications every 30 seconds for admin
      const interval = setInterval(() => {
        fetchAdminNotifications(true); // Silent refresh
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // ✅ Fetch admin notifications from API
  const fetchAdminNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await adminAPI.getNotifications();
      
      const notificationsData = response.data.data || response.data.notifications || response.data || [];
      const notificationsList = Array.isArray(notificationsData) ? notificationsData : [];
      
      // Get only latest 5 for navbar dropdown
      const latestNotifications = notificationsList.slice(0, 5);
      setNotifications(latestNotifications);
      
      // Count unread
      const unread = notificationsList.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ✅ Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await adminAPI.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all as read:', error);
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
        {/* ✅ Notifications - Only show for admin */}
        {user?.role === 'admin' && (
          <div className="navbar-item">
            <button 
              className="navbar-icon-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
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
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          if (!notification.isRead) {
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
                        {!notification.isRead && (
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