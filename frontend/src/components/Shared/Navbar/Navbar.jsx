import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaBars } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications (replace with real data from API)
  const notifications = [
    { id: 1, message: 'New task assigned to you', time: '5 min ago', unread: true },
    { id: 2, message: 'Meeting scheduled for tomorrow', time: '1 hour ago', unread: true },
    { id: 3, message: 'Project deadline approaching', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
        {/* Notifications */}
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
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="mark-read-btn">Mark all as read</button>
              </div>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button className="view-all-btn">View all notifications</button>
              </div>
            </div>
          )}
        </div>

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