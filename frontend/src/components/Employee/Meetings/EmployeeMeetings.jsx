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
  FiFilter
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

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchTerm, filterType]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getMyMeetings();
      
      console.log('API Response:', response); // Debug
      
      // FIX: Extract the meetings array from response.data
      if (response.data) {
        // Check if response.data has a 'meetings' property (backend returns object)
        const meetingsData = response.data.meetings || response.data;
        
        // Ensure it's an array
        if (Array.isArray(meetingsData)) {
          setMeetings(meetingsData);
        } else {
          console.warn('Meetings data is not an array:', meetingsData);
          setMeetings([]);
        }
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
      setMeetings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = () => {
    // FIX: Ensure meetings is an array before spreading
    if (!Array.isArray(meetings)) {
      console.warn('Meetings is not an array:', meetings);
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

    // Type filter
    const now = new Date();
    if (filterType === 'upcoming') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.scheduledDate || meeting.date);
        return meetingDate >= now;
      });
    } else if (filterType === 'past') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.scheduledDate || meeting.date);
        return meetingDate < now;
      });
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledDate || a.date);
      const dateB = new Date(b.scheduledDate || b.date);
      return dateA - dateB;
    });

    setFilteredMeetings(filtered);
  };

  const handleViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate || meeting.date);
    
    // Calculate end time
    const duration = meeting.duration || 60; // default 60 minutes
    const meetingEndTime = new Date(meetingDate.getTime() + duration * 60000);

    if (meetingDate > now) {
      return { status: 'upcoming', label: 'Upcoming', color: '#2196f3' };
    } else if (meetingDate <= now && meetingEndTime >= now) {
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
            <FiFilter /> All Meetings
          </button>
          <button
            className={`employee-filter-btn ${filterType === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterType('upcoming')}
          >
            <FiCalendar /> Upcoming
          </button>
          <button
            className={`employee-filter-btn ${filterType === 'past' ? 'active' : ''}`}
            onClick={() => setFilterType('past')}
          >
            <FiClock /> Past
          </button>
        </div>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="meetings-grid">
          {filteredMeetings.map((meeting) => {
            const meetingStatus = getMeetingStatus(meeting);
            const meetingDate = meeting.scheduledDate || meeting.date;
            
            return (
              <Card key={meeting._id || meeting.id} className="meeting-card">
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
                        {getTimeUntilMeeting(meetingDate)}
                      </span>
                    )}
                  </div>
                  <div className="meeting-type">
                    {meeting.type === 'video' || meeting.type === 'online' ? (
                      <span className="type-badge video">
                        <FiVideo /> Video Call
                      </span>
                    ) : (
                      <span className="type-badge physical">
                        <FiMapPin /> In-Person
                      </span>
                    )}
                  </div>
                </div>

                <div className="meeting-card-body">
                  <h3>{meeting.title}</h3>
                  <p className="meeting-description">
                    {meeting.description || 'No description provided'}
                  </p>

                  <div className="meeting-details">
                    <div className="detail-item">
                      <FiCalendar />
                      <span>{formatDate(meetingDate)}</span>
                    </div>
                    <div className="detail-item">
                      <FiClock />
                      <span>
                        {formatTime(meetingDate)} ({meeting.duration || 60} min)
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
                        {meeting.organizer.name || meeting.organizer}
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
                  {meeting.meetingLink && meetingStatus.status !== 'completed' && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => window.open(meeting.meetingLink, '_blank')}
                    >
                      <FiVideo /> Join Meeting
                    </Button>
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
        >
          <div className="meeting-details-modal">
            <div className="modal-section">
              <h4>{selectedMeeting.title}</h4>
              <p>{selectedMeeting.description || 'No description provided'}</p>
            </div>

            <div className="modal-section">
              <h5>Date & Time</h5>
              <div className="detail-row">
                <FiCalendar />
                <span>{formatDate(selectedMeeting.scheduledDate || selectedMeeting.date)}</span>
              </div>
              <div className="detail-row">
                <FiClock />
                <span>
                  {formatTime(selectedMeeting.scheduledDate || selectedMeeting.date)} 
                  ({selectedMeeting.duration || 60} minutes)
                </span>
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
                  <p><strong>{selectedMeeting.organizer.name || selectedMeeting.organizer}</strong></p>
                  {selectedMeeting.organizer.email && (
                    <p>{selectedMeeting.organizer.email}</p>
                  )}
                </div>
              </div>
            )}

            {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
              <div className="modal-section">
                <h5>Participants ({selectedMeeting.participants.length})</h5>
                <div className="participants-list">
                  {selectedMeeting.participants.map((participant, index) => {
                    const user = participant.user || participant;
                    return (
                      <div key={index} className="participant-item">
                        <div className="participant-avatar">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="participant-info">
                          <p className="participant-name">{user.name || 'Unknown'}</p>
                          <p className="participant-role">{user.role || participant.status || 'Participant'}</p>
                        </div>
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
                  {selectedMeeting.minutes}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMeeting(null);
                }}
              >
                Close
              </Button>
              {selectedMeeting.meetingLink && getMeetingStatus(selectedMeeting).status !== 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => window.open(selectedMeeting.meetingLink, '_blank')}
                >
                  <FiVideo /> Join Meeting
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default EmployeeMeetings;