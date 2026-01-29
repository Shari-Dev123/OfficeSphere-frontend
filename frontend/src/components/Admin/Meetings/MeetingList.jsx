import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { FiPlus, FiCalendar, FiClock, FiUsers, FiEdit2, FiTrash2, FiVideo, FiX, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../../Shared/Modal/Modal';
import './MeetingList.css';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [participantType, setParticipantType] = useState('employees'); // 'employees', 'clients', 'both'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Team',
    date: '',
    startTime: '',
    endTime: '',
    duration: '60',
    location: 'Office',
    meetingLink: '',
    employeeParticipants: [],
    clientParticipants: [],
    project: '',
    agenda: ''
  });

  useEffect(() => {
    fetchMeetings();
    fetchEmployees();
    fetchClients();
    fetchProjects();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching meetings...');
      const response = await adminAPI.getMeetings();
      console.log('✅ Meetings response:', response.data);
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await adminAPI.getEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await adminAPI.getClients();
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await adminAPI.getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      if (!formData.title || !formData.date || !formData.startTime || !formData.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      // ✅ Validate at least one participant is selected
      const totalParticipants = formData.employeeParticipants.length + formData.clientParticipants.length;
      if (totalParticipants === 0) {
        toast.error('Please select at least one participant');
        return;
      }

      // ✅ Calculate endTime if not provided
      let endTime = formData.endTime;
      if (!endTime && formData.startTime && formData.duration) {
        const [hours, minutes] = formData.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        startDate.setMinutes(startDate.getMinutes() + parseInt(formData.duration));
        endTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      }

      // ✅ Create startTime and endTime as full DateTime
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${endTime}`);
      
      console.log('📅 Start DateTime:', startDateTime);
      console.log('📅 End DateTime:', endDateTime);
      
      // ✅ Validate date is in future
      if (startDateTime < new Date()) {
        toast.error('Meeting date must be in the future');
        return;
      }

      // ✅ Validate endTime is after startTime
      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }

      // ✅ Combine all participants (employees + clients)
      const allParticipants = [
        ...formData.employeeParticipants,
        ...formData.clientParticipants
      ].filter(p => p); // Remove empty values

      console.log('👥 Total participants:', allParticipants.length);
      console.log('👨‍💼 Employee participants:', formData.employeeParticipants.length);
      console.log('👤 Client participants:', formData.clientParticipants.length);

      // ✅ Build meeting data matching backend expectations
      const meetingData = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        type: formData.type,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: parseInt(formData.duration),
        location: formData.location,
        meetingLink: formData.meetingLink.trim() || '',
        agenda: formData.agenda.trim() || '',
        participants: allParticipants // Combined list
      };

      // ✅ Add project if selected
      if (formData.project && formData.project.trim()) {
        meetingData.project = formData.project.trim();
      }

      console.log('📤 Sending meeting data:', meetingData);
      console.log('====================================');

      const response = await adminAPI.scheduleMeeting(meetingData);
      
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
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Failed to schedule meeting';
      
      toast.error(errorMessage);
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Team',
      date: '',
      startTime: '',
      endTime: '',
      duration: '60',
      location: 'Office',
      meetingLink: '',
      employeeParticipants: [],
      clientParticipants: [],
      project: '',
      agenda: ''
    });
    setParticipantType('employees');
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      employeeParticipants: prev.employeeParticipants.includes(employeeId)
        ? prev.employeeParticipants.filter(id => id !== employeeId)
        : [...prev.employeeParticipants, employeeId]
    }));
  };

  const handleClientToggle = (clientId) => {
    setFormData(prev => ({
      ...prev,
      clientParticipants: prev.clientParticipants.includes(clientId)
        ? prev.clientParticipants.filter(id => id !== clientId)
        : [...prev.clientParticipants, clientId]
    }));
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
        <button 
          className="btn btn-primary"
          onClick={() => setShowScheduleModal(true)}
        >
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
            <span className="stat-value">{stats.total || 0}</span>
            <span className="stat-label">Total Meetings</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon today">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.today || 0}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon upcoming">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.upcoming || 0}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon past">
            <FiVideo />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.past || 0}</span>
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
          Upcoming ({stats.upcoming || 0})
        </button>
        <button
          className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past ({stats.past || 0})
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total || 0})
        </button>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-container">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting.startTime, meeting.endTime);
            return (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-header">
                  <div className="meeting-date-time">
                    <div className="date-badge">
                      <span className="day">
                        {meeting.startTime ? new Date(meeting.startTime).getDate() : '??'}
                      </span>
                      <span className="month">
                        {meeting.startTime 
                          ? new Date(meeting.startTime).toLocaleDateString('en-US', { month: 'short' })
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="time-info">
                      <h3 className="meeting-title">{meeting.title || 'Untitled Meeting'}</h3>
                      <div className="meeting-time">
                        <FiClock />
                        <span>{formatTime(meeting.startTime)}</span>
                        {meeting.endTime && (
                          <>
                            <span>-</span>
                            <span>{formatTime(meeting.endTime)}</span>
                          </>
                        )}
                        <span className="duration">
                          ({meeting.duration || 0} min)
                        </span>
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
                    <div className="detail-item">
                      <FiVideo />
                      <span>{meeting.location || 'No location'}</span>
                    </div>
                    {meeting.type && (
                      <div className="detail-item">
                        <span className="meeting-type-badge">{meeting.type}</span>
                      </div>
                    )}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="detail-item">
                        <FiUsers />
                        <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="participants">
                      <span className="participants-label">Participants:</span>
                      <div className="participants-list">
                        {meeting.participants.slice(0, 5).map((participant, index) => {
                          const participantName = participant.user?.name || participant.name || 'Unknown';
                          const participantRole = participant.user?.role || '';
                          return (
                            <div 
                              key={participant._id || index} 
                              className={`participant-avatar ${participantRole === 'client' ? 'client-avatar' : ''}`}
                              title={`${participantName} ${participantRole ? `(${participantRole})` : ''}`}
                            >
                              {participantName.charAt(0).toUpperCase()}
                            </div>
                          );
                        })}
                        {meeting.participants.length > 5 && (
                          <div className="participant-avatar more">
                            +{meeting.participants.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {meeting.organizer && (
                    <div className="organizer-info">
                      <small>Organized by: {meeting.organizer.name || meeting.organizer.email || 'Unknown'}</small>
                    </div>
                  )}
                </div>

                {meeting.meetingLink && (
                  <div className="meeting-footer">
                    <a 
                      href={meeting.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <FiVideo /> Join Meeting
                    </a>
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
        size="large"
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

          <div className="form-row">
            <div className="form-group">
              <label>Meeting Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="Team">Team</option>
                <option value="Client">Client</option>
                <option value="Project">Project</option>
                <option value="One-on-One">One-on-One</option>
                <option value="Review">Review</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              >
                <option value="Office">Office</option>
                <option value="Online">Online</option>
                <option value="Client Office">Client Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meeting description"
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
              <label>Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
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
              <label>End Time (Optional)</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="Auto-calculated"
              />
              <small className="form-hint">Leave empty to auto-calculate</small>
            </div>
          </div>

          {formData.location === 'Online' && (
            <div className="form-group">
              <label>Meeting Link</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Project (Optional)</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            >
              <option value="">No project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Agenda</label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Meeting agenda and topics"
              rows="3"
              maxLength={500}
            />
          </div>

          {/* Participants Selection with Tabs */}
          <div className="form-group">
            <label>
              Participants * 
              <span className="participant-count">
                ({formData.employeeParticipants.length + formData.clientParticipants.length} selected)
              </span>
            </label>
            
            {/* Participant Type Tabs */}
            <div className="participant-tabs">
              <button
                type="button"
                className={`participant-tab ${participantType === 'employees' ? 'active' : ''}`}
                onClick={() => setParticipantType('employees')}
              >
                <FiUsers /> Employees ({formData.employeeParticipants.length})
              </button>
              <button
                type="button"
                className={`participant-tab ${participantType === 'clients' ? 'active' : ''}`}
                onClick={() => setParticipantType('clients')}
              >
                <FiUser /> Clients ({formData.clientParticipants.length})
              </button>
              <button
                type="button"
                className={`participant-tab ${participantType === 'both' ? 'active' : ''}`}
                onClick={() => setParticipantType('both')}
              >
                Both
              </button>
            </div>

            {/* Employees List */}
            {(participantType === 'employees' || participantType === 'both') && (
              <div className="participants-selector">
                <h4 className="selector-title">
                  <FiUsers /> Employees
                </h4>
                {employees.length > 0 ? (
                  employees.map(employee => (
                    <label key={employee._id} className="participant-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.employeeParticipants.includes(employee._id)}
                        onChange={() => handleEmployeeToggle(employee._id)}
                      />
                      <div className="participant-info">
                        <span className="participant-name">{employee.name}</span>
                        <span className="participant-role">{employee.designation}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="no-participants">No employees available</p>
                )}
              </div>
            )}

            {/* Clients List */}
            {(participantType === 'clients' || participantType === 'both') && (
              <div className="participants-selector">
                <h4 className="selector-title">
                  <FiUser /> Clients
                </h4>
                {clients.length > 0 ? (
                  clients.map(client => (
                    <label key={client._id} className="participant-checkbox client-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.clientParticipants.includes(client._id)}
                        onChange={() => handleClientToggle(client._id)}
                      />
                      <div className="participant-info">
                        <span className="participant-name">{client.name}</span>
                        <span className="participant-role">
                          {client.company || 'Client'} • {client.email}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="no-participants">No clients available</p>
                )}
              </div>
            )}
          </div>

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

export default MeetingList;