// components/Admin/Meetings/MeetingList.jsx
// ✅ FIXED VERSION - Shows ALL meetings (admin can see everything)

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { FiPlus, FiCalendar, FiClock, FiUsers, FiEdit2, FiTrash2, FiVideo, FiX, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../../Shared/Modal/Modal';
import './MeetingList.css';
import { socket } from '../../../utils/socket';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [participantType, setParticipantType] = useState('employees');
  
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

    // ✅ Socket.IO Real-time listeners
    socket.on('meeting-created', (data) => {
      console.log('🔔 New meeting created via socket:', data);
      toast.info(`New meeting scheduled: ${data.meeting?.title || 'New Meeting'}`);
      fetchMeetings();
    });

    socket.on('meeting-updated', (data) => {
      console.log('🔔 Meeting updated via socket:', data);
      toast.info(`Meeting updated: ${data.meeting?.title || 'Meeting'}`);
      fetchMeetings();
    });

    socket.on('meeting-deleted', (data) => {
      console.log('🔔 Meeting deleted via socket:', data);
      toast.info(`Meeting deleted: ${data.meetingTitle || 'Meeting'}`);
      fetchMeetings();
    });

    return () => {
      socket.off('meeting-created');
      socket.off('meeting-updated');
      socket.off('meeting-deleted');
    };
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('====================================');
      console.log('📥 FETCHING ADMIN MEETINGS');
      console.log('====================================');
      
      const response = await adminAPI.getMeetings();
      const meetingsData = response.data.meetings || [];
      
      console.log(`✅ Loaded ${meetingsData.length} meetings`);
      if (meetingsData.length > 0) {
        console.log('Sample meeting:', meetingsData[0]);
      }
      console.log('====================================');
      
      setMeetings(meetingsData);
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
      const employeesData = response.data.employees || [];
      
      const validEmployees = employeesData.filter(emp => {
        if (!emp.userId) {
          console.warn(`⚠️ Employee "${emp.name}" has no userId - skipping`);
          return false;
        }
        return true;
      });
      
      setEmployees(validEmployees);
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await adminAPI.getClients();
      const clientsData = response.data.clients || [];
      
      const validClients = clientsData.filter(client => {
        if (!client.userId) {
          console.warn(`⚠️ Client "${client.name}" has no userId - skipping`);
          return false;
        }
        return true;
      });
      
      setClients(validClients);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await adminAPI.getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.date || !formData.startTime || !formData.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const totalParticipants = formData.employeeParticipants.length + formData.clientParticipants.length;
      if (totalParticipants === 0) {
        toast.error('Please select at least one participant');
        return;
      }

      let endTime = formData.endTime;
      if (!endTime && formData.startTime && formData.duration) {
        const [hours, minutes] = formData.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        startDate.setMinutes(startDate.getMinutes() + parseInt(formData.duration));
        endTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      }

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${endTime}`);
      
      if (startDateTime < new Date()) {
        toast.error('Meeting date must be in the future');
        return;
      }

      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }

      const allParticipants = [
        ...formData.employeeParticipants,
        ...formData.clientParticipants
      ].filter(p => p);

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
        participants: allParticipants
      };

      if (formData.project && formData.project.trim()) {
        meetingData.project = formData.project.trim();
      }

      await adminAPI.scheduleMeeting(meetingData);
      
      toast.success('Meeting scheduled successfully!');
      setShowScheduleModal(false);
      resetForm();
      fetchMeetings();
      
    } catch (error) {
      console.error('❌ SCHEDULE MEETING ERROR:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to schedule meeting';
      toast.error(errorMessage);
    }
  };

  const handleEditMeeting = (meeting) => {
    console.log('✏️ Editing meeting:', meeting);
    
    const employeeIds = meeting.participants
      ?.filter(p => p.user?.role === 'employee')
      .map(p => p.user._id) || [];
    
    const clientIds = meeting.participants
      ?.filter(p => p.user?.role === 'client')
      .map(p => p.user._id) || [];

    const startDate = new Date(meeting.startTime);
    const date = startDate.toISOString().split('T')[0];
    const startTime = startDate.toTimeString().slice(0, 5);
    
    const endDate = meeting.endTime ? new Date(meeting.endTime) : null;
    const endTime = endDate ? endDate.toTimeString().slice(0, 5) : '';

    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title || '',
      description: meeting.description || '',
      type: meeting.type || 'Team',
      date: date,
      startTime: startTime,
      endTime: endTime,
      duration: meeting.duration?.toString() || '60',
      location: meeting.location || 'Office',
      meetingLink: meeting.meetingLink || '',
      employeeParticipants: employeeIds,
      clientParticipants: clientIds,
      project: meeting.project?._id || '',
      agenda: meeting.agenda || ''
    });
    
    setShowEditModal(true);
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.date || !formData.startTime || !formData.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const totalParticipants = formData.employeeParticipants.length + formData.clientParticipants.length;
      if (totalParticipants === 0) {
        toast.error('Please select at least one participant');
        return;
      }

      let endTime = formData.endTime;
      if (!endTime && formData.startTime && formData.duration) {
        const [hours, minutes] = formData.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        startDate.setMinutes(startDate.getMinutes() + parseInt(formData.duration));
        endTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      }

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${endTime}`);

      const allParticipants = [
        ...formData.employeeParticipants,
        ...formData.clientParticipants
      ].filter(p => p);

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
        participants: allParticipants
      };

      if (formData.project && formData.project.trim()) {
        meetingData.project = formData.project.trim();
      }

      await adminAPI.updateMeeting(selectedMeeting._id, meetingData);
      
      toast.success('Meeting updated successfully!');
      setShowEditModal(false);
      setSelectedMeeting(null);
      resetForm();
      fetchMeetings();
      
    } catch (error) {
      console.error('❌ UPDATE MEETING ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to update meeting');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteMeeting(id);
      toast.success(response.data.message || 'Meeting deleted successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('❌ DELETE ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
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

  const handleEmployeeToggle = (employee) => {
    const userId = employee.userId;
    
    setFormData(prev => ({
      ...prev,
      employeeParticipants: prev.employeeParticipants.includes(userId)
        ? prev.employeeParticipants.filter(id => id !== userId)
        : [...prev.employeeParticipants, userId]
    }));
  };

  const handleClientToggle = (client) => {
    const userId = client.userId;
    
    setFormData(prev => ({
      ...prev,
      clientParticipants: prev.clientParticipants.includes(userId)
        ? prev.clientParticipants.filter(id => id !== userId)
        : [...prev.clientParticipants, userId]
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

      <div className="meeting-stats">
        <div className="admin-stat-item">
          <div className="admin-stat-icon total"><FiCalendar /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-label">Total Meetings</span>
          </div>
        </div>
        <div className="admin-stat-item">
          <div className="admin-stat-icon today"><FiClock /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats.today}</span>
            <span className="admin-stat-label">Today</span>
          </div>
        </div>
        <div className="admin-stat-item">
          <div className="admin-stat-icon upcoming"><FiCalendar /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats.upcoming}</span>
            <span className="admin-stat-label">Upcoming</span>
          </div>
        </div>
        <div className="admin-stat-item">
          <div className="admin-stat-icon past"><FiVideo /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats.past}</span>
            <span className="admin-stat-label">Past</span>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
          Upcoming ({stats.upcoming || 0})
        </button>
        <button className={`filter-tab ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>
          Past ({stats.past || 0})
        </button>
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({stats.total || 0})
        </button>
      </div>

      {filteredMeetings.length > 0 ? (
        <div className="meetings-container">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting.startTime, meeting.endTime);
            const isMissingLink = meeting.location === 'Online' && !meeting.meetingLink;
            
            return (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-header">
                  <div className="meeting-date-time">
                    <div className="date-badge">
                      <span className="day">{meeting.startTime ? new Date(meeting.startTime).getDate() : '??'}</span>
                      <span className="month">{meeting.startTime ? new Date(meeting.startTime).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}</span>
                    </div>
                    <div className="time-info">
                      <h3 className="meeting-title">{meeting.title || 'Untitled Meeting'}</h3>
                      <div className="meeting-time">
                        <FiClock />
                        <span>{formatTime(meeting.startTime)}</span>
                        {meeting.endTime && (<><span>-</span><span>{formatTime(meeting.endTime)}</span></>)}
                        <span className="duration">({meeting.duration || 0} min)</span>
                      </div>
                    </div>
                  </div>
                  <div className="meeting-actions">
                    <span className={`status-badge ${status.class}`}>{status.text}</span>
                    {isMissingLink && (
                      <span className="status-badge warning" title="Meeting link missing">
                        ⚠️ No Link
                      </span>
                    )}
                    <button className="action-btn edit-btn" onClick={() => handleEditMeeting(meeting)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(meeting._id, meeting.title)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="meeting-body">
                  {meeting.description && <p className="meeting-description">{meeting.description}</p>}
                  <div className="meeting-details">
                    <div className="detail-item"><FiVideo /><span>{meeting.location || 'No location'}</span></div>
                    {meeting.type && <div className="detail-item"><span className="meeting-type-badge">{meeting.type}</span></div>}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="detail-item"><FiUsers /><span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span></div>
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
                            <div key={participant._id || index} className={`participant-avatar ${participantRole === 'client' ? 'client-avatar' : ''}`} title={`${participantName} ${participantRole ? `(${participantRole})` : ''}`}>
                              {participantName.charAt(0).toUpperCase()}
                            </div>
                          );
                        })}
                        {meeting.participants.length > 5 && <div className="participant-avatar more">+{meeting.participants.length - 5}</div>}
                      </div>
                    </div>
                  )}
                  {meeting.organizer && (
                    <div className="organizer-info"><small>Organized by: {meeting.organizer.name || meeting.organizer.email || 'Unknown'}</small></div>
                  )}
                </div>
                <div className="meeting-footer">
                  {meeting.meetingLink ? (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      <FiVideo /> Join Meeting
                    </a>
                  ) : meeting.location === 'Online' ? (
                    <button className="btn btn-sm btn-warning" onClick={() => handleEditMeeting(meeting)}>
                      <FiVideo /> Add Meeting Link
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FiCalendar className="empty-icon" />
          <h3>No Meetings Found</h3>
          <p>{filter === 'upcoming' ? 'No upcoming meetings scheduled' : filter === 'past' ? 'No past meetings' : 'Start by scheduling your first meeting'}</p>
          <button className="btn btn-primary" onClick={() => setShowScheduleModal(true)}><FiPlus /> Schedule Meeting</button>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      <Modal isOpen={showScheduleModal} onClose={() => { setShowScheduleModal(false); resetForm(); }} title="Schedule New Meeting" size="large">
        <form onSubmit={handleScheduleMeeting} className="schedule-form">
          <div className="form-group">
            <label>Meeting Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter meeting title" required maxLength={100} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Meeting Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
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
              <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required>
                <option value="Office">Office</option>
                <option value="Online">Online</option>
                <option value="Client Office">Client Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Meeting description" rows="3" maxLength={500} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label>Start Time *</label>
              <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
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
              <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} placeholder="Auto-calculated" />
              <small className="form-hint">Leave empty to auto-calculate</small>
            </div>
          </div>
          {formData.location === 'Online' && (
            <div className="form-group">
              <label>Meeting Link</label>
              <input type="url" value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://zoom.us/j/... or https://meet.google.com/..." />
            </div>
          )}
          <div className="form-group">
            <label>Project (Optional)</label>
            <select value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
              <option value="">No project</option>
              {projects.map(project => (<option key={project._id} value={project._id}>{project.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Agenda</label>
            <textarea value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} placeholder="Meeting agenda and topics" rows="3" maxLength={500} />
          </div>

          <div className="form-group">
            <label>
              Participants * 
              <span className="participant-count">({formData.employeeParticipants.length + formData.clientParticipants.length} selected)</span>
            </label>
            
            <div className="participant-tabs">
              <button type="button" className={`participant-tab ${participantType === 'employees' ? 'active' : ''}`} onClick={() => setParticipantType('employees')}>
                <FiUsers /> Employees ({formData.employeeParticipants.length})
              </button>
              <button type="button" className={`participant-tab ${participantType === 'clients' ? 'active' : ''}`} onClick={() => setParticipantType('clients')}>
                <FiUser /> Clients ({formData.clientParticipants.length})
              </button>
              <button type="button" className={`participant-tab ${participantType === 'both' ? 'active' : ''}`} onClick={() => setParticipantType('both')}>
                Both
              </button>
            </div>

            {(participantType === 'employees' || participantType === 'both') && (
              <div className="participants-selector">
                <h4 className="selector-title"><FiUsers /> Employees</h4>
                {employees.length > 0 ? (
                  employees.map(employee => (
                    <label key={employee._id} className="participant-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.employeeParticipants.includes(employee.userId)}
                        onChange={() => handleEmployeeToggle(employee)}
                      />
                      <div className="participant-info">
                        <span className="participant-name">{employee.name}</span>
                        <span className="participant-role">{employee.designation || employee.position} • {employee.email}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="no-participants">No employees available with valid user accounts</p>
                )}
              </div>
            )}

            {(participantType === 'clients' || participantType === 'both') && (
              <div className="participants-selector">
                <h4 className="selector-title"><FiUser /> Clients</h4>
                {clients.length > 0 ? (
                  clients.map(client => (
                    <label key={client._id} className="participant-checkbox client-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.clientParticipants.includes(client.userId)}
                        onChange={() => handleClientToggle(client)}
                      />
                      <div className="participant-info">
                        <span className="participant-name">{client.name}</span>
                        <span className="participant-role">{client.company || client.companyName || 'Client'} • {client.email}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="no-participants">No clients available with valid user accounts</p>
                )}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => { setShowScheduleModal(false); resetForm(); }}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <FiPlus /> Schedule Meeting
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedMeeting(null); resetForm(); }} title="Edit Meeting" size="large">
        <form onSubmit={handleUpdateMeeting} className="schedule-form">
          <div className="form-group">
            <label>Meeting Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter meeting title" required maxLength={100} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Meeting Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
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
              <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required>
                <option value="Office">Office</option>
                <option value="Online">Online</option>
                <option value="Client Office">Client Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Meeting description" rows="3" maxLength={500} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label>Start Time *</label>
              <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
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
              <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} placeholder="Auto-calculated" />
              <small className="form-hint">Leave empty to auto-calculate</small>
            </div>
          </div>
          {formData.location === 'Online' && (
            <div className="form-group">
              <label>
                Meeting Link 
                {!formData.meetingLink && <span className="text-danger"> * Required for online meetings</span>}
              </label>
              <input 
                type="url" 
                value={formData.meetingLink} 
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} 
                placeholder="https://zoom.us/j/... or https://meet.google.com/..." 
                className={!formData.meetingLink ? 'input-warning' : ''}
              />
            </div>
          )}
          <div className="form-group">
            <label>Project (Optional)</label>
            <select value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
              <option value="">No project</option>
              {projects.map(project => (<option key={project._id} value={project._id}>{project.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Agenda</label>
            <textarea value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} placeholder="Meeting agenda and topics" rows="3" maxLength={500} />
          </div>

          <div className="form-group">
            <label>
              Participants * 
              <span className="participant-count">({formData.employeeParticipants.length + formData.clientParticipants.length} selected)</span>
            </label>
            
            <div className="participant-tabs">
              <button type="button" className={`participant-tab ${participantType === 'employees' ? 'active' : ''}`} onClick={() => setParticipantType('employees')}>
                <FiUsers /> Employees ({formData.employeeParticipants.length})
              </button>
              <button type="button" className={`participant-tab ${participantType === 'clients' ? 'active' : ''}`} onClick={() => setParticipantType('clients')}>
                <FiUser /> Clients ({formData.clientParticipants.length})
              </button>
              <button type="button" className={`participant-tab ${participantType === 'both' ? 'active' : ''}`} onClick={() => setParticipantType('both')}>
                Both
              </button>
            </div>

            {(participantType === 'employees' || participantType === 'both') && (
              <div className="participants-selector">
                <h4 className="selector-title"><FiUsers /> Employees</h4>
                {employees.length > 0 ? (
                  employees.map(employee => (
                    <label key={employee._id} className="participant-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.employeeParticipants.includes(employee.userId)}
                        onChange={() => handleEmployeeToggle(employee)}
                      />
                      <div className="participant-info">
                        <span className="participant-name">{employee.name}</span>
                        <span className="participant-role">{employee.designation || employee.position} • {employee.email}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="no-participants">No employees available</p>
                )}
              </div>
            )}

            {(participantType === 'clients' || participantType === 'both') && (
              <div className="participants-selector">
                <h4 className="selector-title"><FiUser /> Clients</h4>
                {clients.length > 0 ? (
                  clients.map(client => (
                    <label key={client._id} className="participant-checkbox client-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.clientParticipants.includes(client.userId)}
                        onChange={() => handleClientToggle(client)}
                      />
                      <div className="participant-info">
                        <span className="participant-name">{client.name}</span>
                        <span className="participant-role">{client.company || client.companyName || 'Client'} • {client.email}</span>
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
            <button type="button" className="cancel-btn" onClick={() => { setShowEditModal(false); setSelectedMeeting(null); resetForm(); }}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <FiEdit2 /> Update Meeting
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MeetingList;