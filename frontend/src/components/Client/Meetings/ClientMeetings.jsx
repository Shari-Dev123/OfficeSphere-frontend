// Components/Client/Meetings/ClientMeetings.jsx
// ✅ FIXED VERSION - Shows meetings where client is organizer OR participant

import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiPlus, FiCalendar, FiClock, FiVideo, FiX, FiMapPin, FiUsers } from 'react-icons/fi';
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
    location: 'Online',
    meetingLink: '',
    agenda: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('====================================');
      console.log('📥 FETCHING CLIENT MEETINGS');
      console.log('====================================');
      
      const response = await clientAPI.getMyMeetings();
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // ✅ Backend returns: { success, count, meetings }
      const meetingsData = response.data.meetings || [];
      
      console.log(`✅ Loaded ${meetingsData.length} meetings`);
      if (meetingsData.length > 0) {
        console.log('Sample meeting:', meetingsData[0]);
      }
      console.log('====================================');
      
      setMeetings(meetingsData);
    } catch (error) {
      console.error('====================================');
      console.error('❌ ERROR FETCHING MEETINGS');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('====================================');
      
      toast.error(error.response?.data?.message || 'Failed to load meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    
    try {
      console.log('====================================');
      console.log('📅 CLIENT SCHEDULE MEETING');
      console.log('====================================');
      
      // ✅ Validate required fields
      if (!formData.title?.trim()) {
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

      // ✅ Create ISO datetime strings (backend expects these)
      const dateTimeStr = `${formData.date}T${formData.time}:00`;
      const startDateTime = new Date(dateTimeStr);
      
      console.log('📅 Start DateTime:', startDateTime);
      
      // ✅ Validate date is in future
      if (startDateTime < new Date()) {
        toast.error('Meeting date must be in the future');
        return;
      }

      // ✅ Calculate end time based on duration
      const durationMinutes = parseInt(formData.duration);
      const endDateTime = new Date(startDateTime.getTime() + (durationMinutes * 60 * 1000));
      
      console.log('📅 Start (ISO):', startDateTime.toISOString());
      console.log('📅 End (ISO):', endDateTime.toISOString());
      console.log('⏱️  Duration:', durationMinutes, 'minutes');

      // ✅✅✅ CRITICAL: Match backend clientScheduleMeeting expectations exactly
      const meetingData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        type: 'Client',  // ✅ Valid enum value from Meeting schema
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: durationMinutes,
        location: formData.location,
        meetingLink: formData.meetingLink?.trim() || '',
        agenda: formData.agenda?.trim() || '',
        participants: []  // ✅ Backend adds client + admins automatically
      };

      console.log('📤 Sending meeting data:');
      console.log(JSON.stringify(meetingData, null, 2));
      console.log('====================================');

      const response = await clientAPI.scheduleMeeting(meetingData);
      
      console.log('====================================');
      console.log('✅ MEETING SCHEDULED SUCCESSFULLY');
      console.log('Response:', response.data);
      console.log('====================================');
      
      toast.success('Meeting scheduled successfully! Admins have been notified.');
      setShowScheduleModal(false);
      resetForm();
      await fetchMeetings();
      
    } catch (error) {
      console.error('====================================');
      console.error('❌ SCHEDULE MEETING ERROR');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('====================================');
      
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
      console.log('====================================');
      console.log('🗑️  CANCELLING MEETING:', id);
      console.log('====================================');
      
      await clientAPI.cancelMeeting(id);
      
      console.log('✅ Meeting cancelled successfully');
      console.log('====================================');
      
      toast.success('Meeting cancelled successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('====================================');
      console.error('❌ CANCEL MEETING ERROR');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('====================================');
      
      toast.error(error.response?.data?.message || 'Failed to cancel meeting');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      location: 'Online',
      meetingLink: '',
      agenda: ''
    });
  };

  const getFilteredMeetings = () => {
    if (!Array.isArray(meetings)) return [];
    
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
    const meetingStart = new Date(startTime);
    const meetingEnd = new Date(endTime);
    const now = new Date();
    
    if (now > meetingEnd) {
      return { text: 'Completed', class: 'completed' };
    }
    if (now >= meetingStart && now <= meetingEnd) {
      return { text: 'In Progress', class: 'in-progress' };
    }
    
    const diff = meetingStart - now;
    const hoursDiff = diff / (1000 * 60 * 60);
    
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
          All ({stats.total})
        </button>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-grid">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting.startTime, meeting.endTime);
            const canCancel = new Date(meeting.startTime) > new Date() && status.text !== 'Completed';
            
            return (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-header">
                  <div className="meeting-info">
                    <h3>{meeting.title}</h3>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                  {meeting.type && (
                    <span className="meeting-type-badge">{meeting.type}</span>
                  )}
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
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FiMapPin />
                      <span>{meeting.location || 'Not specified'}</span>
                    </div>
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="detail-item">
                        <FiUsers />
                        <span>{meeting.participants.length} participant(s)</span>
                      </div>
                    )}
                  </div>
                  
                  {meeting.agenda && (
                    <div className="meeting-agenda">
                      <strong>Agenda:</strong>
                      <p>{meeting.agenda}</p>
                    </div>
                  )}

                  {meeting.organizer && (
                    <div className="meeting-organizer">
                      <small>Organized by: <strong>{meeting.organizer.name || meeting.organizer.email}</strong></small>
                    </div>
                  )}
                </div>
                
                <div className="meeting-footer">
                  {meeting.meetingLink && status.text !== 'Completed' && (
                    <a 
                      href={meeting.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <FiVideo /> Join Meeting
                    </a>
                  )}
                  
                  {canCancel && meeting.organizer && (
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
          <p>
            {filter === 'upcoming' 
              ? 'You have no upcoming meetings scheduled'
              : filter === 'past'
              ? 'You have no past meetings'
              : 'Schedule a meeting to get started'}
          </p>
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
        size="medium"
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
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meeting description (optional)"
              rows="3"
              maxLength={500}
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
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            >
              <option value="Online">Online</option>
              <option value="Office">Office</option>
              <option value="Client Office">Client Office</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.location === 'Online' && (
            <div className="form-group">
              <label>Meeting Link (Optional)</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              />
              <small className="form-hint">Provide your own link or leave empty for admin to add later</small>
            </div>
          )}

          <div className="form-group">
            <label>Agenda (Optional)</label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Meeting agenda and topics to discuss"
              rows="3"
              maxLength={500}
            />
          </div>

          <div className="info-note">
            <strong>Note:</strong> All admins will be automatically notified and added as participants to this meeting.
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