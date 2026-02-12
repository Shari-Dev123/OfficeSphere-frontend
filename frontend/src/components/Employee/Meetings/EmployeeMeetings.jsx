import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiVideo,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { MdMeetingRoom } from 'react-icons/md';
import Card from '../../Shared/Card/Card';
import Button from '../../Shared/Button/Button';
import Modal from '../../Shared/Modal/Modal';
import './EmployeeMeetings.css';

function EmployeeMeetings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, upcoming, past
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchTerm, filterType]);

  const fetchMeetings = async () => {
    try {
      console.log('====================================');
      console.log('📥 FETCHING EMPLOYEE MEETINGS');
      console.log('====================================');
      
      setLoading(true);
      const response = await employeeAPI.getMyMeetings();
      
      console.log('API Response:', response);
      
      // ✅ FIX: Extract the meetings array from response.data
      if (response.data) {
        // Backend returns { success, count, meetings }
        const meetingsData = response.data.meetings || response.data;
        
        console.log('Meetings data:', meetingsData);
        console.log('Is array?', Array.isArray(meetingsData));
        
        // Ensure it's an array
        if (Array.isArray(meetingsData)) {
          console.log(`✅ Loaded ${meetingsData.length} meetings`);
          setMeetings(meetingsData);
        } else {
          console.warn('⚠️ Meetings data is not an array:', meetingsData);
          setMeetings([]);
        }
      } else {
        console.warn('⚠️ No data in response');
        setMeetings([]);
      }
      
      console.log('====================================');
    } catch (error) {
      console.error('====================================');
      console.error('❌ ERROR FETCHING MEETINGS');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('====================================');
      
      toast.error(error.response?.data?.message || 'Failed to load meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = () => {
    // ✅ FIX: Ensure meetings is an array before spreading
    if (!Array.isArray(meetings)) {
      console.warn('⚠️ Meetings is not an array:', meetings);
      setFilteredMeetings([]);
      return;
    }

    let filtered = [...meetings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting => 
        meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ✅ FIX: Use startTime from backend (not scheduledDate/date)
    const now = new Date();
    if (filterType === 'upcoming') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate >= now;
      });
    } else if (filterType === 'past') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate < now;
      });
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return dateA - dateB;
    });

    setFilteredMeetings(filtered);
  };

  const handleViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
  };

  // ✅ NEW: Update participant status (Accept/Decline)
  const handleUpdateStatus = async (meetingId, status) => {
    try {
      setUpdatingStatus(true);
      console.log(`Updating meeting ${meetingId} status to ${status}`);
      
      await employeeAPI.updateMeetingStatus(meetingId, status);
      
      toast.success(`Meeting ${status === 'Accepted' ? 'accepted' : 'declined'} successfully`);
      
      // Refresh meetings
      await fetchMeetings();
      
      // Close modal if open
      if (showDetailsModal) {
        setShowDetailsModal(false);
        setSelectedMeeting(null);
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast.error(error.response?.data?.message || 'Failed to update meeting status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ✅ FIX: Use startTime and endTime from backend
  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const meetingStart = new Date(meeting.startTime);
    const meetingEnd = new Date(meeting.endTime);

    if (meetingStart > now) {
      return { status: 'upcoming', label: 'Upcoming', color: '#2196f3' };
    } else if (meetingStart <= now && meetingEnd >= now) {
      return { status: 'ongoing', label: 'Ongoing', color: '#4caf50' };
    } else {
      return { status: 'completed', label: 'Completed', color: '#9e9e9e' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilMeeting = (date) => {
    const now = new Date();
    const meetingDate = new Date(date);
    const diff = meetingDate - now;

    if (diff < 0) return 'Past';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // ✅ NEW: Get participant's status for this meeting
  const getMyStatus = (meeting) => {
    if (!user || !meeting.participants) return null;
    
    const myParticipant = meeting.participants.find(
      p => p.user?._id === user.id || p.user?._id === user._id
    );
    
    return myParticipant?.status || 'Invited';
  };

  if (loading) {
    return (
      <div className="employee-meetings">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-meetings">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <MdMeetingRoom /> My Meetings
          </h1>
          <p>View and manage your scheduled meetings</p>
        </div>
      </div>

      {/* Stats */}
      {meetings.length > 0 && (
        <div className="meetings-stats">
          <div className="stat-card">
            <span className="stat-value">{meetings.length}</span>
            <span className="stat-label">Total Meetings</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {meetings.filter(m => new Date(m.startTime) >= new Date()).length}
            </span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {meetings.filter(m => {
                const myStatus = getMyStatus(m);
                return myStatus === 'Accepted';
              }).length}
            </span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="meetings-filters">
        <div className="employee-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="employee-filter-buttons">
          <button
            className={`employee-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <FiFilter /> All ({meetings.length})
          </button>
          <button
            className={`employee-filter-btn ${filterType === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterType('upcoming')}
          >
            <FiCalendar /> Upcoming ({meetings.filter(m => new Date(m.startTime) >= new Date()).length})
          </button>
          <button
            className={`employee-filter-btn ${filterType === 'past' ? 'active' : ''}`}
            onClick={() => setFilterType('past')}
          >
            <FiClock /> Past ({meetings.filter(m => new Date(m.startTime) < new Date()).length})
          </button>
        </div>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-grid">
          {filteredMeetings.map((meeting) => {
            const meetingStatus = getMeetingStatus(meeting);
            const myStatus = getMyStatus(meeting);
            
            return (
              <Card key={meeting._id} className="meeting-card">
                <div className="meeting-card-header">
                  <div className="meeting-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: meetingStatus.color }}
                    >
                      {meetingStatus.label}
                    </span>
                    {meetingStatus.status === 'upcoming' && (
                      <span className="time-until">
                        {getTimeUntilMeeting(meeting.startTime)}
                      </span>
                    )}
                  </div>
                  <div className="meeting-type">
                    {/* ✅ Show participant status */}
                    {myStatus && (
                      <span className={`participant-status ${myStatus.toLowerCase()}`}>
                        {myStatus === 'Accepted' && <FiCheckCircle />}
                        {myStatus === 'Declined' && <FiXCircle />}
                        {myStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="meeting-card-body">
                  <h3>{meeting.title}</h3>
                  {meeting.type && (
                    <span className="meeting-type-badge">{meeting.type}</span>
                  )}
                  <p className="meeting-description">
                    {meeting.description || 'No description provided'}
                  </p>

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
                    {meeting.location && (
                      <div className="detail-item">
                        <FiMapPin />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="detail-item">
                        <FiUsers />
                        <span>{meeting.participants.length} Participants</span>
                      </div>
                    )}
                  </div>

                  {meeting.organizer && (
                    <div className="meeting-organizer">
                      <span>Organized by: </span>
                      <strong>
                        {meeting.organizer.name || meeting.organizer.email || 'Unknown'}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="meeting-card-footer">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleViewDetails(meeting)}
                  >
                    View Details
                  </Button>
                  
                  {/* ✅ Show Join button if meeting has link and is upcoming/ongoing */}
                  {meeting.meetingLink && meetingStatus.status !== 'completed' && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => window.open(meeting.meetingLink, '_blank')}
                    >
                      <FiVideo /> Join Meeting
                    </Button>
                  )}
                  
                  {/* ✅ Show Accept/Decline buttons for invited meetings */}
                  {myStatus === 'Invited' && meetingStatus.status === 'upcoming' && (
                    <>
                      <Button
                        variant="success"
                        size="small"
                        onClick={() => handleUpdateStatus(meeting._id, 'Accepted')}
                        disabled={updatingStatus}
                      >
                        <FiCheckCircle /> Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleUpdateStatus(meeting._id, 'Declined')}
                        disabled={updatingStatus}
                      >
                        <FiXCircle /> Decline
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="no-meetings">
          <MdMeetingRoom />
          <h3>No Meetings Found</h3>
          <p>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your filters or search term'
              : 'You have no scheduled meetings at the moment'}
          </p>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showDetailsModal && selectedMeeting && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMeeting(null);
          }}
          title="Meeting Details"
          size="large"
        >
          <div className="meeting-details-modal">
            <div className="modal-section">
              <h4>{selectedMeeting.title}</h4>
              {selectedMeeting.type && (
                <span className="meeting-type-badge">{selectedMeeting.type}</span>
              )}
              <p>{selectedMeeting.description || 'No description provided'}</p>
            </div>

            <div className="modal-section">
              <h5>Date & Time</h5>
              <div className="detail-row">
                <FiCalendar />
                <span>{formatDate(selectedMeeting.startTime)}</span>
              </div>
              <div className="detail-row">
                <FiClock />
                <span>
                  {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}
                </span>
              </div>
              <div className="detail-row">
                <FiClock />
                <span>Duration: {selectedMeeting.duration || 60} minutes</span>
              </div>
            </div>

            {selectedMeeting.location && (
              <div className="modal-section">
                <h5>Location</h5>
                <div className="detail-row">
                  <FiMapPin />
                  <span>{selectedMeeting.location}</span>
                </div>
              </div>
            )}

            {selectedMeeting.organizer && (
              <div className="modal-section">
                <h5>Organizer</h5>
                <div className="organizer-info">
                  <p><strong>{selectedMeeting.organizer.name || 'Unknown'}</strong></p>
                  {selectedMeeting.organizer.email && (
                    <p className="text-muted">{selectedMeeting.organizer.email}</p>
                  )}
                </div>
              </div>
            )}

            {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
              <div className="modal-section">
                <h5>Participants ({selectedMeeting.participants.length})</h5>
                <div className="participants-list">
                  {selectedMeeting.participants.map((participant, index) => {
                    const participantUser = participant.user || participant;
                    return (
                      <div key={index} className="participant-item">
                        <div className="participant-avatar">
                          {participantUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="participant-info">
                          <p className="participant-name">{participantUser.name || 'Unknown'}</p>
                          <p className="participant-role">
                            {participantUser.role ? `${participantUser.role} • ` : ''}
                            {participant.status || 'Invited'}
                          </p>
                        </div>
                        {participant.status && (
                          <span className={`participant-status-badge ${participant.status.toLowerCase()}`}>
                            {participant.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedMeeting.agenda && (
              <div className="modal-section">
                <h5>Agenda</h5>
                <div className="agenda-content">
                  {selectedMeeting.agenda}
                </div>
              </div>
            )}

            {selectedMeeting.meetingLink && (
              <div className="modal-section">
                <h5>Meeting Link</h5>
                <div className="meeting-link">
                  <a 
                    href={selectedMeeting.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-button"
                  >
                    <FiVideo /> Join Video Meeting
                  </a>
                </div>
              </div>
            )}

            {selectedMeeting.minutes && (
              <div className="modal-section">
                <h5>Meeting Minutes</h5>
                <div className="minutes-content">
                  <p><strong>Discussion:</strong></p>
                  <p>{selectedMeeting.minutes.discussion || 'N/A'}</p>
                  
                  {selectedMeeting.minutes.decisions && (
                    <>
                      <p><strong>Decisions:</strong></p>
                      <p>{selectedMeeting.minutes.decisions}</p>
                    </>
                  )}
                  
                  {selectedMeeting.minutes.actionItems && (
                    <>
                      <p><strong>Action Items:</strong></p>
                      <p>{selectedMeeting.minutes.actionItems}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="modal-actions">
              {/* ✅ Accept/Decline buttons for invited meetings */}
              {getMyStatus(selectedMeeting) === 'Invited' && 
               getMeetingStatus(selectedMeeting).status === 'upcoming' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedMeeting._id, 'Accepted')}
                    disabled={updatingStatus}
                  >
                    <FiCheckCircle /> Accept Meeting
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedMeeting._id, 'Declined')}
                    disabled={updatingStatus}
                  >
                    <FiXCircle /> Decline Meeting
                  </Button>
                </>
              )}
              
              {selectedMeeting.meetingLink && 
               getMeetingStatus(selectedMeeting).status !== 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => window.open(selectedMeeting.meetingLink, '_blank')}
                >
                  <FiVideo /> Join Meeting
                </Button>
              )}
              
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMeeting(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default EmployeeMeetings;