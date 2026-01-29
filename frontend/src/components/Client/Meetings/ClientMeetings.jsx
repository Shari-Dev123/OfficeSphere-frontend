import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import { MdOutlineSchedule } from 'react-icons/md';
import Card from '../../Shared/Card/Card';
import Modal from '../../Shared/Modal/Modal';
import Loader from '../../Shared/Loader/Loader';
import { toast } from 'react-toastify';
import './ClientMeetings.css';

function ClientMeetings() {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filterTab, setFilterTab] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    meetingType: 'online',
    location: '',
    meetingLink: '',
    projectId: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching client meetings...');
      
      const response = await clientAPI.getMyMeetings();
      
      console.log('✅ Meetings response:', response);
      console.log('✅ Meetings data:', response.data);
      
      setMeetings(response.data.meetings || response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      console.error('❌ Error response:', error.response?.data);
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
      if (!formData.title || !formData.date || !formData.time) {
        toast.error('Please fill in all required fields');
        return;
      }

      // ✅ Create meeting date/time
      const meetingDateTime = new Date(`${formData.date}T${formData.time}`);
      console.log('📅 Meeting date/time:', meetingDateTime);
      
      // ✅ Validate date is in future
      if (meetingDateTime < new Date()) {
        toast.error('Meeting date must be in the future');
        return;
      }

      // ✅ Build meeting data in format backend expects
      const meetingData = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        dateTime: meetingDateTime.toISOString(), // ISO format
        duration: parseInt(formData.duration),
        meetingType: formData.meetingType,
        status: 'scheduled' // Default status
      };

      // ✅ Add location or meeting link based on type
      if (formData.meetingType === 'online') {
        if (formData.meetingLink && formData.meetingLink.trim()) {
          meetingData.meetingLink = formData.meetingLink.trim();
        }
      } else if (formData.meetingType === 'in-person') {
        if (!formData.location || !formData.location.trim()) {
          toast.error('Location is required for in-person meetings');
          return;
        }
        meetingData.location = formData.location.trim();
      }

      // ✅ Add project if selected
      if (formData.projectId && formData.projectId.trim()) {
        meetingData.projectId = formData.projectId.trim();
      }

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
      console.error('====================================');
      console.error('❌ Error scheduling meeting');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('====================================');
      
      // ✅ Show specific error message from backend
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Failed to schedule meeting';
      
      toast.error(errorMessage);
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }

    try {
      console.log('🗑️ Cancelling meeting:', meetingId);
      
      await clientAPI.cancelMeeting(meetingId);
      
      toast.success('Meeting cancelled successfully');
      fetchMeetings();
    } catch (error) {
      console.error('❌ Error cancelling meeting:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to cancel meeting';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      meetingType: 'online',
      location: '',
      meetingLink: '',
      projectId: ''
    });
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getFilteredMeetings = () => {
    const now = new Date();
    
    switch (filterTab) {
      case 'upcoming':
        return meetings.filter(m => new Date(m.dateTime) >= now);
      case 'past':
        return meetings.filter(m => new Date(m.dateTime) < now);
      default:
        return meetings;
    }
  };

  const getMeetingStatus = (dateTime) => {
    const now = new Date();
    const meetingDate = new Date(dateTime);
    
    if (meetingDate < now) return 'completed';
    if (meetingDate.toDateString() === now.toDateString()) return 'today';
    return 'upcoming';
  };

  if (loading) {
    return <Loader />;
  }

  const filteredMeetings = getFilteredMeetings();

  return (
    <div className="client-meetings">
      {/* Header */}
      <div className="meetings-header">
        <div className="header-content">
          <h1>Meetings</h1>
          <p>Schedule and manage your project meetings</p>
        </div>
        <button 
          className="schedule-btn"
          onClick={() => setShowScheduleModal(true)}
        >
          <FiPlus />
          Schedule Meeting
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab-btn ${filterTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab-btn ${filterTab === 'past' ? 'active' : ''}`}
          onClick={() => setFilterTab('past')}
        >
          Past
        </button>
        <button
          className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          All Meetings
        </button>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-grid">
          {filteredMeetings.map((meeting) => {
            const { date, time } = formatDateTime(meeting.dateTime);
            const status = getMeetingStatus(meeting.dateTime);

            return (
              <Card key={meeting._id} className={`meeting-card ${status}`}>
                <div className="meeting-header">
                  <div className="meeting-title-section">
                    <h3>{meeting.title}</h3>
                    <span className={`status-badge ${status}`}>
                      {status === 'today' ? 'Today' : status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                  {meeting.projectName && (
                    <span className="project-tag">{meeting.projectName}</span>
                  )}
                </div>

                {meeting.description && (
                  <p className="meeting-description">{meeting.description}</p>
                )}

                <div className="meeting-details">
                  <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <span>{date}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock className="detail-icon" />
                    <span>{time} ({meeting.duration} min)</span>
                  </div>
                  <div className="detail-item">
                    {meeting.meetingType === 'online' ? (
                      <>
                        <FiVideo className="detail-icon" />
                        <span>Online Meeting</span>
                      </>
                    ) : (
                      <>
                        <FiMapPin className="detail-icon" />
                        <span>{meeting.location || 'Location TBD'}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="meeting-footer">
                  {meeting.meetingLink && status !== 'completed' && (
                    <a 
                      href={meeting.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="join-btn"
                    >
                      <FiVideo />
                      Join Meeting
                    </a>
                  )}
                  {status === 'upcoming' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelMeeting(meeting._id)}
                    >
                      <FiX />
                      Cancel
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="no-meetings">
          <MdOutlineSchedule className="no-meetings-icon" />
          <h3>No {filterTab} Meetings</h3>
          <p>
            {filterTab === 'upcoming' 
              ? 'Schedule a meeting to get started'
              : `No ${filterTab} meetings found`
            }
          </p>
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
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meeting agenda and description"
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
                min={new Date().toISOString().split('T')[0]}
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
              <option value="online">Online</option>
              <option value="in-person">In Person</option>
            </select>
          </div>

          {formData.meetingType === 'online' ? (
            <div className="form-group">
              <label>Meeting Link (Optional)</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              />
              <small className="form-hint">
                Leave empty if admin will provide the link
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter meeting location"
                required={formData.meetingType === 'in-person'}
              />
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setShowScheduleModal(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <FiPlus />
              Schedule Meeting
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientMeetings;