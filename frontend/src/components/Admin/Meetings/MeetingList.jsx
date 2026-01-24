import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { FiPlus, FiCalendar, FiClock, FiUsers, FiEdit2, FiTrash2, FiVideo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './MeetingList.css';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMeetings();
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteMeeting(id);
      toast.success('Meeting deleted successfully');
      fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
    }
  };

  const getFilteredMeetings = () => {
    const now = new Date();
    
    if (filter === 'upcoming') {
      return meetings.filter(m => new Date(m.date) >= now);
    } else if (filter === 'past') {
      return meetings.filter(m => new Date(m.date) < now);
    }
    return meetings;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMeetingStatus = (date) => {
    const meetingDate = new Date(date);
    const now = new Date();
    const diff = meetingDate - now;
    const hoursDiff = diff / (1000 * 60 * 60);

    if (diff < 0) return { text: 'Completed', class: 'completed' };
    if (hoursDiff < 1) return { text: 'Starting Soon', class: 'starting-soon' };
    if (hoursDiff < 24) return { text: 'Today', class: 'today' };
    return { text: 'Upcoming', class: 'upcoming' };
  };

  const filteredMeetings = getFilteredMeetings();

  const stats = {
    total: meetings.length,
    upcoming: meetings.filter(m => new Date(m.date) >= new Date()).length,
    past: meetings.filter(m => new Date(m.date) < new Date()).length,
    today: meetings.filter(m => {
      const meetingDate = new Date(m.date);
      const today = new Date();
      return meetingDate.toDateString() === today.toDateString();
    }).length
  };

  if (loading) {
    return (
      <div className="meeting-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-list">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Meetings</h1>
          <p>Schedule and manage team meetings</p>
        </div>
        <button className="btn btn-primary">
          <FiPlus /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="meeting-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Meetings</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon today">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon upcoming">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon past">
            <FiVideo />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.past}</span>
            <span className="stat-label">Past</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({stats.upcoming})
        </button>
        <button
          className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past ({stats.past})
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-container">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting.date);
            return (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-header">
                  <div className="meeting-date-time">
                    <div className="date-badge">
                      <span className="day">{new Date(meeting.date).getDate()}</span>
                      <span className="month">
                        {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="time-info">
                      <h3 className="meeting-title">{meeting.title}</h3>
                      <div className="meeting-time">
                        <FiClock />
                        <span>{formatTime(meeting.startTime)}</span>
                        {meeting.endTime && (
                          <>
                            <span>-</span>
                            <span>{formatTime(meeting.endTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="meeting-actions">
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                    <button className="action-btn edit-btn" title="Edit">
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(meeting._id, meeting.title)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="meeting-body">
                  {meeting.description && (
                    <p className="meeting-description">{meeting.description}</p>
                  )}

                  <div className="meeting-details">
                    {meeting.location && (
                      <div className="detail-item">
                        <FiVideo />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="detail-item">
                        <FiUsers />
                        <span>{meeting.participants.length} participants</span>
                      </div>
                    )}
                  </div>

                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="participants">
                      <span className="participants-label">Participants:</span>
                      <div className="participants-list">
                        {meeting.participants.slice(0, 5).map((participant, index) => (
                          <div key={index} className="participant-avatar" title={participant.name}>
                            {participant.name?.charAt(0) || 'P'}
                          </div>
                        ))}
                        {meeting.participants.length > 5 && (
                          <div className="participant-avatar more">
                            +{meeting.participants.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {meeting.meetingLink && (
                  <div className="meeting-footer">
                    <button className="btn btn-sm btn-primary">
                      <FiVideo /> Join Meeting
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FiCalendar className="empty-icon" />
          <h3>No Meetings Found</h3>
          <p>
            {filter === 'upcoming'
              ? 'No upcoming meetings scheduled'
              : filter === 'past'
              ? 'No past meetings'
              : 'Start by scheduling your first meeting'}
          </p>
          <button className="btn btn-primary">
            <FiPlus /> Schedule Meeting
          </button>
        </div>
      )}
    </div>
  );
}

export default MeetingList;