import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { 
  FiBell, 
  FiUser, 
  FiBriefcase, 
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiTrash2,
  FiFilter,
  FiRefreshCw,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ClientNotifications.css';

function ClientNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await clientAPI.getNotifications();
      
      console.log('📬 Client Notifications response:', response.data);
      
      const notificationsData = response.data.data || response.data.notifications || response.data || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      
      if (!silent) {
        toast.success('Notifications loaded');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (!silent) {
        toast.error('Failed to load notifications');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'project': <FiBriefcase className="notification-icon project" />,
      'milestone': <FiCheckCircle className="notification-icon milestone" />,
      'meeting': <FiCalendar className="notification-icon meeting" />,
      'report': <FiFileText className="notification-icon report" />,
      'update': <FiBell className="notification-icon update" />,
      'alert': <FiAlertCircle className="notification-icon alert" />
    };
    return icons[type] || <FiBell className="notification-icon default" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'project': 'purple',
      'milestone': 'green',
      'meeting': 'orange',
      'report': 'gray',
      'update': 'blue',
      'alert': 'red'
    };
    return colors[type] || 'blue';
  };

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
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleMarkAsRead = async (id) => {
    try {
      await clientAPI.markNotificationAsRead(id);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await clientAPI.markNotificationAsUnread(id);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, isRead: false }
            : notification
        )
      );
      
      toast.success('Notification marked as unread');
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      toast.error('Failed to mark as unread');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await clientAPI.markAllNotificationsAsRead();
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await clientAPI.deleteNotification(id);
      
      setNotifications(prev =>
        prev.filter(notification => notification._id !== id)
      );
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };

  const filteredNotifications = getFilteredNotifications();

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    project: notifications.filter(n => n.type === 'project').length,
    milestone: notifications.filter(n => n.type === 'milestone').length,
    meeting: notifications.filter(n => n.type === 'meeting').length,
    report: notifications.filter(n => n.type === 'report').length,
  };

  if (loading) {
    return (
      <div className="client-notifications">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-notifications">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><FiBell /> Notifications</h1>
          <p>Stay updated with your projects and meetings</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => fetchNotifications()}
          >
            <FiRefreshCw /> Refresh
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
          </button>
          {stats.unread > 0 && (
            <button 
              className="btn btn-primary"
              onClick={handleMarkAllAsRead}
            >
              <FiCheck /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="notification-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <FiBell />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon unread">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.unread}</span>
            <span className="stat-label">Unread</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon project">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.project}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon milestone">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.milestone}</span>
            <span className="stat-label">Milestones</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon meeting">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.meeting}</span>
            <span className="stat-label">Meetings</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon report">
            <FiFileText />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.report}</span>
            <span className="stat-label">Reports</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({stats.unread})
          </button>
          <button
            className={`filter-btn ${filter === 'project' ? 'active' : ''}`}
            onClick={() => setFilter('project')}
          >
            <FiBriefcase /> Projects ({stats.project})
          </button>
          <button
            className={`filter-btn ${filter === 'milestone' ? 'active' : ''}`}
            onClick={() => setFilter('milestone')}
          >
            <FiCheckCircle /> Milestones ({stats.milestone})
          </button>
          <button
            className={`filter-btn ${filter === 'meeting' ? 'active' : ''}`}
            onClick={() => setFilter('meeting')}
          >
            <FiCalendar /> Meetings ({stats.meeting})
          </button>
          <button
            className={`filter-btn ${filter === 'report' ? 'active' : ''}`}
            onClick={() => setFilter('report')}
          >
            <FiFileText /> Reports ({stats.report})
          </button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="notifications-container">
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getNotificationColor(notification.type)}`}
              >
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.metadata && (
                    <div className="notification-metadata">
                      {notification.metadata.projectName && (
                        <span className="metadata-tag">
                          <FiBriefcase /> {notification.metadata.projectName}
                        </span>
                      )}
                      {notification.metadata.milestoneName && (
                        <span className="metadata-tag">
                          <FiCheckCircle /> {notification.metadata.milestoneName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.isRead ? (
                    <button
                      className="action-btn mark-read"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  ) : (
                    <button
                      className="action-btn mark-unread"
                      onClick={() => handleMarkAsUnread(notification._id)}
                      title="Mark as unread"
                    >
                      <FiX />
                    </button>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteNotification(notification._id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {!notification.isRead && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <FiBell className="empty-icon" />
          <h3>No Notifications</h3>
          <p>
            {filter !== 'all'
              ? `No ${filter} notifications found`
              : 'You\'re all caught up! No notifications to display.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ClientNotifications;