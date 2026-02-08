// Components/Client/Meetings/ClientMeetings.jsx
// ✅ FINAL FIXED VERSION - Correct meeting type enum value

import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiPlus, FiCalendar, FiClock, FiVideo, FiX, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../../Shared/Modal/Modal';
import './ClientMeetings.css';

function ClientMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    meetingType: 'Online',  // For UI display only
    meetingLink: '',
    agenda: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching client meetings...');
      const response = await clientAPI.getMyMeetings();
      console.log('✅ Meetings response:', response.data);
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    
    try {
      console.log('====================================');
      console.log('📅 Scheduling meeting...');
      console.log('====================================');
      console.log('Form data:', formData);

      // ✅ Validate required fields
      if (!formData.title || !formData.title.trim()) {
        toast.error('Please enter meeting title');
        return;
      }

      if (!formData.date) {
        toast.error('Please select meeting date');
        return;
      }

      if (!formData.time) {
        toast.error('Please select meeting time');
        return;
      }

      // ✅ Create proper DateTime objects
      const [year, month, day] = formData.date.split('-');
      const [hours, minutes] = formData.time.split(':');
      
      const startDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        0,
        0
      );

      console.log('📅 Meeting date/time:', startDateTime);

      // ✅ Validate date is in future
      if (startDateTime < new Date()) {
        toast.error('Meeting date must be in the future');
        return;
      }

      // ✅ Calculate end time
      const durationMinutes = parseInt(formData.duration);
      const endDateTime = new Date(startDateTime.getTime() + (durationMinutes * 60 * 1000));

      console.log('📅 Start:', startDateTime.toISOString());
      console.log('📅 End:', endDateTime.toISOString());
      console.log('⏱️ Duration:', durationMinutes, 'minutes');

      // ✅✅✅ CRITICAL FIX: Use valid enum value for type
      const meetingData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        type: 'Client',  // ✅ Valid enum value from schema
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: durationMinutes,
        location: formData.meetingType === 'Online' ? 'Online' : 'Client Office',
        meetingLink: formData.meetingLink?.trim() || '',
        participants: [],  // Empty array is fine - backend adds client automatically
        agenda: formData.agenda?.trim() || ''
      };

      console.log('📤 Sending meeting data:', meetingData);
      console.log('====================================');

      const response = await clientAPI.scheduleMeeting(meetingData);
      
      console.log('====================================');
      console.log('✅ Meeting scheduled successfully');
      console.log('Response:', response.data);
      console.log('====================================');

      toast.success('Meeting scheduled successfully!');
      setShowScheduleModal(false);
      resetForm();
      fetchMeetings();
      
    } catch (error) {
      console.log('====================================');
      console.log('❌ Error scheduling meeting');
      console.log('====================================');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.log('====================================');
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Failed to schedule meeting';
      
      toast.error(errorMessage);
    }
  };

  const handleCancelMeeting = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel "${title}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Cancelling meeting:', id);
      await clientAPI.cancelMeeting(id);
      toast.success('Meeting cancelled successfully');
      fetchMeetings();
    } catch (error) {
      console.error('❌ Error cancelling meeting:', error);
      toast.error('Failed to cancel meeting');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      meetingType: 'Online',
      meetingLink: '',
      agenda: ''
    });
  };

  const getFilteredMeetings = () => {
    const now = new Date();
    
    if (filter === 'upcoming') {
      return meetings.filter(m => new Date(m.startTime) >= now);
    } else if (filter === 'past') {
      return meetings.filter(m => new Date(m.startTime) < now);
    }
    return meetings;
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMeetingStatus = (startTime, endTime) => {
    const meetingDate = new Date(startTime);
    const meetingEnd = new Date(endTime);
    const now = new Date();
    const diff = meetingDate - now;
    const hoursDiff = diff / (1000 * 60 * 60);

    if (now > meetingEnd) return { text: 'Completed', class: 'completed' };
    if (now >= meetingDate && now <= meetingEnd) return { text: 'In Progress', class: 'in-progress' };
    if (hoursDiff < 1) return { text: 'Starting Soon', class: 'starting-soon' };
    if (hoursDiff < 24) return { text: 'Today', class: 'today' };
    return { text: 'Upcoming', class: 'upcoming' };
  };

  const filteredMeetings = getFilteredMeetings();
  const stats = {
    total: meetings.length,
    upcoming: meetings.filter(m => new Date(m.startTime) >= new Date()).length,
    past: meetings.filter(m => new Date(m.startTime) < new Date()).length,
    today: meetings.filter(m => {
      const meetingDate = new Date(m.startTime);
      const today = new Date();
      return meetingDate.toDateString() === today.toDateString();
    }).length
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="client-meetings">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-meetings">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Meetings</h1>
          <p>Schedule and manage your project meetings</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowScheduleModal(true)}
        >
          <FiPlus /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="meeting-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon upcoming">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>

        <div className="stat-card">
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
          All Meetings ({stats.total})
        </button>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-grid">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting.startTime, meeting.endTime);
            const canCancel = new Date(meeting.startTime) > new Date();
            
            return (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-header">
                  <div className="meeting-info">
                    <h3>{meeting.title}</h3>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                </div>

                <div className="meeting-body">
                  {meeting.description && (
                    <p className="meeting-description">{meeting.description}</p>
                  )}

                  <div className="meeting-details">
                    <div className="detail-item">
                      <FiCalendar />
                      <span>{formatDate(meeting.startTime)}</span>
                    </div>

                    <div className="detail-item">
                      <FiClock />
                      <span>
                        {formatTime(meeting.startTime)}
                        {meeting.endTime && ` - ${formatTime(meeting.endTime)}`}
                      </span>
                    </div>

                    <div className="detail-item">
                      <FiMapPin />
                      <span>{meeting.location}</span>
                    </div>
                  </div>

                  {meeting.agenda && (
                    <div className="meeting-agenda">
                      <strong>Agenda:</strong>
                      <p>{meeting.agenda}</p>
                    </div>
                  )}
                </div>

                <div className="meeting-footer">
                  {meeting.meetingLink && (
                    <a 
                      href={meeting.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <FiVideo /> Join Meeting
                    </a>
                  )}
                  
                  {canCancel && status.text !== 'Completed' && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancelMeeting(meeting._id, meeting.title)}
                    >
                      <FiX /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FiCalendar className="empty-icon" />
          <h3>No {filter !== 'all' ? filter : ''} Meetings</h3>
          <p>Schedule a meeting to get started</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowScheduleModal(true)}
          >
            <FiPlus /> Schedule Meeting
          </button>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          resetForm();
        }}
        title="Schedule New Meeting"
      >
        <form onSubmit={handleScheduleMeeting} className="schedule-form">
          <div className="form-group">
            <label>Meeting Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meeting description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={getMinDate()}
                required
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label>Meeting Type *</label>
            <select
              value={formData.meetingType}
              onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
            >
              <option value="Online">Online</option>
              <option value="In Person">In Person</option>
            </select>
          </div>

          {formData.meetingType === 'Online' && (
            <div className="form-group">
              <label>Meeting Link (Optional)</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              />
              <small className="form-hint">Leave empty if admin will provide the link</small>
            </div>
          )}

          <div className="form-group">
            <label>Agenda (Optional)</label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Meeting agenda and topics to discuss"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setShowScheduleModal(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FiPlus /> Schedule Meeting
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientMeetings;